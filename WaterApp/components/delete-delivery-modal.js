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
} from 'firebase/firestore';
import {db} from '../firebase/firebase-config';

// DeleteDeliveryModal component to delete deliveries for a driver
function DeleteDeliveryModal({
  isVisible,
  onClose,
  driverInfo,
  onDeleteDelivery,
}) {
  // State to store the list of deliveries
  const [deliveryList, setDeliveryList] = useState([]);
  // State to store the IDs of selected deliveries to delete
  const [selectedDeliveries, setSelectedDeliveries] = useState([]);
  // State to store the list of selected clients
  const [selectedClients, setSelectedClients] = useState([]);

  // Fetch deliveries when the modal becomes visible
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

  // Handle the deletion of selected deliveries
  const handleDeleteDeliveries = async () => {
    try {
      // Close the modal
      onClose();
      // Use promises to delete each selected delivery
      const updatePromises = selectedDeliveries.map(async deliveryId => {
        const deliveryRef = doc(
          db,
          'User',
          driverInfo.id,
          'delivery',
          deliveryId,
        );
        await deleteDoc(deliveryRef);

        // Unassign the client and update their information
        try {
          const clientsRef = collection(db, 'Clients');
          const phoneNumber = deliveryId;
          const clientDocRef = doc(clientsRef, phoneNumber);

          await updateDoc(clientDocRef, {
            conductorAsignado: '',
            driverName: '',
          });

          console.log('Client fields deleted successfully');
        } catch (error) {
          console.error('Error deleting client fields:', error);
        }
      });

      // Wait for all promises to resolve
      await Promise.all(updatePromises);

      // Call onDeleteDelivery function with the IDs of the deleted deliveries
      onDeleteDelivery(selectedDeliveries);
    } catch (error) {
      console.error('Error deleting deliveries:', error);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Select deliveries to delete:</Text>
      <ScrollView style={styles.deliveryListScrollView}>
        {/* Render the list of deliveries */}
        {deliveryList.map(delivery => (
          <TouchableOpacity
            key={delivery.id}
            onPress={() => {
              // Update the list of selected deliveries
              setSelectedDeliveries(prevSelected =>
                prevSelected.includes(delivery.id)
                  ? prevSelected.filter(id => id !== delivery.id)
                  : [...prevSelected, delivery.id],
              );
              // Update the list of selected clients
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
      {/* Button to delete selected deliveries */}
      <TouchableOpacity
        onPress={handleDeleteDeliveries}
        style={styles.deleteButton}>
        <Text>Delete Selected Deliveries</Text>
      </TouchableOpacity>
      {/* Button to close the modal */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles for the DeleteDeliveryModal component
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

// Export the DeleteDeliveryModal component
export default DeleteDeliveryModal;
