import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import {FieldValue} from 'firebase/firestore';
import {db} from '../firebase/firebase-config';

function DeleteDeliveryModal({
  isVisible,
  onClose,
  driverInfo,
  onDeleteDelivery,
}) {
  const [deliveryList, setDeliveryList] = useState([]);
  const [selectedDeliveries, setSelectedDeliveries] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const deliveriesCollection = collection(
          db,
          'User',
          driverInfo.id,
          'delivery',
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
      const updatePromises = selectedDeliveries.map(async deliveryId => {
        const deliveryRef = doc(
          db,
          'User',
          driverInfo.id,
          'delivery',
          deliveryId,
        );
        await deleteDoc(deliveryRef);

        // Desasigna el cliente y almacena su información en el estado
        try {
          const clientsRef = collection(db, 'Clients');

          // Utiliza el número de teléfono como nombre del documento en la colección "Clients"
          const phoneNumber = deliveryId;

          // Construye la referencia al documento en la colección "Clients" con el número de teléfono
          const clientDocRef = doc(clientsRef, phoneNumber);

          // Actualiza el documento en la colección "Clients" eliminando el campo "conductorAsignado" e "id"
          await updateDoc(clientDocRef, {
            conductorAsignado: '',
          });

          console.log('Client fields deleted successfully');
        } catch (error) {
          console.error('Error deleting client fields:', error);
        }
      });

      await Promise.all(updatePromises);

      // Llama a la función onDeleteDelivery con los IDs de los deliveries eliminados
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
                  : [...prevSelected, delivery.id],
              );
              // Actualiza la lista de clientes seleccionados
              setSelectedClients(prevSelected =>
                prevSelected.filter(client => client.id !== delivery.id),
              );
            }}
            style={[
              styles.deliveryListItem,
              {
                backgroundColor: selectedDeliveries.includes(delivery.id)
                  ? '#ddd'
                  : 'transparent',
              },
            ]}>
            <Text style={styles.deliveryListItemText}>
              {delivery.name || 'Unnamed Delivery'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        onPress={handleDeleteDeliveries}
        style={styles.deleteButton}>
        <Text>Delete Selected Deliveries</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 10,
    height: 500,
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
    backgroundColor: 'red',
    margin: 5,
    borderRadius: 12,
    width: '100%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    margin: 5,
    borderColor: '#007aff',
    borderWidth: 1,
    borderRadius: 12,
    height: 35,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#007aff',
    fontSize: 15,
  },
});

export default DeleteDeliveryModal;
