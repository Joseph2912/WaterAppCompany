import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {doRegister} from '../firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {auth} from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

function SignUp(props) {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const RolUser = 1;
  const RolAdmin = 0;

  const onRegister = async () => {
    await doRegister(auth, email, password, navigation);
    // addDoc(collection(db, "User"),{
    //  email:email,
    //  password: password,
    // Rol: RolAdmin,
    // }).then(() =>{

    //  })
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SignUp</Text>
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
      <TouchableOpacity style={styles.button} onPress={onRegister}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.Login}
        onPress={() => {
          navigation.navigate('Login');
        }}>
        <Text style={styles.LoginText}>¿Do you have an account?</Text>
      </TouchableOpacity>
    </View>
  );
}

export default SignUp;

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
  Login: {
    color: '#000',
    fontSize: 16,
    backgroundColor: 'none',
    marginTop: 10,
    //textDecorationLine: 'none',
  },
  LoginText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'light',
  },
});
