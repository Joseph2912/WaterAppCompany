import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Button} from 'react-native-paper';
import {db} from '../firebase/firebase-config';
import {
  onSnapshot,
  collection,
  addDoc,
  Timestamp,
  doc,
  setDoc,
} from 'firebase/firestore';

function AddDeliveryModal({
  isVisible,
  onClose,
  onClientSelect,
  driverUid,
  driverInfo,
  onAddDelivery,
}) {
  const [clientsList, setClientsList] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Clients'), snapshot => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Clients Data:', clientsData);
      setClientsList(clientsData);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleClientSelect = async client => {
    try {
      const driverId = driverInfo.id;
      const driverDeliveryRef = collection(db, 'User', driverId, 'delivery');

      const newDeliveryDoc = await setDoc(
        doc(driverDeliveryRef, client.Phone),
        {
          Id: client.id,
          name: client.Name,
          Phone: client.Phone,
          Address: client.Address,
          neighborhood: client.Neighborhood,
          description: client.Description,
          timestamp: Timestamp.now(),
        },
      );

      console.log('Delivery added successfully');

      onClientSelect(client);
      onAddDelivery();
      onClose();
    } catch (error) {
      console.error('Error adding delivery:', error);
    }
  };

  return (
    <View
      visible={isVisible}
      onRequestClose={onClose}
      style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Select a client to add:</Text>
      <ScrollView style={styles.clientListScrollView}>
        {clientsList.map(client => (
          <TouchableOpacity
            key={client.id}
            onPress={() => {
              handleClientSelect(client);
              onClose();
            }}
            style={styles.clientListItem}>
            <Text style={styles.clientListItemText}>{client.Name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  clientListScrollView: {
    flex: 1,
    width: '100%',
  },
  clientListItem: {
    paddingVertical: 15,
    borderRadius: 0,
    borderColor: '#ddd',
    borderBottomWidth: 1,
  },
  clientListItemText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
  },
});

export default AddDeliveryModal;
