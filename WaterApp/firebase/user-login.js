import {signInWithEmailAndPassword} from 'firebase/auth';
import {getDoc, doc, updateDoc} from 'firebase/firestore';
import {db} from './firebase-config';
import {Alert} from 'react-native';

const doLogin = async (auth, email, password, navigation) => {
  try {
    // Validaciones de entrada
    if (!email.endsWith('@gmail.com') && !email.endsWith('@hotmail.com')) {
      Alert.alert('Please verify that your email address is written correctly');
      //  return;
    } else if (email.length < 13) {
      Alert.alert('Please verify that your email address is written correctly');
      // return;
    } else if (password.length < 6) {
      Alert.alert('The password must be at least 6 characters');
      // return;
    }

    // Intento de inicio de sesión
    const login = await signInWithEmailAndPassword(auth, email, password);
    const user = login.user;

    // Verificación de la dirección de correo electrónico
    if (user.emailVerified) {
      const uid = user.uid;

      // Obtener documento de usuario
      const userDocRef = doc(db, 'User', uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const rol = userDocSnapshot.data().Rol;
        console.log(`Successful login. Role of the user: ${rol}`);

        // Redireccionar según el rol
        if (rol === 0) {
          navigation.reset({
            index: 0,
            routes: [{name: 'Admin'}],
          });
        } else {
          try {
            // Actualizar estado del cliente en Firestore
            const clientDocRef = doc(db, 'User', uid);
            await updateDoc(clientDocRef, {
              state: 'active',
            });
            console.log('Client updated in Firestore');
          } catch (error) {
            console.error('Error updating client in Firestore', error);
          }

          // Redireccionar a la pantalla de DriverScreen
          navigation.reset({
            index: 0,
            routes: [{name: 'DriverScreen'}],
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
    Alert.alert('Error during login. Please try again.');
  }
};

export {doLogin};
