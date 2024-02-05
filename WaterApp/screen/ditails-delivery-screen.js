import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Linking,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {collection, getDocs, onSnapshot, doc} from 'firebase/firestore';
import {db} from '../firebase/firebase-config';
import {Button, Card, Title, Paragraph} from 'react-native-paper';
import LeftBar from '../components/leftbar';

const DriverDetailsScreen = ({route}) => {
  const {driverInfo} = route.params;
  const [deliveryDetails, setDeliveryDetails] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      try {
        const deliveriesCollection = collection(
          db,
          'User',
          driverInfo.id,
          'delivery',
        );
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
            latitude: deliveryData.latitude || 0,
            longitude: deliveryData.longitude || 0,
          };
        });

        setDeliveryDetails(details);
      } catch (error) {
        console.error('Error fetching delivery details from Firestore', error);
      }
    };

    const unsubscribe = onSnapshot(doc(db, 'User', driverInfo.id), snapshot => {
      const {latitude, longitude} = snapshot.data();
      setDriverLocation({latitude, longitude});
    });

    fetchDeliveryDetails();

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [driverInfo.id]);

  const openExternalMap = coordinates => {
    if (coordinates && coordinates.latitude && coordinates.longitude) {
      const {latitude, longitude} = coordinates;
      const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      Linking.openURL(mapsLink);
    } else {
      console.error('Invalid coordinates for opening external map');
    }
  };

  const toggleAccordion = index => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'windows' && <LeftBar />}
      <View style={styles.container2}>
        <View style={styles.details2}>
          <View style={styles.header}>
            <Paragraph style={styles.text2}>{driverInfo.name}</Paragraph>
            <Button
              style={styles.button}
              labelStyle={styles.buttonText}
              mode="contained"
              onPress={() =>
                openExternalMap(driverLocation, 'Driver Location')
              }>
              Open Map
            </Button>
          </View>
          <Paragraph style={styles.text4}>{driverInfo.email}</Paragraph>
          <Title style={styles.sectionTitle}>Deliveries</Title>
        </View>
        <ScrollView style={styles.details}>
          {deliveryDetails.map((delivery, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => toggleAccordion(index)}>
              <Card
                style={[
                  styles.card,
                  expandedIndex === index ? styles.expandedCard : null,
                ]}>
                <Card.Content>
                  <View style={styles.idcontainer}>
                    <Paragraph style={styles.text3}>{delivery.name}</Paragraph>
                    <Title style={styles.deliveryTitle}>
                      DELIVERY{' '}
                      <Title style={styles.text3}>{`${index + 1}`}</Title>
                    </Title>
                  </View>
                  {expandedIndex === index && (
                    <>
                      <Paragraph style={styles.text}>PHONE </Paragraph>
                      <Paragraph style={styles.text3}>
                        {delivery.Phone}
                      </Paragraph>
                      <Paragraph style={styles.text}>ADDRESS </Paragraph>
                      <Paragraph style={styles.text3}>
                        {delivery.address}
                      </Paragraph>
                      <Paragraph style={styles.text}>NEIGHBORHOOD </Paragraph>
                      <Paragraph style={styles.text3}>
                        {delivery.neighborhood}
                      </Paragraph>
                      <Paragraph style={styles.text}>COMMENT</Paragraph>
                      <Paragraph style={styles.text3}>
                        {delivery.description}
                      </Paragraph>
                    </>
                  )}
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  container2: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  details: {
    height: '100%',
    width: '100%',
  },
  idcontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  details2: {
    width: '100%',
    marginTop: 10,
    marginBottom: 5,
    paddingLeft: 20,
    borderBottomWidth: 2,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 15,
    color: '#000',
    marginBottom: 15,
  },
  card: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#fff',
    elevation: 0,
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
  },
  expandedCard: {
    height: 'auto',
  },
  deliveryTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#999',
  },
  text: {
    fontFamily: 'Roboto-Bold',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#999',
  },
  text2: {
    fontFamily: 'Roboto-Bold',
    fontWeight: '900',
    fontSize: 20,
    color: '#444',
  },
  text4: {
    fontFamily: 'Nunito-Medium',
    fontWeight: '600',
    fontSize: 15,
    marginTop: -8,
    color: '#777',
  },
  text3: {
    fontFamily: 'Nunito-Medium',
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '600',
    color: '#444',
  },
  button: {
    marginRight: 10,
    backgroundColor: '#007aff',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default DriverDetailsScreen;
