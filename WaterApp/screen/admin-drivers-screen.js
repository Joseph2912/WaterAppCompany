import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Card, Avatar, List} from 'react-native-paper';
import {collection, query, where, getDocs} from 'firebase/firestore';
import {db} from '../firebase/firebase-config';
import DriverModal from '../components/driver-modal';

function AdminDrivers() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedDriverUid, setSelectedDriverUid] = useState(null);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const usersCollection = collection(db, 'User');
        const usersQuery = query(
          usersCollection,
          where('state', '==', 'active'),
        );
        const usersSnapshot = await getDocs(usersQuery);

        const activeUsersData = await Promise.all(
          usersSnapshot.docs.map(async userDoc => {
            const deliveriesCollection = collection(
              db,
              'User',
              userDoc.id,
              'delivery',
            );
            const deliveriesSnapshot = await getDocs(deliveriesCollection);

            const deliveryInfo = deliveriesSnapshot.docs.map(deliveryDoc => {
              const deliveryData = deliveryDoc.data();
              if (deliveryData) {
                return {
                  id: deliveryDoc.id,
                  clientName: deliveryData.name || '',
                  clientAvatar: deliveryData.avatar || '',
                };
              } else {
                return null;
              }
            });

            return {
              email: userDoc.data().email,
              name: userDoc.data().name,
              id: userDoc.id,
              deliveryInfo,
            };
          }),
        );

        setActiveUsers(activeUsersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching active users from Firestore', error);
        setLoading(false);
      }
    };

    fetchActiveUsers();

    const intervalId = setInterval(fetchActiveUsers, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSelectDriver = driver => {
    setSelectedDriverUid(driver.id);
    setSelectedDriver(driver);
    setModalVisible(true);
    setSelectedClient(null);
  };

  const handleClientSelect = client => {
    setSelectedClient(client);
    setModalVisible(true);
  };

  return (
    <View>
      {loading ? (
        <Text style={styles.titleDelivery}>Loading...</Text>
      ) : (
        <FlatList
          data={activeUsers}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                if (!modalVisible) {
                  setSelectedDriver(item);
                  setModalVisible(true);
                }
              }}
              style={modalVisible ? styles.disabledListItem : null}>
              <Card style={styles.cards}>
                <Card.Content>
                  <List.Item
                    title={` ${item.name || ''}`}
                    description={`${item.email || ''}`}
                    titleStyle={styles.title}
                    descriptionStyle={styles.description}
                    left={() => (
                      <Avatar.Text
                        style={styles.avatar}
                        size={50}
                        label={item.name ? item.name[0].toUpperCase() : ''}
                      />
                    )}
                  />
                  <Text style={styles.titleDelivery}>Deliverys</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.clientListScrollView}>
                    {item.deliveryInfo &&
                      Array.isArray(item.deliveryInfo) &&
                      item.deliveryInfo.map(delivery => (
                        <View style={styles.clientInfo} key={delivery.id}>
                          <Avatar.Text
                            size={30}
                            labelStyle={styles.labelStyle}
                            label={
                              delivery.clientName
                                ? delivery.clientName[0].toUpperCase()
                                : ''
                            }
                          />
                        </View>
                      ))}
                  </ScrollView>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
      {selectedDriver && (
        <DriverModal
          isVisible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedDriver(null);
          }}
          driverInfo={selectedDriver}
          selectedClient={selectedClient}
          onAddDelivery={() => handleSelectDriver(selectedDriver)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cards: {
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 3,
    marginTop: 16,
  },
  disabledListItem: {
    backgroundColor: 'rgba(0, 0, 0, 9.0)',
    opacity: 0.5,
  },
  avatar: {
    marginTop: -15,
    marginHorizontal: 10,
  },
  title: {
    fontFamily: 'Roboto-Bold',
    marginTop: -15,
    fontWeight: '500',
    fontSize: 18,
    left: -6,
    marginBottom: 5,
  },
  description: {
    fontFamily: 'Nunito-Medium',
    fontSize: 14,
  },
  deliveryInfoContainer: {
    flexDirection: 'row',
  },
  clientInfo: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  labelStyle: {
    textAlign: 'center',
  },
  titleDelivery: {
    fontFamily: 'Nunito-Medium',
    color: '#555',
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 10,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
});

export default AdminDrivers;
