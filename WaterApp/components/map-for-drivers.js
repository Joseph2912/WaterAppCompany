/*import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet, View, Text} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {doc, updateDoc} from 'firebase/firestore';
import {getAuth} from 'firebase/auth';
import {db} from '../firebase/firebase-config';

const MapScreen = () => {
  const auth = getAuth();
  const [position, setPosition] = useState({
    latitude: null,
    longitude: null,
    latitudeDelta: 0.0421,
    longitudeDelta: 0.0421,
  });
  const [locationObtained, setLocationObtained] = useState(false);

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      async pos => {
        const crd = pos.coords;

        // Calcular la distancia entre la ubicación actual y la última conocida
        const distance = calculateDistance(
          position.latitude,
          position.longitude,
          crd.latitude,
          crd.longitude,
        );

        if (distance >= 10) {
          // Actualizar si la distancia es mayor o igual a 10 metros
          try {
            const userRef = doc(db, 'User', auth.currentUser.uid);
            await updateDoc(userRef, {
              latitude: crd.latitude,
              longitude: crd.longitude,
            });

            setPosition({
              latitude: crd.latitude,
              longitude: crd.longitude,
              latitudeDelta: 0.0421,
              longitudeDelta: 0.0421,
            });

            setLocationObtained(true); // Marcar la ubicación como obtenida
          } catch (error) {
            console.error('Error updating location in Firestore:', error);
            setLocationObtained(true); // Marcar la ubicación como obtenida incluso si hay un error
          }
        }
      },
      err => {
        console.error(err);
        setLocationObtained(true); // Marcar la ubicación como obtenida incluso si hay un error
      },
      {enableHighAccuracy: true, distanceFilter: 10},
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, [auth, position]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distancia en kilómetros

    return distance * 1000;
  };

  const deg2rad = deg => {
    return deg * (Math.PI / 180);
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        {locationObtained ? (
          <MapView
            style={styles.mapStyle}
            initialRegion={{
              latitude: position.latitude,
              longitude: position.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={true}
            followsUserLocation={true}
            customMapStyle={mapStyle}>
            <Marker
              draggable
              coordinate={{
                latitude: position.latitude,
                longitude: position.longitude,
              }}
              onDragEnd={e => alert(JSON.stringify(e.nativeEvent.coordinate))}
              title={'Test Marker'}
              description={'This is a description of the marker'}
            />
          </MapView>
        ) : (
          <Text style={styles.loading}>Loading...</Text>
        )}

        {position.latitude !== null && position.longitude !== null && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              Latitude: {position.latitude}
            </Text>
            <Text style={styles.locationText}>
              Longitude: {position.longitude}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default MapScreen;

const mapStyle = [
  {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{color: '#263c3f'}],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{color: '#6b9a76'}],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{color: '#38414e'}],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{color: '#212a37'}],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{color: '#9ca5b3'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{color: '#746855'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{color: '#1f2835'}],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{color: '#f3d19c'}],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{color: '#2f3948'}],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{color: '#17263c'}],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{color: '#515c6d'}],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{color: '#17263c'}],
  },
];

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  mapStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  locationInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    marginBottom: 4,
    color: 'black',
  },
  loading: {
    flex: 1,
    color: '#000',
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
});
*/