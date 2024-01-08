import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Button } from 'react-native-paper';
import AddDeliveryModal from './add-delivery-modal';
import DeleteDeliveryModal from './delete-delivery-modal'; 
import { useNavigation } from '@react-navigation/native';

function DriverModal({
  isVisible,
  onClose,
  driverInfo,
  selectedClient,
  onAddDelivery,
  driverUid,
  
}){
  const [addDeliveryModalVisible, setAddDeliveryModalVisible] = useState(false);
  const [deleteDeliveryModalVisible, setDeleteDeliveryModalVisible] = useState(
    false
  );

  const navigation = useNavigation();

  const handleAddDelivery = () => {
    setAddDeliveryModalVisible(true);
    onAddDelivery();
  };

  const handleDeleteDelivery = () => {
    setDeleteDeliveryModalVisible(true);
  };

  const handleDetails = () => {

    navigation.navigate('DriverDetails', {
      driverInfo: driverInfo,
      deliveryDetails: driverInfo.deliveryInfo,
    });
  };
  return (
    <View style={styles.modalContainer}>
      {!addDeliveryModalVisible && !deleteDeliveryModalVisible ? (
        <Card>
          <Card.Content>
            <Text style={styles.modalTitle}>{driverInfo?.name}</Text>
            <View style={styles.modalDeliveryContainer}></View>
            <Button
              mode="contained"
              onPress={handleAddDelivery}
              style={styles.Button}
            >
              Add Delivery
            </Button>
            <Button
              mode="contained"
              onPress={handleDeleteDelivery}
              style={styles.Button}
            >
              Remove Delivery
            </Button>
            <Button onPress={handleDetails} style={styles.detailsButton}>
              Details
            </Button>
            <Button onPress={onClose} style={styles.Buttonclose}>
              Close
            </Button>
          </Card.Content>
        </Card>
      ) : addDeliveryModalVisible ? (
        <AddDeliveryModal
          isVisible={addDeliveryModalVisible}
          onClose={() => setAddDeliveryModalVisible(false)}
          onClientSelect={(client) => {
            setAddDeliveryModalVisible(false);
          }}
          selectedClient={selectedClient}
          driverUid={driverUid}
          driverInfo={driverInfo}
          onAddDelivery={onAddDelivery}
        />
      ) : (
        deleteDeliveryModalVisible && (
          <DeleteDeliveryModal
            isVisible={deleteDeliveryModalVisible}
            onClose={() => setDeleteDeliveryModalVisible(false)}
            driverInfo={driverInfo}
            onDeleteDelivery={(selectedDeliveries) => {
              console.log('Deleted deliveries:', selectedDeliveries);
              setDeleteDeliveryModalVisible(false);
            }}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 10,
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 16,
    right: 0,
    elevation: 5,
    borderRadius: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    width: 321,
    height: 'auto',
  },
  Button: {
    margin: 5,
  },
  Buttonclose: {
    margin: 5,
    borderWidth: 0.5,
    borderColor: 'purple',
  },
  modalTitle: {
    fontSize: 16,
    color: '#444',
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#000',
  },
  modalDeliveryTitle: {
    fontSize: 16,
    color: '#000',
  },
  modalDeliveryContainer: {
    fontSize: 16,
    color: '#000',
    marginBottom: 15,
  },
});

export default DriverModal;
