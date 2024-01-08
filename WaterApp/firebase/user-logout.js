import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useEffect} from 'react';
import {getAuth, onAuthStateChanged, signOut} from 'firebase/auth';
import {doc, updateDoc} from 'firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import {db} from './firebase-config';

function LogOut() {
  const auth = getAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    const user = auth.currentUser;

    // Verifica si el usuario está autenticado antes de proceder
    if (user) {
      try {
        // Cerrar sesión
        await signOut(auth);

        // Actualizar el estado del documento en Firestore
        const userDocRef = doc(db, 'User', user.uid);
        await updateDoc(userDocRef, {
          estado: 'inactivo',
        });

        console.log('User updated in Firestore');
        navigation.navigate('Login');
        console.log('Logout successful');
        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      } catch (error) {
        console.error('Error al cerrar sesión: ', error);
      }
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          handleLogout();
        }}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

export default LogOut;

const styles = StyleSheet.create({
  button: {
    height: 40,
    alignItems: 'left',
    justifyContent: 'left',
    width: 'auto',
    padding: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'light',
    left: 10,
  },
});
