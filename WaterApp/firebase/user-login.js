import {signInWithEmailAndPassword} from 'firebase/auth';
import {getDoc, doc, updateDoc} from 'firebase/firestore';
import {db} from './firebase-config';
import {Alert} from 'react-native';

const doLogin = async (auth, email, password, navigation) => {
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

  try {
    const login = await signInWithEmailAndPassword(auth, email, password);
    const user = login.user;

    if (user.emailVerified) {
      const uid = user.uid;

      const userDocRef = doc(db, 'User', uid);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const rol = userDocSnapshot.data().Rol;
        console.log(`Successful login. Role of the user: ${rol}`);
        if (rol === 0) {
          navigation.reset({
            index: 0,
            routes: [{name: 'Admin'}],
          });
        } else {
          try {
            const clientDocRef = doc(db, 'User', uid);
            await updateDoc(clientDocRef, {
              state: 'active',
            });
            console.log('Client updated in Firestore');
          } catch (error) {
            console.error('Error updating client in Firestore', error);
          }
          navigation.reset({
            index: 0,
            routes: [{name: 'TestUser'}],
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
