import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import {auth} from '../firebase/firebase-config';
import {sendPasswordResetEmail} from 'firebase/auth'; 

function ForgotPassword({navigation}) {
  const [email, setEmail] = useState('');

  // Function to handle password reset
  const resetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email); // Use sendPasswordResetEmail directly
      Alert.alert('Email sent', 'Check your email to reset your password.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error sending password reset email', error);
      Alert.alert(
        'Error',
        'Failed to send password reset email. Please try again.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.text}>Enter your email to reset your password.</Text>
      {/* Input field for user's email */}
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={newEmail => setEmail(newEmail.trim())}
        placeholderTextColor="#999"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={true}
        maxLength={30}
        minLength={16}
      />
      {/* Button to trigger password reset */}
      <TouchableOpacity style={styles.button} onPress={resetPassword}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
      {/* Option to navigate back to the login page */}
      <Text
        style={styles.signUpLink}
        onPress={() => {
          navigation.navigate('Login');
          setEmail('');
        }}>
        Back to login page
      </Text>
    </View>
  );
}

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  title: {
    fontSize: 44,
    color: 'black',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Roboto-Bold',
  },
  text: {
    fontFamily: 'Nunito-Medium',
    width: 300,
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 44,
  },
  input: {
    fontFamily: 'Nunito-Medium',
    fontSize: 16,
    borderRadius: 8,
    color: '#000',
    borderColor: '#ccc',
    backgroundColor: 'white',
    alignContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    width: 300,
  },
  button: {
    backgroundColor: '#007aff',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: 300,
    marginBottom: 20,
  },
  buttonText: {
    fontFamily: 'Nunito-Medium',
    color: '#fff',
    fontSize: 18,
  },
  SignUp: {
    marginTop: 20,
  },
  SignUpText: {
    fontFamily: 'Nunito-Medium',
    color: '#000',
    fontSize: 16,
    fontWeight: 'light',
    marginLeft: -20,
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  signUpLink: {
    fontFamily: 'Nunito-Medium',
    color: '#007aff',
    fontSize: 16,
    fontWeight: 'light',
    marginLeft: 5,
  },
});
