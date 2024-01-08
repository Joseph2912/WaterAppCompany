// DriverDetailsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

const DriverDetailsScreen = ({ route, navigation }) => {
  const { driverInfo } = route.params;
  const [deliveryDetails, setDeliveryDetails] = useState([]);

  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      try {
        const deliveriesCollection = collection(db, 'User', driverInfo.id, 'delivery');
        const deliveriesSnapshot = await getDocs(deliveriesCollection);

        const details = deliveriesSnapshot.docs.map(deliveryDoc => {
          const deliveryData = deliveryDoc.data();
          return {
            id: deliveryDoc.id,
            name: deliveryData.name || 'Unnamed Delivery',
            Phone: deliveryData.Phone || 'No phone',
            address: deliveryData.Address || 'No Address',
            neighborhood: deliveryData.neighborhood || 'No Address',
            description: deliveryData.description || 'No Address',
          };
        });

        setDeliveryDetails(details);
      } catch (error) {
        console.error('Error fetching delivery details from Firestore', error);
      }
    };

    fetchDeliveryDetails();
  }, [driverInfo]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to AdminDrivers</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Driver Details:</Text>
      <View style={styles.detailsContainer}>
        <Text style={styles.text}>Name: {driverInfo.name}</Text>
        <Text style={styles.text}>Email: {driverInfo.email}</Text>
      </View>

      <Text style={styles.sectionTitle}>Delivery Details:</Text>
      {deliveryDetails.map((delivery, index) => (
        <View key={index} style={styles.deliveryContainer}>
          <Text style={styles.deliveryTitle}>{`Delivery ${index + 1} Details:`}</Text>
          <Text style={styles.text}>Name: {delivery.name}</Text>
          <Text style={styles.text}>Phone: {delivery.Phone}</Text>
          <Text style={styles.text}>Address: {delivery.address}</Text>
          <Text style={styles.text}>Neighborhood: {delivery.neighborhood}</Text>
          <Text style={styles.text}>Description: {delivery.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  deliveryContainer: {
    marginBottom: 15,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  backButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default DriverDetailsScreen;
