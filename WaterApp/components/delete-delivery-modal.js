// Importa los módulos necesarios
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView,TouchableOpacity } from 'react-native';
import { Button, Checkbox, Card } from 'react-native-paper';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';

function DeleteDeliveryModal({
  isVisible,
  onClose,
  driverInfo,
  onDeleteDelivery,
}) {
  const [deliveryList, setDeliveryList] = useState([]);
  const [selectedDeliveries, setSelectedDeliveries] = useState([]);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const deliveriesCollection = collection(
          db,
          'User',
          driverInfo.id,
          'delivery'
        );
        const deliveriesSnapshot = await getDocs(deliveriesCollection);

        const deliveriesData = deliveriesSnapshot.docs.map(deliveryDoc => ({
          id: deliveryDoc.id,
          ...deliveryDoc.data(),
        }));

        setDeliveryList(deliveriesData);
      } catch (error) {
        console.error('Error fetching deliveries:', error);
      }
    };

    if (isVisible) {
      fetchDeliveries();
    }
  }, [isVisible, driverInfo.id]);

  const handleDeleteDeliveries = async () => {
    try {
      // Itera sobre los deliverys seleccionados y elimínalos
      await Promise.all(
        selectedDeliveries.map(async deliveryId => {
          const deliveryRef = doc(
            db,
            'User',
            driverInfo.id,
            'delivery',
            deliveryId
          );
          await deleteDoc(deliveryRef);
        })
      );

      // Llama a la función onDeleteDelivery con los IDs de los deliverys eliminados
      onDeleteDelivery(selectedDeliveries);

      // Cierra el modal
      onClose();
    } catch (error) {
      console.error('Error deleting deliveries:', error);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Select deliveries to delete:</Text>
      <ScrollView style={styles.deliveryListScrollView}>
        {deliveryList.map(delivery => (
          <TouchableOpacity
            key={delivery.id}
            onPress={() => {
              // Actualiza la lista de deliveries seleccionados
              setSelectedDeliveries(prevSelected =>
                prevSelected.includes(delivery.id)
                  ? prevSelected.filter(id => id !== delivery.id)
                  : [...prevSelected, delivery.id]
              );
            }}
            style={[
              styles.deliveryListItem,
              {
                backgroundColor: selectedDeliveries.includes(delivery.id)
                  ? '#ddd'
                  : 'transparent',
              },
            ]}
          >
            <Text style={styles.deliveryListItemText}>
              {delivery.name || 'Unnamed Delivery'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Button onPress={handleDeleteDeliveries} style={styles.deleteButton}>
        Delete Selected Deliveries
      </Button>
      <Button onPress={onClose} style={styles.closeButton}>
        Close
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      paddingHorizontal: 20,
      paddingVertical: 30,
      borderRadius: 10,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#333',
    },
    deliveryListScrollView: {
      flex: 1,
      width: '100%',
    },
    deliveryListItem: {
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderColor: '#ddd',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    deliveryListItemText: {
      fontSize: 16,
      color: '#555',
    },
    deleteButton: {
      marginTop: 20,
      backgroundColor: '#ff4d4d',
    },
    deleteButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    closeButton: {
      marginTop: 10,
      backgroundColor: '#4d4dff',
    },
    closeButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default DeleteDeliveryModal;
