import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {getAuth, onAuthStateChanged, signOut} from 'firebase/auth';
import {doc, updateDoc} from 'firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import {db} from './firebase-config';
import Icon from 'react-native-vector-icons/SimpleLineIcons';

function LogOut() {
  const auth = getAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    const user = auth.currentUser;

    if (user) {
      try {
        await signOut(auth);

        const userDocRef = doc(db, 'User', user.uid);
        await updateDoc(userDocRef, {
          state: 'inactive',
        });

        console.log('User updated in Firestore');
        navigation.replace('Login');
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
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 20, //
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    height: 40,
    width: 'auto',
    padding: 8,
  },
  buttonText: {
    fontFamily: 'Nunito-Medium',
    color: '#333',
    fontSize: 15,
    marginLeft: 40,
  },
  ico: {
    marginLeft: 10,
    color: '#333',
  },
});

export default LogOut;
