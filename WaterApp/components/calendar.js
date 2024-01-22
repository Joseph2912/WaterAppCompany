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
} from 'react-native';
import { Platform } from 'react-native';
import {Card} from 'react-native-paper';
import moment from 'moment';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import {onSnapshot} from 'firebase/firestore';
import {db} from '../firebase/firebase-config';
import {RegisterClients} from '../firebase/client-register';

export default function Calendar() {
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

  useEffect(() => {
    const fetchEventsFromClients = async () => {
      try {
        const clientsCollection = collection(db, 'Clients');
        const clientsSnapshot = await getDocs(clientsCollection);
  
        const tempEventsData = [];
  
        await Promise.all(
          clientsSnapshot.docs.map(async clientDoc => {
            const clientData = clientDoc.data();
            const clientEventsCollectionRef = collection(
              clientDoc.ref,
              'date',
            );
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
  
    // Fetch events initially
    fetchEventsFromClients();
  
    // Clear the interval when the component is unmounted
    return () => {};
  }, []);

  // Handles hardware back press, cancels add modal if it's visible.
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

  // Fetches clients data from Firestore when showClientList state changes.
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

  // Filters events to get those matching the selected date.
  const getEventsForSelectedDate = () => {
    return events.filter(event => {
      return (
        moment(event.date).format('YYYY-MM-DD') ===
        moment(value).format('YYYY-MM-DD')
      );
    });
  };

  // Retrieves events for the currently selected date.
  const selectedDateEvents = getEventsForSelectedDate();

  // Navigates to the previous week in the calendar.
  const navigateToPreviousWeek = () => {
    setWeek(week - 1);
    setValue(moment(value).subtract(1, 'week').toDate());
    scrollViewRef.current.scrollTo({x: 0, animated: false});
  };

  // Navigates to the next week in the calendar.
  const navigateToNextWeek = () => {
    setWeek(week + 1);
    setValue(moment(value).add(1, 'week').toDate());
    scrollViewRef.current.scrollTo({x: 0, animated: false});
  };

  // Handles the editing of an event, populating the modal with event details.
  const handleEditEvent = event => {
    setEditedEvent(event);
    setEventText(event.name);
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

  // Saves the edited event details and updates the corresponding client in Firestore.
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

  // Displays the client list by setting the state to show the client list modal.
  const handleShowClientList = () => {
    setShowClientList(true);
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

  // Renders a list of clients with a clickable interface to add a selected client to the calendar.
  const renderClientList = () => {
    return (
      <View style={styles.clientListContainer}>
        <Text style={styles.clientListTitle}>Client List</Text>
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

  // Renders a list of event cards, each representing an event on the selected date.
  const renderEventCards = () => {
    return (
      <View style={{flex: 1, paddingHorizontal: 16}}>
        {/* ScrollView for displaying the list of events */}
        <ScrollView
          ref={scrollViewRef}
          vertical
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}>
          {/* Mapping through selectedDateEvents to render individual event cards */}
          {selectedDateEvents.map(event => (
            <Card key={event.id} style={styles.eventCard}>
              {/* Card Content displaying event details */}
              <Card.Content>
                <Text style={styles.eventDate}>
                  {moment(event.date).format('MMM DD, YYYY')}
                </Text>
                <Text style={styles.eventTitle}>Name: {event.name}</Text>
                <Text style={styles.eventDescription}>
                  Phone: {event.phone}
                </Text>
                <Text style={styles.eventDescription}>
                  Address: {event.address}
                </Text>
                <Text style={styles.eventDescription}>
                  Neighborhood: {event.neighborhood}
                </Text>
                <Text style={styles.eventDescription}>{event.description}</Text>
              </Card.Content>
              {/* Buttons for editing and deleting the event */}
              <View style={styles.eventButtons}>
                <TouchableOpacity
                  style={[styles.eventButton, {backgroundColor: '#007aff'}]}
                  onPress={() => handleEditEvent(event)}>
                  <Text style={styles.eventButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.eventButton, styles.deleteButton]}
                  onPress={() => handleDeleteEvent(event.id)}>
                  <Text style={styles.eventButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </ScrollView>
        {/* Button to add a new event */}
        <TouchableOpacity
          style={styles.btnAddEvent}
          onPress={() => {
            if (showAddModal) {
              // Adding a new client event to the calendar
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
          <Text style={{color: '#fff', fontSize: 26, left: 3}}>+</Text>
        </TouchableOpacity>

        {/* Modal for adding or editing events */}
        {showAddModal && (
          <View style={styles.modalContainer}>
            {/* Input fields for event details */}
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
            {/* Conditional rendering of Save button for editing and Add Client button for new events */}
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
                  <Text style={{color: '#fff', fontSize: 20, left: 3}}>
                    Add client
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleShowClientList}>
                  <Text style={{color: '#fff', fontSize: 20, left: 3}}>
                    Show Client List
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  // Renders the main view containing a weekly calendar and either client list or event cards.
  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation bar for navigating to previous and next weeks */}
      <View style={styles.navigation}>
        {/* Button to navigate to the previous week */}
        <TouchableOpacity
          onPress={navigateToPreviousWeek}
          style={styles.navButton}>
          <Text style={styles.navButtonText}>-</Text>
        </TouchableOpacity>
        {/* Horizontal ScrollView for displaying the weekly calendar */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          contentContainerStyle={styles.scrollViewContent}>
          {/* Row of days for the current week */}
          <View style={[styles.itemRow, {paddingHorizontal: 10}]}>
            {/* Mapping through days of the week to render individual day items */}
            {weeks[1].map((item, dateIndex) => {
              // Checking if the current day is active or has events
              const isActive =
                value.toDateString() === item.date.toDateString();
              const hasEvents = events.some(
                event =>
                  moment(event.date).format('YYYY-MM-DD') ===
                  moment(item.date).format('YYYY-MM-DD'),
              );
              // Rendering each day as a touchable item
              return (
                <TouchableWithoutFeedback
                  key={dateIndex}
                  onPress={() => setValue(item.date)}>
                  {/* Day item with styling based on active and event conditions */}
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
                      style={[styles.itemWeekday, isActive && {color: '#fff'}]}>
                      {item.weekday}
                    </Text>
                    <Text
                      style={[styles.itemDate, isActive && {color: '#fff'}]}>
                      {item.date.getDate()}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              );
            })}
          </View>
        </ScrollView>
        {/* Button to navigate to the next week */}
        <TouchableOpacity onPress={navigateToNextWeek} style={styles.navButton}>
          <Text style={styles.navButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Conditional rendering of either client list or event cards based on showClientList state */}
      {showClientList ? renderClientList() : renderEventCards()}
    </SafeAreaView>
  );
}
// Añade un nuevo estilo para los elementos específicos de escritorio
const desktopStyles = Platform.select({
  ios: {
    // Estilos específicos para iOS
  },
  android: {
    // Estilos específicos para Android
  },
  web: {
    // Estilos específicos para la versión de escritorio (web)
  },
  default: {
    item: {
      height: 60,
      marginHorizontal: 8,
      backgroundColor: '#e8e8e8',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    eventButtons: {
      display: 'flex',
      flexDirection: 'row',
      marginTop: 8,
      width: 200
    },
    eventButton: {
      height: 40,
      borderRadius: 8,
      paddingVertical: 8,
      marginTop: 8,
      width: '100%',
      marginHorizontal: 8,
      backgroundColor: '#007aff',
    },
    deleteButton: {
      width: '100%',
      backgroundColor: 'red',
      marginTop: 8,
    },
    eventCard: {
      marginBottom: 12,
      backgroundColor: '#fff',
      borderRadius: 16,
      elevation: 3,
      borderColor: '#ddd',
      borderWidth: 1,
      padding: 16,
      width: 500

    },
  },
});

// ...

// Agrega el nuevo estilo a tu objeto de estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  itemRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    height: 50,
    marginHorizontal: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ddd',
    flexDirection: 'column',
    alignItems: 'center',
    ...desktopStyles.item, // Integra los estilos de escritorio
  },
  itemWeekday: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },
  itemDate: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  eventCard: {
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 10,
    ...desktopStyles.eventCard, // Integra los estilos de escritorio
  },
  eventDate: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 16,
    color: '#555',
  },
  eventButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    ...desktopStyles.eventButtons, // Integra los estilos de escritorio
  },
  eventButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
    ...desktopStyles.eventButton, // Integra los estilos de escritorio
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    color: '#fff',
    backgroundColor: '#007aff',
    borderRadius: 8,
  },
  eventButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  deleteButton: {
    marginLeft: 0,
    backgroundColor: 'red',
    ...desktopStyles.deleteButton, // Integra los estilos de escritorio
  },
  btnAddEvent: {
    position: 'absolute',
    justifyContent: 'center',
    alignContent: 'center',
    bottom: 16,
    right: 16,
    width: 60,
    height: 60,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007aff',
    color: '#fff',
  },
  modalContainer: {
    padding: 16,
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    color: '#000',
    padding: 10,
    borderRadius: 8,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  navButton: {
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    width: 30,
    borderRadius: 5,
  },
  navButtonText: {
    color: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  clientListContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  clientListTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  clientListScrollView: {
    marginBottom: 20,
  },
  clientListItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  clientListItemText: {
    fontSize: 18,
    color: '#000',
  },
});