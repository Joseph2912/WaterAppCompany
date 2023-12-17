import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {doLogin} from '../firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {auth} from '../firebase/config';

function Login(props) {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const RolUser = 1;
  const RolAdmin = 0;

  const onLogin = async () => {
    await doLogin(auth, email, password, navigation);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View style={styles.inputContainer}>
        <TextInput
          value={email}
          onChangeText={newEmail => setEmail(newEmail)}
          style={styles.input}
          placeholderTextColor="#ccc"
          placeholder="User"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          value={password}
          onChangeText={newPassword => setPassword(newPassword)}
          style={styles.input}
          placeholderTextColor="#ccc"
          placeholder="Password"
          secureTextEntry={true}
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
          Log In
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.SignUp}
        onPress={() => {
          navigation.navigate('SignUp');
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
  SignUp: {
    color: '#000',
    fontSize: 16,
    backgroundColor: 'none',
    marginTop: 10,
    //textDecorationLine: 'none',
  },
  SignUpText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'light',
  },
});
