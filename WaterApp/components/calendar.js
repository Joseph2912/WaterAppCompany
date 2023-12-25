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
import {Card} from 'react-native-paper';
import moment from 'moment';
import {collection, getDocs, doc, updateDoc} from 'firebase/firestore';
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

  // Fetches events data from Firestore Clients collection on component mount.
  useEffect(() => {
    const fetchEventsFromClients = async () => {
      try {
        // Access the Clients collection in Firestore.
        const clientsCollection = collection(db, 'Clients');
        // Retrieve snapshot of client documents.
        const clientsSnapshot = await getDocs(clientsCollection);
        const eventsData = [];

        // Process each client document to extract relevant event data.
        clientsSnapshot.forEach(clientDoc => {
          const eventData = clientDoc.data();

          // Checks if the client document has a valid Date field.
          if (eventData.Date) {
            // Extracts and converts timestamp to Date object.
            const timestamp = eventData.Date;
            const date = timestamp.toDate();

            // Constructs an event object with extracted data.
            eventsData.push({
              id: clientDoc.id,
              date,
              name: eventData.Name,
              phone: eventData.Phone,
              address: eventData.Address,
              neighborhood: eventData.Neighborhood,
              description: eventData.Description,
            });
          }
        });

        // Sorts eventsData array based on date before updating state.
        eventsData.sort((a, b) => a.date - b.date);

        // Sets the component state with the sorted events data.
        setEvents(eventsData);
      } catch (error) {
        // Logs an error message if there is an issue with data retrieval.
        console.error('Error fetching events from Firestore', error);
      }
    };

    // Invokes the fetchEventsFromClients function on component mount.
    fetchEventsFromClients();
  }, []);

  // Handles hardware back press, cancels add modal if it's visible.
  useEffect(() => {
    const handleBackPress = () => {
      // Checks if the add modal is currently visible.
      if (showAddModal) {
        // Calls the function to cancel adding a new event and returns true.
        handleCancelAdd();
        return true;
      }

      // Checks if the client list is currently visible.
      if (showClientList) {
        // Closes the client list and returns true.
        setShowClientList(false);
        return true;
      }

      // Returns false to allow default back press behavior.
      return false;
    };

    // Adds event listener for hardware back press and associates it with handleBackPress.
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    // Removes the event listener when the component unmounts.
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
      // Limpia el oyente cuando el componente se desmonta.
      unsubscribe();
    };
  }, [showClientList]);

  // Generates a matrix of dates for three weeks centered around the current week.
  const weeks = React.useMemo(() => {
    // Calculates the start date of the current week based on the selected week.
    const start = moment().add(week, 'weeks').startOf('week');

    // Maps an array of three rows, each representing a week.
    return [-1, 0, 1].map(adj => {
      // Maps an array of seven days for each week.
      return Array.from({length: 7}).map((_, index) => {
        // Calculates the date for each day in the matrix.
        const date = moment(start).add(adj, 'week').add(index, 'day');

        // Returns an object with the weekday and date properties.
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
      // Compares the formatted date strings of the event and the selected date.
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
    // Decreases the week count, updates the date, and scrolls to the beginning.
    setWeek(week - 1);
    setValue(moment(value).subtract(1, 'week').toDate());
    scrollViewRef.current.scrollTo({x: 0, animated: false});
  };

  // Navigates to the next week in the calendar.
  const navigateToNextWeek = () => {
    // Increases the week count, updates the date, and scrolls to the beginning.
    setWeek(week + 1);
    setValue(moment(value).add(1, 'week').toDate());
    scrollViewRef.current.scrollTo({x: 0, animated: false});
  };

  // Handles the editing of an event, populating the modal with event details.
  const handleEditEvent = event => {
    // Sets the selected event for editing.
    setEditedEvent(event);
    // Populates the modal fields with event details.
    setEventText(event.name);
    setEventDesc(event.description);
    // Displays the modal for editing.
    setShowAddModal(true);
  };

  // Handles the deletion of an event with a confirmation alert.
  const handleDeleteEvent = eventId => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: () => {
          // Filters out the deleted event from the events list.
          const updatedEvents = events.filter(event => event.id !== eventId);
          setEvents(updatedEvents);
        },
        style: 'destructive',
      },
    ]);
  };

  // Saves the edited event details and updates the corresponding client in Firestore.
  const saveEditedEvent = async () => {
    if (editedEvent && value) {
      // Maps over the events, updating the edited event and keeping others unchanged.
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

      // Updates the event details in Firestore.
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

  // Adds a new event with default or user-provided details and registers the client in Firestore.
  const handleAddEvent = () => {
    if (value) {
      // Creates a new event object with provided or default values.
      const newEvent = {
        id: Date.now(),
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

      // Registers the new client details in Firestore.
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

  // Adds a client to the calendar by creating a new event based on the client's information.
  const handleAddClientToCalendar = client => {
    const newEvent = {
      id: Date.now(),
      date: value,
      name: client.Name || 'Name',
      phone: client.Phone || 'Phone',
      address: client.Address || 'Address',
      neighborhood: client.Neighborhood || 'Neighborhood',
      description: client.Description || 'Description',
    };
    setEvents([...events, newEvent]);
    setShowAddModal(false);
  };

  // Cancels the process of adding or editing an event, resetting input fields and hiding the modal.
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

// Styles
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
  },
  eventButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
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
    marginLeft: 8,
    backgroundColor: 'red',
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
