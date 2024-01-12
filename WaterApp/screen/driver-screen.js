import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, SafeAreaView, TouchableOpacity, FlatList, View, Linking, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { updateDoc, doc, collection, query, where, getDocs, deleteDoc, getDoc } from 'firebase/firestore';
import { signOut, getAuth } from 'firebase/auth';
import { db } from '../firebase/firebase-config';

const Test = ({ navigation }) => {
  const auth = getAuth();
  const [position, setPosition] = useState({
    latitude: null,
    longitude: null,
    latitudeDelta: 0.0421,
    longitudeDelta: 0.0421,
  });
  const [deliveries, setDeliveries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const userRef = doc(db, 'User', auth.currentUser.uid);
        const deliveriesQuery = query(collection(userRef, 'delivery'));
        const querySnapshot = await getDocs(deliveriesQuery);
        const deliveriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDeliveries(deliveriesData);
      } catch (error) {
        console.error('Error fetching deliveries:', error);
      } finally {
        // Después de cargar las entregas, detenemos la animación de actualización
        setRefreshing(false);
      }
    };

    fetchDeliveries();

    const updateLocation = async (pos) => {
      const crd = pos.coords;
      setPosition({
        latitude: crd.latitude,
        longitude: crd.longitude,
        latitudeDelta: 0.0421,
        longitudeDelta: 0.0421,
      });

      // Guardar la ubicación en Firestore
      try {
        const userRef = doc(db, 'User', auth.currentUser.uid);
        await updateDoc(userRef, {
          latitude: crd.latitude,
          longitude: crd.longitude,
        });
      } catch (error) {
        console.error('Error updating location in Firestore:', error);
      }
    };

    const watchId = Geolocation.getCurrentPosition(
      updateLocation,
      (err) => {
        console.log(err);
      },
      { enableHighAccuracy: true, distanceFilter: 10 }
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, [auth, refreshing]);

  const handleLogout = async () => {
    try {
      // Actualizar el campo 'estado' a 'inactivo'
      const userRef = doc(db, 'User', auth.currentUser.uid);
      await updateDoc(userRef, { estado: 'inactivo' });

      await signOut(auth);
      navigation.navigate('Login');
      console.log('Logout successful');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error when logging out:', error);
    }
  };

  const deleteDeliveryFromConductor = async (deliveryId) => {
    try {
      const userRef = doc(db, 'User', auth.currentUser.uid);
      const deliveryDocRef = doc(collection(userRef, 'delivery'), deliveryId);
      const deliveryData = (await getDoc(deliveryDocRef)).data();

      // Mostrar alerta de confirmación antes de enviar el correo electrónico y eliminar
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
              // Enviar el correo electrónico
              await sendEmail(deliveryData);

              // Eliminar el pedido
              await deleteDoc(deliveryDocRef);

              // Vuelve a cargar la lista de entregas (sin necesidad de la función fetchDeliveries)
              try {
                const userRef = doc(db, 'User', auth.currentUser.uid);
                const deliveriesQuery = query(collection(userRef, 'delivery'));
                const querySnapshot = await getDocs(deliveriesQuery);
                const deliveriesData = querySnapshot.docs.map((doc) => ({
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
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error deleting delivery:', error);
    }
  };

  const sendEmail = async (deliveryData) => {
    try {
      const email = 'joseph.marulanda@uao.edu.co';
      const subject = `Completed the delivery of ${deliveryData.name}`;
      const body = `Detalles del delivery:
        Nombre: ${deliveryData.name}
        Phone: ${deliveryData.Phone}
        Address: ${deliveryData.Address}
        Neighborhood: ${deliveryData.neighborhood}
        Description: ${deliveryData.description}`;

      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      await Linking.openURL(mailtoLink);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      // Iniciar la animación de actualización
      setRefreshing(true);

      // Vuelve a cargar la lista de entregas
      try {
        const userRef = doc(db, 'User', auth.currentUser.uid);
        const deliveriesQuery = query(collection(userRef, 'delivery'));
        const querySnapshot = await getDocs(deliveriesQuery);
        const deliveriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDeliveries(deliveriesData);

        // Muestra un mensaje o alerta indicando que la lista se ha actualizado correctamente
        Alert.alert('Refreshed', 'Delivery list updated successfully');
      } catch (error) {
        console.error('Error fetching deliveries:', error);
      } finally {
        // Después de cargar las entregas, detenemos la animación de actualización
        setRefreshing(false);
      }
    } catch (error) {
      console.error('Error refreshing deliveries:', error);
    } finally {
      // Después de cargar las entregas, detenemos la animación de actualización
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Delivery Details</Text>
      </View>
      {position.latitude !== null && position.longitude !== null && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>Latitude: {position.latitude}</Text>
          <Text style={styles.locationText}>Longitude: {position.longitude}</Text>
        </View>
      )}
   <FlatList
        data={deliveries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View key={item.id} style={styles.deliveryContainer}>
            <Text style={styles.deliveryTitle}>Delivery ID: {item.id}</Text>
            <Text style={styles.deliveryText}>Name: {item.name}</Text>
            <Text style={styles.deliveryText}>Phone: {item.Phone}</Text>
            <Text style={styles.deliveryText}>Address: {item.Address}</Text>
            <Text style={styles.deliveryText}>Neighborhood: {item.neighborhood}</Text>
            <Text style={styles.deliveryText}>Description: {item.description}</Text>
            <TouchableOpacity
              style={styles.emailButton}
              onPress={() => deleteDeliveryFromConductor(item.id)}
            >
              <Text style={styles.emailButtonText}>Enviar Email y Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
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
    backgroundColor: '#3498db',
    paddingVertical: 10,
    marginBottom: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
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
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  deliveryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 10,
  },
  deliveryText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 5,
  },
  emailButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  emailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#000',
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Test;
