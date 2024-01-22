import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {db} from '../firebase/firebase-config';
import {
  onSnapshot,
  collection,
  Timestamp,
  doc,
  setDoc,
  getDoc,
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
      // Verificar si el cliente ya está asignado
      if (client.conductorAsignado) {
        Alert.alert(
          'Cliente ya asignado',
          'Este cliente ya está asignado a otro conductor.',
        );
        return;
      }

      const driverId = driverInfo.id;
      const driverDeliveryRef = collection(db, 'User', driverId, 'delivery');

      const newDeliveryDoc = await setDoc(
        doc(driverDeliveryRef, client.Phone),
        {
          name: client.Name,
          Phone: client.Phone,
          Address: client.Address,
          neighborhood: client.Neighborhood,
          description: client.Description,
          timestamp: Timestamp.now(),
        },
      );

      console.log('Delivery added successfully');

      // Actualizar el cliente para indicar que está asignado
      const clientsRef = collection(db, 'Clients');
      const clientDocRef = doc(clientsRef, client.Phone);

      // Verificar si el documento ya existe en la colección 'Clients'
      const clientDocSnapshot = await getDoc(clientDocRef);

      if (clientDocSnapshot.exists()) {
        // El documento existe, entonces puedes actualizarlo
        await setDoc(clientDocRef, {
          ...client,
          conductorAsignado: driverId,
        });

        console.log('Client assigned successfully');
      } else {
        console.log('Client document does not exist');
        // Aquí puedes manejar el caso donde el documento no existe si es necesario
      }

      onClientSelect(client);
      onAddDelivery();
      onClose();
    } catch (error) {
      console.error('Error adding delivery:', error);
    }
  };

  const handleClientDesasign = async client => {
    try {
      const clientsRef = collection(db, 'Clients');
      await setDoc(doc(clientsRef, client.id), {
        ...client,
        conductorAsignado: null, // Desasignar al conductor
      });

      // Puedes realizar otras acciones necesarias aquí

      console.log('Client desassigned successfully');
    } catch (error) {
      console.error('Error desassigning client:', error);
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
            onLongPress={() => {
              handleClientDesasign(client);
              onClose();
            }}
            style={styles.clientListItem}>
            <Text style={styles.clientListItemText}>{client.Name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    marginTop: 40,
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

export default AddDeliveryModal;
