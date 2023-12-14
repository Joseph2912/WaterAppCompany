/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { doLogin } from './auth';


function App(): React.JSX.Element {

  const onLogin = async () => {
    await doLogin('hola@mundo.com', '123456')
  }

  useEffect( () => {
    onLogin()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View style={styles.inputContainer}>
        <TextInput
         // value={email}
          //onChangeText={(newEmail) => setEmail(newEmail)} 
          style={styles.input}
          placeholderTextColor="#ccc"
          placeholder="User"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
         // value={password}
        // onChangeText={(newPassword) => setPassword(newPassword)}
          style={styles.input}
          placeholderTextColor="#ccc"
          placeholder="Password"
          secureTextEntry={true}
        />
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
      <Text style={styles.link}>
        ¿Don't have an account?
        {/* Aquí va el enlace a la página de registro */}
      </Text>
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 44,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    top: -90,
  },
  inputContainer: {
    width: 300,
    height: 40,
    marginVertical: 18,
  },
  input: {
    flex: 1,
    fontSize: 18,
    borderRadius: 5,
    color: '#000',
    borderColor: '#ccc',
    backgroundColor: 'white',
    alignContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    //placeholder: 'black',
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
  link: {
    color: '#000',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginTop: 10,
    //textDecorationLine: 'none',
  },
});