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
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  addDoc,
} from 'firebase/firestore';
import {onSnapshot} from 'firebase/firestore';
import {db} from '../firebase/firebase-config';
import {RegisterClients} from '../firebase/client-register';
import AdminDrivers from '../screen/admin-drivers-screen';
import LogOut from '../firebase/user-logout';
import {useNavigation} from '@react-navigation/native';

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
  const navigation = useNavigation();

  useEffect(() => {
    const fetchEventsFromClients = async () => {
      try {
        const clientsCollection = collection(db, 'Clients');
        const clientsSnapshot = await getDocs(clientsCollection);

        const tempEventsData = [];

        await Promise.all(
          clientsSnapshot.docs.map(async clientDoc => {
            const clientData = clientDoc.data();

            // Asegúrate de que clientData tenga la propiedad driverName
            const driverName = clientData.driverName || 'No Driver Assigned';

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
                driverName: driverName, // Incluye el nombre del conductor en el objeto de evento
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

  const [selectedDays, setSelectedDays] = useState([]);

  const toggleDaySelection = day => {
    if (day === 'All days') {
      // Toggle para "All days"
      setSelectAllDays(!selectAllDays);

      if (!selectAllDays) {
        // Si está seleccionado, agregar todos los días
        setSelectedDays([
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ]);
      } else {
        // Si no está seleccionado, deseleccionar todos los días
        setSelectedDays([]);
      }
    } else {
      // Toggle para días individuales
      const isSelected = selectedDays.includes(day);

      if (isSelected) {
        // Deseleccionar el día
        setSelectedDays(
          selectedDays.filter(selectedDay => selectedDay !== day),
        );
      } else {
        // Seleccionar el día
        setSelectedDays([...selectedDays, day]);
      }
    }
  };

  const renderDayButtons = () => {
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    return (
      <View
        style={{
          justifyContent: 'space-between',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
        }}>
        {[...daysOfWeek, 'All days'].map(day => (
          <TouchableOpacity
            key={day}
            onPress={() => toggleDaySelection(day)}
            style={{
              backgroundColor: selectedDays.includes(day) ? 'green' : 'gray',
              padding: 10,
              margin: 5,
              borderRadius: 5,
              flexDirection: 'row',
              width: '10%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{color: 'white'}}>{day.slice(0, 3)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleAddEvent = async () => {
    const startDate = moment(value);

    if (startDate.isValid()) {
      // Verificar si "All days" está seleccionado
      if (selectAllDays) {
        handleAddEvent3();
        return;
      }

      // Verificar si no hay días seleccionados
      if (selectedDays.length === 0) {
        handleAddEvent2(); // Llama a handleAddEvent2 en lugar de handleAddEvent
        return; // Sal del método handleAddEvent para evitar ejecutar el código restante
      } else {
        // Caso: Hay días seleccionados, agregar eventos para esos días
        for (let i = 0; i < 4; i++) {
          const currentWeek = startDate.clone().add(i, 'weeks');

          for (const selectedDay of selectedDays) {
            const currentDate = currentWeek.clone().day(selectedDay);

            const formattedDate = currentDate.toISOString().split('T')[0];
            const documentName = `${eventPhone}_${formattedDate}_${i + 1}`;

            try {
              const clientDocRef = doc(db, 'Clients', eventPhone);
              const eventsCollectionRef = collection(clientDocRef, 'date');

              const newEvent = {
                id: documentName,
                date: currentDate.toDate(),
                name: eventText || 'Name',
                phone: eventPhone || 'Phone',
                address: eventAddress || 'Address',
                neighborhood: eventNeighborhood || 'Neighborhood',
                description: eventDesc || 'Description',
              };

              await setDoc(doc(eventsCollectionRef, documentName), newEvent);
              console.log('Evento agregado con ID: ', documentName);

              setEvents(prevEvents => [...prevEvents, newEvent]);
            } catch (error) {
              console.error('Error al agregar el evento a Firestore:', error);
            }
          }
        }

        setEventText('');
        setEventPhone('');
        setEventAddress('');
        setEventNeighborhood('');
        setEventDesc('');
        setShowAddModal(false);

        RegisterClients(
          startDate,
          eventText,
          eventPhone,
          eventAddress,
          eventNeighborhood,
          eventDesc,
        );
      }
    }
  };
  const handleAddEvent2 = () => {
    const formattedDate = value.toISOString().split('T')[0];
    const documentName = `${eventPhone}_${formattedDate}`;

    if (value) {
      const newEvent = {
        id: documentName,
        date: value, // Convertir a un objeto Date
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

  const [selectAllDays, setSelectAllDays] = useState(false);

  const RegisterClients3 = async (
    startDate,
    name,
    phone,
    address,
    neighborhood,
    description,
  ) => {
    try {
      // Almacena la información del cliente en la colección principal
      const clientDocRef = doc(db, 'Clients', phone);
      await setDoc(clientDocRef, {
        Name: name || 'Name',
        Phone: phone || 'Phone',
        Address: address || 'Address',
        Neighborhood: neighborhood || 'Neighborhood',
        Description: description || 'Description',
      });

      // Itera sobre los próximos N días (por ejemplo, 30 días)
      for (let i = 0; i < 30; i++) {
        const currentDate = moment(startDate).add(i, 'days');
        const formattedDate = currentDate.format('YYYY-MM-DD');
        const documentName = `${phone}_${formattedDate}_${i + 1}`;

        // Crea un objeto de evento para el día actual
        const event = {
          date: currentDate.toDate(),
          name: name || 'Name',
          phone: phone || 'Phone',
          address: address || 'Address',
          neighborhood: neighborhood || 'Neighborhood',
          description: description || 'Description',
        };

        // Almacena el evento en la subcolección "date"
        const eventsCollectionRef = collection(clientDocRef, 'date');
        await setDoc(doc(eventsCollectionRef, documentName), event);
      }

      console.log(
        'Cliente y eventos registrados exitosamente para los próximos 30 días',
      );
    } catch (error) {
      console.error('Error al registrar cliente y eventos en Firestore', error);
    }
  };
  const handleAddEvent3 = () => {
    const startDate = moment(value);

    if (startDate.isValid()) {
      for (let i = 0; i < 30; i++) {
        const currentDate = startDate.clone().add(i, 'days');
        const formattedDate = currentDate.toISOString().split('T')[0];
        const documentName = `${eventPhone}_${formattedDate}_${i + 1}`;

        const newEvent = {
          id: documentName,
          date: currentDate.toDate(),
          name: eventText || 'Name',
          phone: eventPhone || 'Phone',
          address: eventAddress || 'Address',
          neighborhood: eventNeighborhood || 'Neighborhood',
          description: eventDesc || 'Description',
        };

        setEvents(prevEvents => [...prevEvents, newEvent]);
      }

      setEventText('');
      setEventPhone('');
      setEventAddress('');
      setEventNeighborhood('');
      setEventDesc('');
      setShowAddModal(false);

      // Registra el cliente y eventos para todos los días
      RegisterClients3(
        startDate,
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

  const handleHome = () => {
    navigation.dispatch(
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Admin',
          },
        ],
      }),
    );
  };

  const [selectedDaysClientList, setSelectedDaysClientList] = useState([]);
  const [selectAllDaysClientList, setSelectAllDaysClientList] = useState(false);

  const toggleDaySelectionClientList = day => {
    if (day === 'All days') {
      setSelectAllDaysClientList(!selectAllDaysClientList);

      if (!selectAllDaysClientList) {
        setSelectedDaysClientList([
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ]);
      } else {
        setSelectedDaysClientList([]);
      }
    } else {
      const isSelected = selectedDaysClientList.includes(day);

      if (isSelected) {
        setSelectedDaysClientList(
          selectedDaysClientList.filter(selectedDay => selectedDay !== day),
        );
      } else {
        setSelectedDaysClientList([...selectedDaysClientList, day]);
      }
    }
  };

  // Asegúrate de que esta función se encuentre dentro del componente funcional
  const getSelectedDays = () => {
    if (selectAllDays) {
      // Si "All days" está seleccionado, devolver todos los días de la semana
      return [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
    } else {
      // Si no está seleccionado, devolver los días seleccionados individualmente
      return selectedDays;
    }
  };

  const handleAddClientToCalendar = async client => {
    try {
      const clientDocRef = doc(db, 'Clients', client.Phone);
      const eventsCollection = collection(clientDocRef, 'date');
  
      const selectedDaysToggle = getSelectedDays();
      const today = moment(); // Obtén la fecha actual
      const startDate = today.clone().startOf('week'); // Comienza desde el inicio de la semana actual
  
      // Verificar si hay días seleccionados
      if (selectedDaysToggle.length > 0) {
        // Caso: Hay días seleccionados, agregar cliente para esos días
        for (let i = 0; i < 4; i++) {
          const currentWeek = startDate.clone().add(i, 'weeks');
  
          for (const selectedDay of selectedDaysToggle) {
            const currentDate = currentWeek.clone().day(selectedDay);
  
            // Verificar si la fecha es posterior o igual a hoy
            if (currentDate.isSameOrAfter(today)) {
              const formattedDate = currentDate.toISOString().split('T')[0];
              const documentName = `${client.Phone}_${formattedDate}_${i + 1}`;
  
              try {
                const newEvent = {
                  id: documentName,
                  date: currentDate.toDate(),
                  name: client.Name || 'Name',
                  phone: client.Phone || 'Phone',
                  address: client.Address || 'Address',
                  neighborhood: client.Neighborhood || 'Neighborhood',
                  description: client.Description || 'Description',
                };
  
                await setDoc(doc(eventsCollection, documentName), newEvent);
                console.log('Cliente agregado con ID: ', documentName);
  
                // Crear tarjeta (card) para el nuevo evento
                setEvents(prevEvents => [...prevEvents, newEvent]);
              } catch (error) {
                console.error(
                  'Error al agregar el cliente a Firestore:',
                  error,
                );
              }
            }
          }
        }
      } else {
        // Si no hay días seleccionados, llamar a handleAddClientToCalendar2
        await handleAddClientToCalendar2(client);
      }
  
      // Restablecer días seleccionados a un estado inicial
      resetSelectedDays();
      
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding client to calendar and Firestore', error);
    }
  };
  
  const resetSelectedDays = () => {
    // Restablecer días seleccionados a un estado inicial (puedes ajustar esto según tus necesidades)
    setSelectAllDays(false);
    setSelectedDays([]);
    setSelectAllDaysClientList(false);
    setSelectedDaysClientList([]);
  };
  
  const handleAddClientToCalendar2 = async client => {
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

  // Define state to track selected clients
  const [selectedClients, setSelectedClients] = useState([]);

  // Function to toggle client selection
  const toggleClientSelection = client => {
    const isSelected = selectedClients.includes(client);
    if (isSelected) {
      // If already selected, remove from the list
      setSelectedClients(
        selectedClients.filter(selectedClient => selectedClient !== client),
      );
    } else {
      // If not selected, add to the list
      setSelectedClients([...selectedClients, client]);
    }
  };

  // Update the renderClientList function to handle client selection
  const renderClientList = () => {
    return (
      <View style={styles.clientListContainer}>
        <View style={styles.headmodal}>
          <Text style={styles.clientListTitle}>Client List</Text>
          <TouchableOpacity
            style={styles.closeClientButton}
            onPress={handlecloseClientList}>
            <Text style={{color: '#000', fontSize: 16}}>X</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.clientListScrollView}>
          {clients.map(client => (
            <TouchableOpacity
              key={client.id}
              onPress={() => toggleClientSelection(client)}
              style={[
                styles.clientListItem,
                {
                  backgroundColor: selectedClients.includes(client)
                    ? '#99ccff'
                    : 'white',
                },
              ]}>
              <Text style={styles.clientListItemText}>{client.Name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.dayButtonsContainer}>{renderDayButtons()}</View>
        <TouchableOpacity
          style={styles.addClientsButton}
          onPress={() => {
            // Agrega los clientes seleccionados al calendario
            selectedClients.forEach(client =>
              handleAddClientToCalendar(client),
            );
            // Restablece los clientes seleccionados
            setSelectedClients([]);
            // Oculta la lista de clientes
            setShowClientList(false);
          }}>
          <Text style={styles.addClientsButtonText}>Add Selected Clients</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const EventCard = () => {
    return (
      <View style={styles.ContainerCards}>
        <ScrollView
          ref={scrollViewRef}
          vertical
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}>
          {selectedDateEvents.map((event, index) => (
            <View key={event.id} style={styles.eventCard}>
              <Card.Content>
                <View style={styles.delete}>
                  <TouchableOpacity
                    style={[styles.deleteButton]}
                    onPress={() => handleDeleteEvent(event.id)}>
                    <Text style={styles.TextDelete}>X</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.eventDate}>
                  {moment(event.date).format('MMM DD, YYYY')}
                </Text>
                <Text style={styles.eventDescription}>
                  NAME:
                  <Text style={styles.eventTitle}> {event.name}</Text>
                </Text>
                <Text style={styles.eventDescription}>
                  PHONE: <Text style={styles.eventTitle}>{event.phone}</Text>
                </Text>
                <Text style={styles.eventDescription}>
                  ADDRESS:{' '}
                  <Text style={styles.eventTitle}>{event.address}</Text>
                </Text>
                <Text style={styles.eventDescription}>
                  NEIGHBORHOOD:{' '}
                  <Text style={styles.eventTitle}>{event.neighborhood}</Text>
                </Text>
                <Text style={styles.eventDescription}>
                  COMMENT:{' '}
                  <Text style={styles.eventTitle}>{event.description}</Text>
                </Text>
                <Text style={styles.eventDescription}>
                  Driver Assigned:{' '}
                  <Text style={styles.eventTitle}>{event.driverName}</Text>
                </Text>
              </Card.Content>
              <View style={styles.eventButtons}>
                <TouchableOpacity
                  style={[styles.EditButon]}
                  onPress={() => handleEditEvent(event)}>
                  <Text style={styles.TextEdit}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
        {showAddModal && (
          <View style={styles.modalContainer}>
            <View style={styles.headmodal}>
              <Text style={styles.clientListTitle}>Client Information</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClosemodal}>
                <Text style={{color: '#444', fontSize: 18}}>X</Text>
              </TouchableOpacity>
            </View>
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
              placeholder="Phone"
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
            <View style={styles.dayButtonsContainer}>{renderDayButtons()}</View>
            {editedEvent ? (
              <TouchableOpacity
                onPress={saveEditedEvent}
                style={styles.addButton}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 16,
                    fontFamily: 'Nunito-Medium',
                    left: 3,
                  }}>
                  Save Edit
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.modalbuttons}>
                  <TouchableOpacity
                    style={styles.addButtonclientlist}
                    onPress={handleShowClientList}>
                    <Text
                      style={{
                        color: '#000',
                        fontSize: 16,
                        fontFamily: 'Roboto-Bold',
                      }}>
                      Client List
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddEvent}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 16,
                        fontFamily: 'Nunito-Medium',
                      }}>
                      Add Client
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.leftbar}>
        <View>
          <Text style={styles.titleDrivers}>Water App</Text>
        </View>
        <View style={styles.space}>
          <TouchableOpacity onPress={handleHome} style={styles.btnAddEvent}>
            <Text style={styles.btnAddEventText}>Home</Text>
          </TouchableOpacity>
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
            <Text style={styles.btnAddEventText}>Add client</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnAddEvent}>
            <Text style={styles.btnAddEventText}>Drivers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnAddEvent}>
            <Text style={styles.btnAddEventText}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnAddEvent}>
            <Text style={styles.btnAddEventText}>Settings</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.LogOut}>
          <LogOut />
        </TouchableOpacity>
      </View>
      <View style={styles.calendar}>
        <View key="monthTitle" style={styles.Header}>
          <Text style={styles.Dashboard}>Dashboard</Text>
          <Text style={styles.monthTitle}>
            {moment(weeks[2][0].date).format('MMMM YYYY')}
          </Text>
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
                        style={[
                          styles.itemWeekday,
                          isActive && {color: '#fff'},
                        ]}>
                        {item.weekday}
                      </Text>
                    </View>
                  </TouchableWithoutFeedback>
                );
              })}
            </View>
          </ScrollView>
          <TouchableOpacity
            onPress={navigateToNextWeek}
            style={styles.navButton}>
            <Text style={styles.navButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {showClientList ? renderClientList() : EventCard()}
      </View>
      <View style={styles.driverView}>
        <Text style={styles.titleDrivers}>Online Drivers</Text>
        <View style={styles.adminDriversContainer}>
          <AdminDrivers />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
  },
  addClientsButton: {
    backgroundColor: '#4CAF50', // Cambia el color según tus preferencias
    padding: 10,
    borderRadius: 5,
    margin: 10,
    alignItems: 'center',
  },

  addClientsButtonText: {
    color: 'white',
    fontSize: 16,
  },
  leftbar: {
    paddingTop: 30,
    paddingBottom: 30,
    flexDirection: 'column',
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    height: '100%',
    width: 200,
  },
  calendar: {
    flex: 1,
    paddingTop: 100,
    paddingBottom: 100,
    paddingLeft: 40,
    paddingRight: 40,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  driverView: {
    paddingTop: 25,
    backgroundColor: '#EFEEF3',
    height: '100%',
    width: 400,
    borderLeftWidth: 0.5,
    borderColor: '#ddd',
    paddingLeft: 20,
    paddingRight: 20,
  },

  adminDriversContainer: {
    flex: 1,
  },
  titleDrivers: {
    fontFamily: 'Roboto-Bold',
    color: '#000',
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 30,
  },
  Header: {
    marginTop: 16,
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  monthTitle: {
    color: '#000',
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Nunito-Medium',
  },
  Dashboard: {
    fontFamily: 'Roboto-Bold',
    color: '#000',
    fontSize: 30,
    fontWeight: 'bold',
  },
  itemRow: {
    flex: 1,
    justifyContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    height: 55,
    marginHorizontal: 8,
    borderRadius: 15,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemWeekday: {
    fontFamily: 'Nunito-Medium',
    fontSize: 13,
    color: '#808080',
  },
  space: {
    marginBottom: 50,
  },
  itemDate: {
    fontFamily: 'Roboto-Bold',
    fontWeight: '600',
    fontSize: 20,
    color: '#000',
  },
  headmodal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
    marginTop: 15,
  },
  dias: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
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
    flexGrow: 1,
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  scrollViewContent: {
    width: '100%',
  },
  eventCard: {
    marginBottom: 12,
    borderWidth: 2,
    borderRadius: 20,
    borderColor: '#ddd',
    padding: 16,
    width: '100%',
    height: 'auto',
    flexDirection: 'column',
  },
  eventDate: {
    fontSize: 13,
    color: '#777',
    marginBottom: 10,
    marginTop: -6,
    fontFamily: 'Nunito-Medium',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Nunito-Medium',
  },
  eventDescription: {
    marginVertical: 7,
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
    fontFamily: 'Roboto-Bold',
  },
  delete: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
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
    width: 80,
    backgroundColor: '#FFC107',
  },
  TextEdit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#303030',
    color: '#fff',
  },
  TextDelete: {
    fontSize: 16,
    color: '#555',
    fontFamily: 'Roboto-Bold',
    fontWeight: '500',
  },
  deleteButton: {
    borderRadius: 8,
    marginRight: -13,
    height: 25,
    width: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#ddd',
  },
  addButton: {
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    color: '#fff',
    backgroundColor: '#007aff',
    borderRadius: 10,
    fontFamily: 'Nunito-Medium',
    width: '50%',
    margin: 10,
  },
  addButtonclientlist: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    color: '#fff',
    borderColor: '#007aff',
    borderWidth: 2,
    borderRadius: 10,
    width: '50%',
    margin: 10,
  },
  closeButton: {
    borderRadius: 8,
    height: 25,
    width: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#ddd',
  },
  btnAddEvent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
    height: 48,
    borderRadius: 40,
    backgroundColor: '#007aff',
    marginBottom: 20,
  },
  LogOut: {
    paddingTop: 45,
    width: 150,
    height: 48,
    borderRadius: 40,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  btnAddEventText: {
    fontFamily: 'Nunito-Medium',
    fontSize: 15,
    color: '#fff',
  },
  modalContainer: {
    justifyContent: 'space-evenly',
    padding: 16,
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderRadius: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    width: '100%',
    height: '100%',
  },
  modalbuttons: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    height: 48,
    paddingLeft: 10,
    paddingRight: 10,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    color: '#000',
    borderRadius: 8,
    height: 40,
    padding: 10, // Ajusta según sea necesario
  },
  clientListContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    width: '100%',
    height: '100%',
  },
  closeClientButton: {
    borderRadius: 8,
    height: 25,
    width: 25,
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
    fontFamily: 'Nunito-Medium',
  },
  clientListScrollView: {
    marginBottom: 0,
  },
  clientListItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  clientListItemText: {
    fontSize: 16,
    color: '#333',
  },
});
