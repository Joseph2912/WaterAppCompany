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
  driverInfo,
  onAddDelivery,
}) {
  const [clientsList, setClientsList] = useState([]);
  const [consecutive, setConsecutive] = useState(30500);

  useEffect(() => {
    const unsubscribeClients = onSnapshot(
      collection(db, 'Clients'),
      snapshot => {
        const clientsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Clients Data:', clientsData);
        setClientsList(clientsData);
      },
    );

    // Obtener y suscribirse al valor del consecutivo al cargar el componente
    const globalConsecutiveDocRef = doc(db, 'GlobalConsecutives', 'global');
    const unsubscribeConsecutive = onSnapshot(
      globalConsecutiveDocRef,
      snapshot => {
        setConsecutive(snapshot.data()?.consecutive || 30500);
      },
    );

    return () => {
      unsubscribeClients();
      unsubscribeConsecutive();
    };
  }, []);

  const handleClientSelect = async client => {
    try {
      onClientSelect(client);
      onAddDelivery();

      // Verificar si el cliente ya está asignado
      if (client.conductorAsignado) {
        Alert.alert(
          'Client already assigned',
          'This client is already assigned to another driver.',
        );
        return;
      }

      const driverId = driverInfo.id;
      const driverRef = doc(db, 'User', driverId);
      const driverDeliveryRef = collection(driverRef, 'delivery');

      // Incrementar el consecutivo global
      const nextConsecutive = consecutive + 1;

      // Crear un nuevo documento en la subcolección 'delivery' con el consecutivo
      await setDoc(doc(driverDeliveryRef, client.Phone), {
        name: client.Name,
        Phone: client.Phone,
        Address: client.Address,
        neighborhood: client.Neighborhood,
        description: client.Description,
        timestamp: Timestamp.now(),
        consecutive: nextConsecutive,
      });

      // Actualizar el número consecutivo global
      await setDoc(doc(db, 'GlobalConsecutives', 'global'), {
        consecutive: nextConsecutive,
      });

      console.log('Delivery added successfully');
      // Actualizar el cliente para indicar que está asignado
      const clientsRef = collection(db, 'Clients');
      const clientDocRef = doc(clientsRef, client.Phone);
      await setDoc(clientDocRef, {
        ...client,
        conductorAsignado: driverId,
        driverName: driverInfo.name,
      });

      console.log('Client assigned successfully');
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
        conductorAsignado: null,
      });

      // Puedes realizar otras acciones necesarias aquí

      console.log('Client desassigned successfully');
      onClose();
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
            }}
            onLongPress={() => {
              handleClientDesasign(client);
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

export default AddDeliveryModal;

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
