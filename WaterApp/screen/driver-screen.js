import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  View,
  Linking,
  Alert,
  TextInput,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  updateDoc,
  doc,
  collection,
  query,
  getDocs,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import {getAuth} from 'firebase/auth';
import {db} from '../firebase/firebase-config';
import Icon from 'react-native-vector-icons/Feather';

const DriverScreen = ({navigation}) => {
  const auth = getAuth();

  const [position, setPosition] = useState({
    latitude: null,
    longitude: null,
    latitudeDelta: 0.0421,
    longitudeDelta: 0.0421,
  });
  const [deliveries, setDeliveries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [locationObtained, setLocationObtained] = useState(false);
  const [deliveryInputs, setDeliveryInputs] = useState([]);
  const [driverName, setDriverName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRef = doc(db, 'User', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        // Resto del código...
        // Obtener el nombre del conductor
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setDriverName(userData.name || '');
        }
        const deliveriesQuery = query(collection(userRef, 'delivery'));
        const querySnapshot = await getDocs(deliveriesQuery);
        const deliveriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        const deliveriesDataWithInputs = deliveriesData.map(delivery => ({
          ...delivery,
          amountEntered: '',
          information: '',
        }));

        setDeliveryInputs(deliveriesDataWithInputs);
        setDeliveries(deliveriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setRefreshing(false);
      }
    };

    const updateLocation = async pos => {
      const crd = pos.coords;
      const distance = calculateDistance(
        position.latitude,
        position.longitude,
        crd.latitude,
        crd.longitude,
      );

      if (distance >= 10) {
        try {
          const userRef = doc(db, 'User', auth.currentUser.uid);
          await updateDoc(userRef, {
            latitude: crd.latitude,
            longitude: crd.longitude,
          });

          setPosition({
            latitude: crd.latitude,
            longitude: crd.longitude,
            latitudeDelta: 0.0421,
            longitudeDelta: 0.0421,
          });

          setLocationObtained(true);
        } catch (error) {
          console.error('Error updating location in Firestore:', error);
          setLocationObtained(true);
        }
      }
    };

    const watchId = Geolocation.watchPosition(
      updateLocation,
      err => {
        console.error(err);
        setLocationObtained(true);
      },
      {enableHighAccuracy: true, distanceFilter: 10},
    );

    fetchData(); // Llamada inicial para cargar datos al entrar a la pantalla

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, [auth]); // Solo se ejecutará cuando 'auth' cambie

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance * 1000;
  };

  const deg2rad = deg => {
    return deg * (Math.PI / 180);
  };

  const handleCheckboxChange = (itemIndex, paymentMethod) => {
    const updatedDeliveries = [...deliveries];
    updatedDeliveries[itemIndex][paymentMethod] =
      !updatedDeliveries[itemIndex][paymentMethod];

    // Agregar console.log para depurar
    console.log(
      `Checkbox state updated: ${paymentMethod} - ${updatedDeliveries[itemIndex][paymentMethod]}`,
    );

    setDeliveries(updatedDeliveries);
  };

  const updateDeliveryInputs = (itemIndex, field, value) => {
    const updatedInputs = [...deliveryInputs];
    updatedInputs[itemIndex][field] = value;

    // Reset values for the next delivery
    if (itemIndex < updatedInputs.length - 1) {
      updatedInputs[itemIndex + 1].amountEntered = '';
      updatedInputs[itemIndex + 1].information = '';
    }

    setDeliveryInputs(updatedInputs);
  };

  const deleteDeliveryFromConductor = async (deliveryId, itemIndex) => {
    try {
      const userRef = doc(db, 'User', auth.currentUser.uid);
      const deliveryDocRef = doc(collection(userRef, 'delivery'), deliveryId);
      const deliveryData = (await getDoc(deliveryDocRef)).data();

      // Check if either 'cash' or 'charge' is selected
      if (
        !deliveries[itemIndex].cashChecked &&
        !deliveries[itemIndex].chargeChecked
      ) {
        Alert.alert(
          'Alert',
          'Please select either Cash or Charge payment method.',
        );
        return;
      }

      // Check if 'amountEntered' is filled
      if (!deliveryInputs[itemIndex]?.amountEntered) {
        Alert.alert(
          'Alert',
          'Please enter the received amount before completing the delivery.',
        );
        return;
      }

      Alert.alert(
        'Confirmation',
        'Are you sure you have completed the delivery?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: async () => {
              await sendEmail(
                deliveryData,
                deliveries[itemIndex].cashChecked,
                deliveries[itemIndex].chargeChecked,
                deliveryInputs[itemIndex]?.amountEntered || '',
                deliveryInputs[itemIndex]?.information || '',
                itemIndex, // Pass the index here
              );

              await deleteDoc(deliveryDocRef);

              try {
                const updatedDeliveries = [...deliveries];
                updatedDeliveries.splice(itemIndex, 1); // Remove the completed delivery from the state
                setDeliveries(updatedDeliveries);
              } catch (error) {
                console.error('Error updating deliveries state:', error);
              }

              // Add the code to update the Clients collection here
              const clientsRef = collection(db, 'Clients');
              const phoneNumber = deliveryId;
              const clientDocRef = doc(clientsRef, phoneNumber);

              await updateDoc(clientDocRef, {
                conductorAsignado: '',
                driverName: '',
              });
            },
          },
        ],
        {cancelable: false},
      );
    } catch (error) {
      console.error('Error deleting delivery:', error);
    }
  };

  const sendEmail = async (
    deliveryData,
    cashChecked,
    chargeChecked,
    amountEntered,
    information,
    index,
  ) => {
    try {
      const email = 'joseph.marulanda@uao.edu.co';
      const subject = `Completed the delivery of ${deliveryData.name}`;

      // Usar el estado driverName en el cuerpo del correo electrónic

      const cashStatus = cashChecked ? 'Yes' : 'No';
      const chargeStatus = chargeChecked ? 'Yes' : 'No';

      const receivedAmount = amountEntered || '';
      const additionalInformation = information || '';

      console.log(
        `Email details - Cash: ${cashStatus}, Charge: ${chargeStatus}, Received amount: $${amountEntered}, Additional information: ${information}`,
      );

      const body = `
INVOICER
N° ${deliveryData.consecutive}

Signature: ${driverName} 
--------------------------------------------------
Client Information

Name: ${deliveryData.name}
Phone: ${deliveryData.Phone}
Address: ${deliveryData.Address}
Neighborhood: ${deliveryData.neighborhood}
Description: ${deliveryData.description}
---------------------------------------------------
Payment details

Cash: ${cashStatus}
Charge: ${chargeStatus}
Received amount: $${receivedAmount}
Additional information: ${additionalInformation}
      `;

      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;

      await Linking.openURL(mailtoLink);
      deliveryInputs[index] = {amountEntered: '', information: ''};
      setDeliveryInputs(deliveryInputs);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      try {
        const userRef = doc(db, 'User', auth.currentUser.uid);
        const deliveriesQuery = query(collection(userRef, 'delivery'));
        const querySnapshot = await getDocs(deliveriesQuery);
        const deliveriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          cashChecked: false,
          chargeChecked: false,
        }));

        // Reset deliveryInputs state
        const deliveriesDataWithInputs = deliveriesData.map(delivery => ({
          ...delivery,
          amountEntered: '',
          information: '',
        }));
        setDeliveryInputs(deliveriesDataWithInputs);

        setDeliveries(deliveriesData);
      } catch (error) {
        console.error('Error fetching deliveries:', error);
      } finally {
        setRefreshing(false);
      }
    } catch (error) {
      console.error('Error refreshing deliveries:', error);
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.menu}
        onPress={() => navigation.openDrawer()}>
        <Icon name="menu" size={30} color="black" />
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.headertittle}>All Deliveries</Text>
        <TouchableOpacity
          style={styles.map}
          onPress={() => navigation.navigate('MapScreen')}>
          <Icon name="map-pin" size={20} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.headertext}>
        <Text style={styles.Text}>Here you can see all your deliveries.</Text>
      </View>
      <FlatList
        data={deliveries.map((delivery, index) => ({
          ...delivery,
          amountEntered: deliveryInputs[index]?.amountEntered || '',
          information: deliveryInputs[index]?.information || '',
        }))}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => (
          <View key={item.id} style={styles.deliveryContainer}>
            <View style={styles.idcontainer}>
              <Text style={styles.deliveryTitle}>DELIVERY ID:</Text>
              <Text style={styles.deliveryinfoid}># {item.consecutive}</Text>
            </View>
            <View style={styles.infocontainer}>
              <Text style={styles.paymentText}>Customer Information</Text>
              <Text style={styles.deliveryText}>
                NAME: <Text style={styles.deliveryinfo}>{item.name}</Text>
              </Text>
            </View>
            <View style={styles.infocontainer}>
              <Text style={styles.deliveryText}>
                PHONE: <Text style={styles.deliveryinfo}>{item.Phone}</Text>
              </Text>
            </View>
            <View style={styles.infocontainer}>
              <Text style={styles.deliveryText}>
                ADDRESS: <Text style={styles.deliveryinfo}>{item.Address}</Text>
              </Text>
            </View>
            <View style={styles.infocontainer}>
              <Text style={styles.deliveryText}>
                NEIGHBORHOOD:{' '}
                <Text style={styles.deliveryinfo}> {item.neighborhood}</Text>
              </Text>
            </View>
            <View style={styles.infocontainer}>
              <Text style={styles.deliveryText}>
                COMMENT:{' '}
                <Text style={styles.deliveryinfo}>{item.description}</Text>
              </Text>
            </View>
            <View style={styles.paymentContainer}>
              <View style={styles.checkboxContainer}>
                <Text style={styles.paymentText}>Payment:</Text>
                <View style={styles.test}>
                  <View style={styles.touchable}>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        item.cashChecked && styles.checkedCheckbox,
                      ]}
                      onPress={() =>
                        handleCheckboxChange(index, 'cashChecked')
                      }></TouchableOpacity>
                    <Text style={styles.checkboxText}>Cash</Text>
                  </View>
                  <View style={styles.touchable}>
                    <TouchableOpacity
                      style={[
                        styles.checkbox,
                        item.chargeChecked && styles.checkedCheckbox,
                      ]}
                      onPress={() =>
                        handleCheckboxChange(index, 'chargeChecked')
                      }></TouchableOpacity>
                    <Text style={styles.checkboxText}>Charge</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.paymentText}>Received Amount</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                maxLength={30}
                minLength={16}
                value={deliveryInputs[index]?.amountEntered || ''}
                onChangeText={text => {
                  updateDeliveryInputs(index, 'amountEntered', text);
                }}
              />
              <Text style={styles.paymentText}>Additional Information</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="default"
                maxLength={244}
                value={deliveryInputs[index]?.information || ''}
                onChangeText={text => {
                  updateDeliveryInputs(index, 'information', text);
                }}
              />
            </View>
            <TouchableOpacity
              style={styles.emailButton}
              onPress={() => deleteDeliveryFromConductor(item.id, index)}>
              <Text style={styles.emailButtonText}>DELIVERED</Text>
            </TouchableOpacity>
          </View>
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  header: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headertittle: {
    color: '#333',
    fontSize: 28,
    fontFamily: 'Roboto-Bold',
  },
  test: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
    marginLeft: 30,
  },
  map: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#007aff',
    height: 40,
    width: 40,
  },
  headertext: {
    padding: 10,
    marginBottom: 20,
  },
  idcontainer: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderColor: '#ddd',
  },
  infocontainer: {
    padding: 2,
    paddingLeft: 10,
    justifyContent: 'space-between',
  },
  Text: {
    color: '#777',
    fontSize: 17,
    textAlign: 'left',
    fontFamily: 'Nunito-Medium',
  },
  touchable: {
    flexDirection: 'row',
    width: 'auto',
    marginRight: 30,
  },
  menu: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 10,
    height: 50,
    width: 50,
    backgroundColor: '#eee',
  },
  deliveryinfoid: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'Nunito-Medium',
  },
  deliveryinfo: {
    color: '#333',
    fontSize: 17,
    fontFamily: 'Nunito-Medium',
  },
  locationInfo: {
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
  },
  deliveryContainer: {
    padding: 15,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
  },
  deliveryTitle: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    color: '#999',
    marginBottom: 10,
  },
  deliveryText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  emailButton: {
    backgroundColor: '#007aff',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    height: 48,
  },
  emailButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Nunito-Medium',
  },
  logoutButton: {
    backgroundColor: '#000',
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
  },
  logoutButtonText: {
    fontFamily: 'Nunito-Medium',
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  paymentContainer: {
    borderTopWidth: 1.5,
    borderColor: '#ddd',
    marginTop: 10,
    paddingTop: 20,
    marginBottom: 15,
    paddingLeft: 10,
  },
  paymentText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkedCheckbox: {
    backgroundColor: '#007aff',
  },
  checkboxText: {
    color: 'black',
    fontFamily: 'Nunito-Medium',
    fontSize: 16,
  },
  amountInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    fontFamily: 'Nunito-Medium',
    fontSize: 16,
    color: '#000',
  },
  signatureContainer: {
    marginTop: 20,
  },
  signatureText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    color: '#333',
  },
});

export default DriverScreen;
