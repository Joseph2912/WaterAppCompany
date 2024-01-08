// Test.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

function Test() {
  const auth = getAuth();
  const navigation = useNavigation();
  const [assignedDeliveries, setAssignedDeliveries] = useState([]);

  useEffect(() => {
    const fetchAssignedDeliveries = async () => {
      try {
        const deliveriesCollection = collection(db, 'User', auth.currentUser.uid, 'delivery');
        const assignedDeliveriesQuery = query(deliveriesCollection, where('assigned', '==', true));
        const assignedDeliveriesSnapshot = await getDocs(assignedDeliveriesQuery);

        const deliveries = assignedDeliveriesSnapshot.docs.map(deliveryDoc => {
          const deliveryData = deliveryDoc.data();
          return {
            id: deliveryDoc.id,
            name: deliveryData.name || 'Unnamed Delivery',
            // Agrega más detalles según sea necesario
          };
        });

        setAssignedDeliveries(deliveries);
      } catch (error) {
        console.error('Error fetching assigned deliveries from Firestore', error);
      }
    };

    fetchAssignedDeliveries();
  }, [auth.currentUser.uid]);

  const handleCompleteDelivery = async (deliveryId) => {
    try {
      const deliveryRef = doc(db, 'User', auth.currentUser.uid, 'delivery', deliveryId);
      await updateDoc(deliveryRef, { completed: true });

      // Aquí puedes implementar el código para enviar un correo al administrador
      // con los detalles del delivery completado

      console.log(`Delivery ${deliveryId} completed successfully.`);
    } catch (error) {
      console.error('Error completing delivery:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
      console.log('yeeeepp buddyyyyy');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error when logging out:', error);
    }
  };

  return (
    <View>
      <Text style={styles.title}>Test</Text>
      {assignedDeliveries.map((delivery, index) => (
        <TouchableOpacity
          key={index}
          style={styles.deliveryButton}
          onPress={() => handleCompleteDelivery(delivery.id)}>
          <Text style={styles.deliveryButtonText}>{`Complete Delivery ${index + 1}`}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={() => {
          handleLogout();
        }}>
        <Text style={styles.signOutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 44,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  deliveryButton: {
    backgroundColor: 'green',
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
  },
  deliveryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signOutButton: {
    backgroundColor: 'black',
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'light',
    textAlign: 'center',
  },
});

export default Test;
