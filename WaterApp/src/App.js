import React, {Component, useState} from 'react';
import {View, StyleSheet, Text, TextInput, Button, TouchableHighlight} from 'react-native';

export default class Login extends Component {
    render() {
        return (
          <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Usuario"
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                secureTextEntry={true}
              />
            </View>
            <TouchableHighlight
              style={styles.button}
              onPress={this.handleSubmit}
            >
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            </TouchableHighlight>
            <Text style={styles.link}>
              ¿No tienes cuenta?
              {/* Aquí va el enlace a la página de registro */}
            </Text>
          </View>
        );
      }
    }
    

    const styles = StyleSheet.create({
        container: {
          backgroundColor: 'white',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        },
        title: {
          fontSize: 44,
          fontWeight: 'bold',
          textAlign: 'center',
          backgroundColor: 'white',
          marginBottom: 20,
        },
        inputContainer: {
          width: '80%',
          height: 40,
          marginVertical: 10,
        },
        input: {
          flex: 1,
          borderRadius: 5,
          borderColor: '#ccc',
          borderWidth: 1,
          paddingHorizontal: 10,
        },
        button: {
          backgroundColor: '#000',
          height: 40,
          borderRadius: 5,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 20,
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
        },
      });
      