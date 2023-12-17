import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import {collection, addDoc, getDoc, doc} from 'firebase/firestore';
import {db} from './config';


const doRegister = async (auth, email, password) => {
  try {
    const register = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await sendEmailVerification(register.user);
    const user = register.user;
    if (user) {
      console.log('Registro exitoso. UID del nuevo usuario:', user.uid);
      await addDoc(collection(db, 'User'), {
        uid: user.uid,
        email: email,
        password: password,
      });
    }
  } catch (error) {
    console.log('error creando XD usuario: ', error);
  }
};

const doLogin = async (auth, email, password, navigation) => {
  try {
    const login = await signInWithEmailAndPassword(auth, email, password);
    const user = login.user;
    if (user.emailVerified) {
      console.log('Inicio de sesión exitoso. El correo está verificado.');
       navigation.reset({
         index: 0,
         routes: [{name: 'Admin'}],
       });
    } else {
      console.log(
        'Error: Por favor verifica tu correo electrónico antes de iniciar sesión.',
      );
    }
  } catch (error) {
    console.log('Error al iniciar sesión: ', error);
  }
};

export {doLogin, doRegister};
