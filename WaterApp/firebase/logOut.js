import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {getAuth, signOut} from 'firebase/auth';
import {useNavigation} from '@react-navigation/native';

function LogOut() {
  const auth = getAuth();
  const navigation = useNavigation();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
      console.log('yeeeepp buddyyyyy');
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.error('Error al cerrar sesión: ', error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        handleLogout();
      }}>
      <Text style={styles.buttonText}>Sign Out</Text>
    </TouchableOpacity>
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
    left: 10
  },
});
