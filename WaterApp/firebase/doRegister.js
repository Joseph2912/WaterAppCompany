import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import {doc, setDoc} from 'firebase/firestore';
import {db} from './config';
import {Alert} from 'react-native';

// Function to handle user registration
const doRegister = async (auth, email, password, navigation) => {
  // Form validation checks
  if (!email.endsWith('@gmail.com') && !email.endsWith('@hotmail.com')) {
    Alert.alert(
      'Error',
      'Please verify that your email address is written correctly',
    );
   // return;
  } else if (email.length < 13) {
    Alert.alert(
      'Error',
      'Please verify that your email address is written correctly',
    );
    //return;
  } else if (password.length < 6) {
    Alert.alert('Error', 'The password must be at least 6 characters');
    return;
  }

  try {
    // Create user using Firebase Auth
    const register = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Get UID and set user document in Firestore
    const uid = register.user.uid;
    const RolUser = 1;
    const userDocRef = doc(db, 'User', uid);
    await setDoc(userDocRef, {
      Rol: RolUser,
      email: email,
      password: password,
    });

    // Send email verification
    await sendEmailVerification(register.user);

    // Inform the user and navigate to login screen
    Alert.alert('Success', 'We have sent an email to verify your account');
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  } catch (error) {
    console.error('Error when creating a user:', error);
  }
};

export {doRegister};
