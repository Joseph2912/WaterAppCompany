import React, { useState } from 'react';
import { View, Text, StyleSheet,TouchableOpacity } from 'react-native';
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
          <View style={styles.modalContainer2}>
            <Text style={styles.modalTitle}>{driverInfo?.name}</Text>
            <View style={styles.modalDeliveryContainer}></View>
            <TouchableOpacity
              mode="contained"
              onPress={handleAddDelivery}
              style={styles.Buttonadd}
            >
              <Text style={styles.detailsButtonText2}>Add Delivery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              mode="contained"
              onPress={handleDeleteDelivery}
              style={styles.Buttonremove}
            >
             <Text style={styles.detailsButtonText2}>Remove Delivery</Text> 
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDetails} style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>  Details</Text> 
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.Buttonclose}>
              <Text style={styles.ButtoncloseText}>Close</Text>
            </TouchableOpacity>
            </View>
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
    flex:1,
    position:'absolute',
    padding: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignContent: 'center',
    top: 0,
    right: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    width: '100%',
    height: 'auto',
  },
  modalContainer2: {
    backgroundColor: 'white',
    padding: 10

  },
  Buttonadd: {
    backgroundColor: '#007aff',
    margin: 5,
    borderRadius:12,
    width: '100%',
    height: 38,
    justifyContent:'center',
    alignItems:'center'

  },
  Buttonremove: {
    backgroundColor: 'red',
    margin: 5,
    borderRadius:12,
    width: '100%',
    height: 38,
    justifyContent:'center',
    alignItems:'center'
  },
  Buttonclose: {
    margin: 5,
    borderColor: '#007aff',
    borderWidth: 1,
    borderRadius:12,
    height:35,
    width: '100%',
    justifyContent:'center',
    alignItems:'center'
  },
  detailsButton: {
    margin: 5,
    borderColor: '#007aff',
    borderWidth: 1,
    borderRadius:12,
    height:35,
    width: '100%',
    justifyContent:'center',
    alignItems:'center'
  },
  detailsButtonText: {
    color: '#007aff',
    fontSize: 14
  },
  detailsButtonText2: {
    color: '#fff',
    fontSize: 14
  },
  ButtoncloseText: {
    color: '#007aff',
    fontSize: 14
  },
  modalTitle: {
    marginLeft:13,
    fontFamily: 'Roboto-Bold',
    fontSize: 20,
    color: '#444',
    fontWeight: 'bold',
  },
  modalDeliveryTitle: {
    fontFamily: 'Nunito-Medium',
    fontSize: 16,
    color: '#000',
  },
  modalDeliveryContainer: {
    fontFamily: 'Nunito-Medium',
    fontSize: 16,
    color: '#000',
    marginBottom: 15,
  },
});

export default DriverModal;
