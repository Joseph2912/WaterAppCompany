import {signInWithEmailAndPassword, onAuthStateChanged} from 'firebase/auth';
import {getDoc, doc} from 'firebase/firestore';
import {db} from './config';
import {Alert} from 'react-native';


const doLogin = async (auth, email, password, navigation) => {
  // Validation of the form
  if (!email.endsWith('@gmail.com') && !email.endsWith('@hotmail.com')) {
    Alert.alert('Please verify that your email address is written correctly');
    // return;
  } else if (email.length < 13) {
    Alert.alert('Please verify that your email address is written correctly');
    //return;
  } else if (password.length < 6) {
    Alert.alert('The password must be at least 6 characters');
    // return;
  }
  // Log in using Firebase Auth
  try {
    const login = await signInWithEmailAndPassword(auth, email, password);
    const user = login.user;

    // Check if email is verified
    if (user.emailVerified) {
      const uid = user.uid;

      // Get the user document from Firestore
      const userDocRef = doc(db, 'User', uid);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        // Get the role of the user
        const rol = userDocSnapshot.data().Rol;
        console.log(`Successful login. Role of the user: ${rol}`);
        if (rol === 0) {
          navigation.reset({
            index: 0,
            routes: [{name: 'Admin'}],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{name: 'Test'}],
          });
        }
      } else {
        console.log('Error: User document not found.');
      }
    } else {
      console.log('Error: Please check your email before logging in.');
      Alert.alert('Please check your email before logging in.');
    }
  } catch (error) {
    console.log('Error when logging in: ', error);
  }
};

export {doLogin};
