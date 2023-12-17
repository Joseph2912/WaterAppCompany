import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
//import app from '.firebase'; // Asegúrate de importar la función correcta
import {getAuth, signOut} from 'firebase/auth';
import {useNavigation} from '@react-navigation/native';

function Admin() {
  const auth = getAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
      console.log('yeeeepp buddyyyyy');
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}], // Nombre de la pantalla principal después del inicio de sesión
      });
    } catch (error) {
      console.error('Error al cerrar sesión: ', error);
    }
  };
  return (
    <View>
      <Text style={styles.title}>Login</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          handleLogout();
        }}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
}
export default Admin;

const styles = StyleSheet.create({
  title: {
    fontSize: 44,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    top: -90,
  },
  button: {
    backgroundColor: '#000',
    height: 40,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: 300,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
