import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import {getAuth, signOut} from 'firebase/auth';
import {useNavigation} from '@react-navigation/native';

function Test() {
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
      <Text style={styles.title}>Test</Text>
      <TouchableOpacity
        style={styles.SignUp}
        onPress={() => {
          handleLogout();
        }}>
        <Text style={styles.SignUpText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
}
export default Test;

const styles = StyleSheet.create({
  title: {
    fontSize: 44,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  SignUp: {
    backgroundColor: 'black',
    marginTop: 10,
    //textDecorationLine: 'none',
  },
  SignUpText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'light',
  },
});
