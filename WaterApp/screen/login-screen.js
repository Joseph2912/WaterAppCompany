import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {doLogin} from '../firebase/user-login';
import {useNavigation} from '@react-navigation/native';
import {onAuthStateChanged} from 'firebase/auth';
import {auth, db} from '../firebase/firebase-config';
import {doc, getDoc, updateDoc} from 'firebase/firestore';

function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if the user is already signed in when the component mounts
  useEffect(() => {
    const checkIfUserIsSignedIn = async () => {
      onAuthStateChanged(auth, async user => {
        if (user) {
          if (!user.emailVerified) {
            console.log('Error: Email not verified.');

            return;
          }

          const uid = user.uid;

          const userDocRef = doc(db, 'User', uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const role = userDocSnapshot.data().Rol;
            console.log(`User is already signed in. Role of the user: ${role}`);

            if (role === 0) {
              console.log('Redirecting to Admin page');
              navigation.reset({
                index: 0,
                routes: [{name: 'Admin'}],
              });
            } else {
              try {
                const clientDocRef = doc(db, 'User', uid);
                await updateDoc(clientDocRef, {
                  estado: 'activo',
                });
                console.log('Client updated in Firestore');
              } catch (error) {
                console.error('Error updating client in Firestore', error);
              }
              console.log('Updating user state to "activo"');
              console.log('Redirecting to TestUser page');
              navigation.reset({
                index: 0,
                routes: [{name: 'TestUser'}],
              });
            }
          } else {
            console.log('Error: User document not found.');
          }
        } else {
          console.log('User is not signed in.');
        }
      });
    };

    checkIfUserIsSignedIn();
  }, [navigation]);

  // Attempt to log in when the login button is pressed
  const onLogin = async () => {
    try {
      setLoading(true);
      await doLogin(auth, email, password, navigation);
    } finally {
      setLoading(false);
    }
  };

  // State to manage the focus of email and password inputs
  const [isInputEmailFocused, setIsInputEmailFocused] = useState(false);
  const [isInputPassFocused, setIsInputPassFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back!</Text>
      <Text style={styles.text}>
        Sign In to access your dashboard, all your work in one place.
      </Text>
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
      <Text
        style={styles.forgotPassword}
        onPress={() => {
          navigation.navigate('Forgot');
        }}>
        Forgot password?
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          onLogin();
        }}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log in</Text>
        )}
      </TouchableOpacity>
      <View style={styles.signUpContainer}>
        <Text style={styles.SignUpText}>Don't have an account?</Text>
        <Text
          style={styles.signUpLink}
          onPress={() => {
            navigation.navigate('SignUp');
            setEmail('');
            setPassword('');
          }}>
          Sign Up
        </Text>
      </View>
    </View>
  );
}

export default Login;

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
    marginBottom: 44,
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
