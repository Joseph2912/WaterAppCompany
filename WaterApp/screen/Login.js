import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {doLogin} from '../firebase/doLogin';
import {useNavigation} from '@react-navigation/native';
import {auth} from '../firebase/config';

function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    await doLogin(auth, email, password, navigation);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcom back</Text>
      <Text style={styles.Email}>Email</Text>
      <View style={styles.inputContainer}>
        <TextInput
          value={email}
          onChangeText={newEmail => setEmail(newEmail.trim())}
          style={styles.input}
          placeholderTextColor="#ccc"
          placeholder="Email@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={true}
          maxLength={30}
          minLength={16}
        />
      </View>
      <Text style={styles.Password}>Password</Text>
      <View style={styles.inputContainer}>
        <TextInput
          value={password}
          onChangeText={newPassword => setPassword(newPassword.trim())}
          style={styles.input}
          placeholderTextColor="#ccc"
          placeholder="123456"
          secureTextEntry={true}
          maxLength={24}
          minLength={6}
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          onLogin();
        }}>
        <Text
          style={styles.buttonText}
          onPress={() => {
            onPress = {onLogin};
          }}>
          Login
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.SignUp}
        onPress={() => {
          navigation.navigate('SignUp');
          setEmail('');
          setPassword('');
        }}>
        <Text style={styles.SignUpText}>¿Don't have an account?</Text>
      </TouchableOpacity>
    </View>
  );
}

export default Login;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    top: -90,
  },
  inputContainer: {
    width: 300,
    height: 40,
    marginVertical: 12,
  },
  input: {
    flex: 2,
    fontSize: 18,
    borderRadius: 5,
    color: '#000',
    borderColor: '#ccc',
    backgroundColor: 'white',
    alignContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
  },
  Email: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'normal',
    left: -118,
  },
  Password: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'normal',
    left: -100,
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
    fontWeight: 'normal',
  },
  SignUp: {
    color: '#000',
    fontSize: 16,
    backgroundColor: 'none',
    marginTop: 20,
    left: -50,
  },
  SignUpText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'light',
    textAlign: 'left',
  },
});
