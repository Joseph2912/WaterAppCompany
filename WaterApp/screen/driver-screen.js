/*import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  View,
  Linking,
  Alert,
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

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const userRef = doc(db, 'User', auth.currentUser.uid);
        const deliveriesQuery = query(collection(userRef, 'delivery'));
        const querySnapshot = await getDocs(deliveriesQuery);
        const deliveriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDeliveries(deliveriesData);
      } catch (error) {
        console.error('Error fetching deliveries:', error);
      } finally {
        setRefreshing(false);
      }
    };

    fetchDeliveries();

    const updateLocation = async pos => {
      const crd = pos.coords;

      // Calcular la distancia entre la ubicación actual y la última conocida
      const distance = calculateDistance(
        position.latitude,
        position.longitude,
        crd.latitude,
        crd.longitude,
      );

      if (distance >= 10) {
        // Actualizar si la distancia es mayor o igual a 10 metros
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

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, [auth, refreshing, position]);

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

  const deleteDeliveryFromConductor = async deliveryId => {
    try {
      const userRef = doc(db, 'User', auth.currentUser.uid);
      const deliveryDocRef = doc(collection(userRef, 'delivery'), deliveryId);
      const deliveryData = (await getDoc(deliveryDocRef)).data();

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
              await sendEmail(deliveryData);

              await deleteDoc(deliveryDocRef);

              try {
                const userRef = doc(db, 'User', auth.currentUser.uid);
                const deliveriesQuery = query(collection(userRef, 'delivery'));
                const querySnapshot = await getDocs(deliveriesQuery);
                const deliveriesData = querySnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data(),
                }));
                setDeliveries(deliveriesData);
              } catch (error) {
                console.error('Error fetching deliveries:', error);
              }
            },
          },
        ],
        {cancelable: false},
      );
    } catch (error) {
      console.error('Error deleting delivery:', error);
    }
  };

  const sendEmail = async deliveryData => {
    try {
      const email = 'joseph.marulanda@uao.edu.co';
      const subject = `Completed the delivery of ${deliveryData.name}`;
      const body = `Detalles del delivery:
        Nombre: ${deliveryData.name}
        Phone: ${deliveryData.Phone}
        Address: ${deliveryData.Address}
        Neighborhood: ${deliveryData.neighborhood}
        Description: ${deliveryData.description}`;

      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;
      await Linking.openURL(mailtoLink);
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
        }));
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
        data={deliveries}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View key={item.id} style={styles.deliveryContainer}>
            <View style={styles.idcontainer}>
              <Text style={styles.deliveryTitle}>DELIVERY ID:</Text>
              <Text style={styles.deliveryinfoid}># {item.id}</Text>
            </View>
            <View style={styles.infocontainer}>
              <Text style={styles.deliveryText}>NAME </Text>
              <Text style={styles.deliveryinfo}>{item.name}</Text>
            </View>
            <View style={styles.infocontainer}>
              <Text style={styles.deliveryText}>PHONE </Text>
              <Text style={styles.deliveryinfo}>{item.Phone}</Text>
            </View>
            <View style={styles.infocontainer}>
              <Text style={styles.deliveryText}>ADDRESS</Text>
              <Text style={styles.deliveryinfo}>{item.Address}</Text>
            </View>
            <View style={styles.infocontainer}>
              <Text style={styles.deliveryText}>NEIGHBORHOOD</Text>
              <Text style={styles.deliveryinfo}> {item.neighborhood}</Text>
            </View>
            <View style={styles.infocontainer}>
              <Text style={styles.deliveryText}>COMMENT:</Text>
              <Text style={styles.deliveryinfo}>{item.description}</Text>
            </View>
            <TouchableOpacity
              style={styles.emailButton}
              onPress={() => deleteDeliveryFromConductor(item.id)}>
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
    justifyContent: 'space-between',
  },
  infocontainer: {
    padding: 10,
    justifyContent: 'space-between',
  },
  Text: {
    color: '#777',
    fontSize: 17,
    textAlign: 'left',
    fontFamily: 'Nunito-Medium',
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
    marginTop: 10,
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
});

export default DriverScreen;
*/