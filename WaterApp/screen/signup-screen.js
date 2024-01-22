import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {doRegister} from '../firebase/user-register';
import {useNavigation} from '@react-navigation/native';
import {auth} from '../firebase/firebase-config';

function SignUp() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle user registration
  const onRegister = async () => {
    await doRegister(auth, name, email, password);
    navigation.navigate('Login');
  };

  // State variables for handling focus on input fields
  const [isInputNameFocused, setIsInputNameFocused] = useState(false);
  const [isInputEmailFocused, setIsInputEmailFocused] = useState(false);
  const [isInputPassFocused, setIsInputPassFocused] = useState(false);

  return (
    <View style={[styles.container]}>
      <Text style={styles.title}>Let's Begin Your Journey</Text>
      <Text style={styles.text}>
        Enter your credentials and create an account.
      </Text>
      {/* Input field for user's name */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, isInputNameFocused && styles.inputNameFocused]}
          onFocus={() => setIsInputNameFocused(true)}
          onBlur={() => setIsInputNameFocused(false)}
          value={name}
          onChangeText={newName => setName(newName.trim())}
          placeholderTextColor="#999"
          placeholder="Enter your name"
          autoCapitalize="none"
          autoCorrect={true}
          maxLength={30}
          minLength={16}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isInputEmailFocused && styles.inputEmailFocused,
          ]}
          onFocus={() => setIsInputEmailFocused(true)}
          onBlur={() => setIsInputEmailFocused(false)}
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
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, isInputPassFocused && styles.inputPassFocused]}
          onFocus={() => setIsInputPassFocused(true)}
          onBlur={() => setIsInputPassFocused(false)}
          value={password}
          onChangeText={newPassword => setPassword(newPassword.trim())}
          placeholderTextColor="#999"
          placeholder="Enter your password"
          secureTextEntry={true}
          maxLength={24}
          minLength={6}
        />
      </View>
      {/* Button to trigger user registration */}
      <TouchableOpacity style={styles.button} onPress={onRegister}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      {/* Option to navigate to the login screen if user already has an account */}
      <View style={styles.signUpContainer}>
        <Text style={styles.SignUpText}>Do you have an account?</Text>
        <Text
          style={styles.signUpLink}
          onPress={() => {
            navigation.navigate('Login');
            setEmail('');
            setPassword('');
          }}>
          Sign In
        </Text>
      </View>
    </View>
  );
}

export default SignUp;

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
    textAlign: 'left',
    marginTop: 20,
    marginBottom: 34,
  },
  inputContainer: {
    width: 300,
    height: 48,
    marginVertical: 12,
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
  },
  inputEmailFocused: {
    borderColor: '#007aff',
    borderWidth: 1.5,
  },
  inputNameFocused: {
    borderColor: '#007aff',
    borderWidth: 1.5,
  },
  inputPassFocused: {
    borderColor: '#007aff',
    borderWidth: 1.5,
  },
  button: {
    backgroundColor: '#007aff',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: 300,
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
  forgotPassword: {
    fontFamily: 'Nunito-Medium',
    right: -90,
    color: '#007aff',
    fontSize: 14,
    fontWeight: 'light',
    marginBottom: 20,
  },
});
