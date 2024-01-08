import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  BackHandler,
  TouchableWithoutFeedback,
  PanResponder,
  Animated,
} from 'react-native';
import {Card} from 'react-native-paper';
import moment from 'moment';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import {onSnapshot} from 'firebase/firestore';
import {db} from '../firebase/firebase-config';
import {RegisterClients} from '../firebase/client-register';
import AdminDrivers from '../screen/admin-drivers';

export default function CalendarWindows() {
  const [value, setValue] = useState(new Date());
  const [week, setWeek] = useState(0);
  const [events, setEvents] = useState([]);
  const [editedEvent, setEditedEvent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [eventText, setEventText] = useState('');
  const [eventPhone, setEventPhone] = useState('');
  const [eventAddress, setEventAddress] = useState('');
  const [eventNeighborhood, setEventNeighborhood] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [showClientList, setShowClientList] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState({});
  const scrollViewRef = useRef();
  const [draggedClient, setDraggedClient] = useState(null);
  const [position, setPosition] = useState({x: 0, y: 0});

  useEffect(() => {
    const fetchEventsFromClients = async () => {
      try {
        const clientsCollection = collection(db, 'Clients');
        const clientsSnapshot = await getDocs(clientsCollection);
        const tempEventsData = [];
        await Promise.all(
          clientsSnapshot.docs.map(async clientDoc => {
            const clientData = clientDoc.data();
            const clientEventsCollectionRef = collection(clientDoc.ref, 'date');
            const clientEventsSnapshot = await getDocs(
              clientEventsCollectionRef,
            );
            clientEventsSnapshot.forEach(eventDoc => {
              const eventData = eventDoc.data();
              const timestamp = eventData.date;
              const date = timestamp.toDate();
              tempEventsData.push({
                id: eventDoc.id,
                date,
                name: clientData.Name,
                phone: clientData.Phone,
                address: clientData.Address,
                neighborhood: clientData.Neighborhood,
                description: clientData.Description,
              });
            });
          }),
        );
        tempEventsData.sort((a, b) => a.date - b.date);
        setEvents(tempEventsData);
      } catch (error) {
        console.error('Error fetching events from Firestore', error);
      }
    };

    fetchEventsFromClients();

    const intervalId = setInterval(fetchEventsFromClients, 60000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleBackPress = () => {
      if (showAddModal) {
        handleCancelAdd();
        return true;
      }
      if (showClientList) {
        setShowClientList(false);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => {
      backHandler.remove();
    };
  }, [showAddModal, showClientList]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Clients'), snapshot => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClients(clientsData);
    });
    return () => {
      unsubscribe();
    };
  }, [showClientList]);

  const weeks = React.useMemo(() => {
    const start = moment().add(week, 'weeks').startOf('week');
    return [-1, 0, 1].map(adj => {
      return Array.from({length: 7}).map((_, index) => {
        const date = moment(start).add(adj, 'week').add(index, 'day');

        return {
          weekday: date.format('ddd'),
          date: date.toDate(),
        };
      });
    });
  }, [week]);

  const getEventsForSelectedDate = () => {
    return events.filter(event => {
      return (
        moment(event.date).format('YYYY-MM-DD') ===
        moment(value).format('YYYY-MM-DD')
      );
    });
  };

  const selectedDateEvents = getEventsForSelectedDate();

  const navigateToPreviousWeek = () => {
    setWeek(week - 1);
    setValue(moment(value).subtract(1, 'week').toDate());
    scrollViewRef.current.scrollTo({x: 0, animated: false});
  };

  const navigateToNextWeek = () => {
    setWeek(week + 1);
    setValue(moment(value).add(1, 'week').toDate());
    scrollViewRef.current.scrollTo({x: 0, animated: false});
  };

  const handleEditEvent = event => {
    setEditedEvent(event);
    setEventText(event.name);
    setEventPhone(event.phone);
    setEventAddress(event.address);
    setEventNeighborhood(event.neighborhood);
    setEventDesc(event.description);
    setShowAddModal(true);
  };

  const handleDeleteEvent = async eventId => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            const eventToDelete = events.find(event => event.id === eventId);
            if (!eventToDelete) {
              console.error('Event not found');
              return;
            }
            const clientDocRef = doc(db, 'Clients', eventToDelete.phone);
            const eventsCollectionRef = collection(clientDocRef, 'date');
            await deleteDoc(doc(eventsCollectionRef, eventId));
            const updatedEvents = events.filter(event => event.id !== eventId);
            setEvents(updatedEvents);
          } catch (error) {
            console.error('Error deleting event', error);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const saveEditedEvent = async () => {
    if (editedEvent && value) {
      const updatedEvents = events.map(event =>
        event.id === editedEvent.id
          ? {
              ...event,
              name: eventText,
              phone: eventPhone,
              address: eventAddress,
              neighborhood: eventNeighborhood,
              description: eventDesc,
            }
          : event,
      );
      setEvents(updatedEvents);
      setEditedEvent(null);
      setShowAddModal(false);
      try {
        const clientDocRef = doc(db, 'Clients', editedEvent.phone);
        await updateDoc(clientDocRef, {
          Name: eventText,
          Phone: eventPhone,
          Address: eventAddress,
          Neighborhood: eventNeighborhood,
          Description: eventDesc,
        });
        console.log('Client updated in Firestore');
      } catch (error) {
        console.error('Error updating client in Firestore', error);
      }
    }
  };

  const handleAddEvent = () => {
    const formattedDate = value.toISOString().split('T')[0];
    const documentName = `${eventPhone}_${formattedDate}`;
    if (value) {
      const newEvent = {
        id: formattedDate,
        date: value,
        name: eventText || 'Name',
        phone: eventPhone || 'Phone',
        address: eventAddress || 'Address',
        neighborhood: eventNeighborhood || 'Neighborhood',
        description: eventDesc || 'Description',
      };
      setEvents([...events, newEvent]);
      setEventText('');
      setEventPhone('');
      setEventAddress('');
      setEventNeighborhood('');
      setEventDesc('');
      setShowAddModal(false);
      RegisterClients(
        value,
        eventText,
        eventPhone,
        eventAddress,
        eventNeighborhood,
        eventDesc,
      );
    }
  };

  const handleShowClientList = () => {
    setShowClientList(true);
  };

  const handlecloseClientList = () => {
    setShowClientList(false);
  };

  const handleClosemodal = () => {
    setEventText('');
    setEventPhone('');
    setEventAddress('');
    setEventNeighborhood('');
    setEventDesc('');
    setEditedEvent(null);
    setShowAddModal(false);
  };

  const handleAddClientToCalendar = async client => {
    try {
      const clientDocRef = doc(db, 'Clients', client.Phone);
      const formattedDate = value.toISOString().split('T')[0];
      const documentName = `${client.Phone}_${formattedDate}`;
      const eventsCollection = collection(clientDocRef, 'date');
      const newEventDocRef = await setDoc(doc(eventsCollection, documentName), {
        date: value,
        name: client.Name || 'Name',
        address: client.Address || 'Address',
        neighborhood: client.Neighborhood || 'Neighborhood',
        description: client.Description || 'Description',
      });
      setEvents([
        ...events,
        {
          id: documentName,
          date: value,
          name: client.Name || 'Name',
          phone: client.Phone || 'Phone',
          address: client.Address || 'Address',
          neighborhood: client.Neighborhood || 'Neighborhood',
          description: client.Description || 'Description',
        },
      ]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding client to calendar and Firestore', error);
    }
  };
  const handleCancelAdd = () => {
    setEventText('');
    setEventPhone('');
    setEventAddress('');
    setEventNeighborhood('');
    setEventDesc('');
    setEditedEvent(null);
    setShowAddModal(false);
  };

  const handleDroppedEvent = async value => {
    try {
      if (draggedClient) {
        console.log('Dropped data:', {
          name: draggedClient.name || 'Namasdasdasdsae',
          phone: draggedClient.phone,
          address: draggedClient.address || 'Aasdasdasddress',
          neighborhood: draggedClient.neighborhood || 'Neighborasdasdasdhood',
          description: draggedClient.description || 'Desasdasdasdcription',
        });
        const clientDocRef = doc(db, 'Clients', draggedClient.phone);
        const formattedDate = value.toISOString().split('T')[0];
        const documentName = `${draggedClient.phone}_${formattedDate}`;
        const eventsCollection = collection(clientDocRef, 'date');
        const eventData = {
          date: value,
          name: draggedClient.name || 'Name',
          address: draggedClient.address || 'Address',
          neighborhood: draggedClient.neighborhood || 'Neighborhood',
          description: draggedClient.description || 'Description',
        };
        console.log('Agregando evento con los siguientes datos:', eventData);
        const newEventDocRef = await setDoc(
          doc(eventsCollection, documentName),
          eventData,
        );
        console.log('Evento agregado con éxito:', newEventDocRef);
      }
    } catch (error) {
      console.error('Error al agregar el evento:', error);
    }
  };

  const renderClientList = () => {
    return (
      <View style={styles.clientListContainer}>
        <Text style={styles.clientListTitle}>Client List</Text>
        <TouchableOpacity
          style={styles.closeClientButton}
          onPress={handlecloseClientList}>
          <Text style={{color: '#ddd', fontSize: 18}}>X</Text>
        </TouchableOpacity>
        <ScrollView style={styles.clientListScrollView}>
          {clients.map(client => (
            <TouchableOpacity
              key={client.id}
              onPress={() => {
                setSelectedClient(client);
                handleAddClientToCalendar(client);
                setShowClientList(false);
              }}
              style={styles.clientListItem}>
              <Text style={styles.clientListItemText}>{client.Name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  const DraggableEventCard = ({event, onEdit, onDelete, onDropEvent}) => {
    const pan = new Animated.ValueXY();

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > 50) {
          setDraggedClient(event);
          onDropEvent(event);
        } else {
          Animated.spring(pan, {
            toValue: {x: 0, y: 0},
            useNativeDriver: false,
          }).start();
        }
      },
    });

    return (
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{translateX: pan.x}, {translateY: pan.y}],
        }}>
        <Card style={styles.eventCard}>
          <Card.Content>
            <Text style={styles.eventDate}>
              {moment(event.date).format('MMM DD, YYYY')}
            </Text>
            <Text style={styles.eventTitle}>Name: {event.name}</Text>
            <Text style={styles.eventDescription}>Phone: {event.phone}</Text>
            <Text style={styles.eventDescription}>
              Address: {event.address}
            </Text>
            <Text style={styles.eventDescription}>
              Neighborhood: {event.neighborhood}
            </Text>
            <Text style={styles.eventDescription}>{event.description}</Text>
          </Card.Content>
          <View style={styles.eventButtons}>
            <TouchableOpacity
              style={[styles.deleteButton]}
              onPress={() => onDelete(event.id)}>
              <Text style={styles.TextDelete}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.EditButon]}
              onPress={() => onEdit(event)}>
              <Text style={styles.TextEdit}>Edit</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </Animated.View>
    );
  };

  const renderEventCards = () => {
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        setPosition({
          x: gestureState.dx,
          y: gestureState.dy,
        });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > 50) {
          AdminDrivers.handleDroppedEvent(selectedClient);
        }
      },
    });
    return (
      <View style={styles.ContainerCards}>
        <ScrollView
          ref={scrollViewRef}
          vertical
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}>
          {selectedDateEvents.map((event, index) => (
            <DraggableEventCard
              key={event.id}
              event={event}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onDropEvent={() => handleDroppedEvent(selectedClient, value)}
            />
          ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.btnAddEvent}
          onPress={() => {
            if (showAddModal) {
              handleAddClientToCalendar({
                Name: eventText,
                Id: eventId,
                Phone: eventPhone,
                Address: eventAddress,
                Neighborhood: eventNeighborhood,
                Description: eventDesc,
              });
            } else {
              setShowAddModal(true);
            }
          }}>
          <Text>+</Text>
        </TouchableOpacity>
        {showAddModal && (
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClosemodal}>
              <Text style={{color: '#ddd', fontSize: 18}}>X</Text>
            </TouchableOpacity>
            <TextInput
              value={eventText}
              onChangeText={text => setEventText(text)}
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#909090"
            />
            <TextInput
              value={eventPhone}
              onChangeText={phone => setEventPhone(phone)}
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor="#909090"
            />
            <TextInput
              value={eventAddress}
              onChangeText={address => setEventAddress(address)}
              style={styles.input}
              placeholder="Address"
              placeholderTextColor="#909090"
            />
            <TextInput
              value={eventNeighborhood}
              onChangeText={neighborhood => setEventNeighborhood(neighborhood)}
              style={styles.input}
              placeholder="Neighborhood"
              placeholderTextColor="#909090"
            />
            <TextInput
              value={eventDesc}
              onChangeText={desc => setEventDesc(desc)}
              style={styles.input}
              placeholder="Description"
              placeholderTextColor="#909090"
            />
            {editedEvent ? (
              <TouchableOpacity
                onPress={saveEditedEvent}
                style={styles.addButton}>
                <Text style={{color: '#fff', fontSize: 20, left: 3}}>Save</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddEvent}>
                  <Text style={{color: '#fff', fontSize: 18}}>
                    Add new client
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleShowClientList}>
                  <Text style={{color: '#fff', fontSize: 18}}>
                    Show client list
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View key="monthTitle" style={styles.Header}>
        <Text style={styles.Dashboard}>Dashboard</Text>
        <Text style={styles.monthTitle}>
          {moment(weeks[2][0].date).format('MMMM YYYY')}
        </Text>
      </View>
      <View style={styles.leftbar}>
        <Text>hola mund</Text>
      </View>
      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={navigateToPreviousWeek}
          style={styles.navButton}>
          <Text style={styles.navButtonText}>-</Text>
        </TouchableOpacity>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          contentContainerStyle={styles.scrollViewContent}>
          <View style={[styles.itemRow, {paddingHorizontal: 10}]}>
            {weeks[1].map((item, dateIndex) => {
              const isActive =
                value.toDateString() === item.date.toDateString();
              const hasEvents = events.some(
                event =>
                  moment(event.date).format('YYYY-MM-DD') ===
                  moment(item.date).format('YYYY-MM-DD'),
              );
              return (
                <TouchableWithoutFeedback
                  key={dateIndex}
                  onPress={() => setValue(item.date)}>
                  <View
                    style={[
                      styles.item,
                      isActive && {
                        backgroundColor: '#007aff',
                        borderColor: '#007aff',
                      },
                      hasEvents && {
                        borderWidth: 2,
                        borderColor: '#007aff',
                      },
                    ]}>
                    <Text
                      style={[styles.itemDate, isActive && {color: '#fff'}]}>
                      {item.date.getDate()}
                    </Text>
                    <Text
                      style={[styles.itemWeekday, isActive && {color: '#fff'}]}>
                      {item.weekday}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              );
            })}
          </View>
        </ScrollView>
        <TouchableOpacity onPress={navigateToNextWeek} style={styles.navButton}>
          <Text style={styles.navButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      {showClientList ? renderClientList() : renderEventCards()}
      <View style={styles.driverView}>
        <Text style={styles.titleDrivers}>Drivers Online</Text>
        <AdminDrivers
          draggedClient={draggedClient}
          onDropEvent={handleDroppedEvent}
        />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
    height: '100%',
    paddingTop: 8,
  },
  leftbar: {
    position: 'absolute',
    left: 0,
    backgroundColor: '#fff',
    height: '100%',
    width: 70,
    padding: 15,
  },
  driverView: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#fff',
    height: '100%',
    width: 350,
    padding: 15,
    paddingTop: 30,
  },
  titleDrivers: {
    color: '#000',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 10,
  },
  Header: {
    marginTop: 16,
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '66%',
    left: -160,
  },
  monthTitle: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  Dashboard: {
    backgroundColor: '#f0f0f0',
    left: 30,
    color: '#000',
    fontSize: 30,
    fontWeight: 'bold',
  },
  itemRow: {
    justifyContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    height: 55,
    marginHorizontal: 8,
    borderRadius: 50,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e1e4e6',
  },
  itemWeekday: {
    fontSize: 12,
    color: '#808080',
  },
  itemDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    left: -150,
    width: '62%',
    marginBottom: 25,
    marginTop: 15,
  },
  navButton: {
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
    borderRadius: 50,
  },
  navButtonText: {
    top: -4,
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  ContainerCards: {
    flex: 1,
    left: -150,
    width: 900,
  },
  scrollViewContent: {
    flexGrow: 1,
    left: -150,
  },
  eventCard: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 16,
    width: 900,
    height: 'auto',
  },
  eventDate: {
    fontSize: 15,
    color: '#777',
    marginBottom: 10,
    marginTop: -6,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  eventDescription: {
    marginVertical: 2,
    fontSize: 16,
    color: '#444',
  },
  eventButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  EditButon: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    marginHorizontal: 8,
    marginTop: 8,
    width: '12%',
    backgroundColor: '#007aff',
  },
  TextEdit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#303030',
    color: '#fff',
  },
  TextDelete: {
    fontSize: 16,
    color: '#444',
    color: '#fff',
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    marginHorizontal: 8,
    marginTop: 8,
    width: '12%',
    backgroundColor: '#FE4646',
  },
  addButton: {
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    color: '#fff',
    backgroundColor: '#007aff',
    borderRadius: 8,
  },
  closeButton: {
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    top: -5,
    left: 326,
    height: 40,
    width: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    elevation: 5,
  },
  btnAddEvent: {
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 16,
    right: -850,
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#007aff',
    color: '#fff',
  },
  modalContainer: {
    padding: 16,
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 16,
    right: 0,
    elevation: 5,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    width: 400,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    color: '#000',
    padding: 10,
    borderRadius: 8,
  },
  clientListContainer: {
    bottom: 16,
    right: -150,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    width: 300,
    height: 510,
  },
  closeClientButton: {
    position: 'absolute',
    top: 16,
    right: 18,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#ddd',
  },
  clientListTitle: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 10,
    left: 14,
  },
  clientListScrollView: {
    marginBottom: 0,
  },
  clientListItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  clientListItemText: {
    fontSize: 16,
    color: '#333',
  },
});
