import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import {collection, getDoc, doc, setDoc} from 'firebase/firestore';
import {db} from './config';

const doRegister = async (auth, email, password) => {
  try {
    const register = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const uid = register.user.uid;
    const RolUser = 1;
    const userDocRef = doc(db, 'User', uid);
    await setDoc(userDocRef, {
      Rol: RolUser,
      email: email,
      password: password,
    });

    await sendEmailVerification(register.user);
    console.log('Usuario creado con éxito');
  } catch (error) {
    console.error('Error al crear usuario:', error);
  }
};

const doLogin = async (auth, email, password, navigation) => {
  try {
    const login = await signInWithEmailAndPassword(auth, email, password);
    const user = login.user;
    if (user.emailVerified) {
      const uid = user.uid;
      const userDocRef = doc(db, 'User', uid);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const rol = userDocSnapshot.data().Rol;
        console.log(`Inicio de sesión exitoso. Rol del usuario: ${rol}`);
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
        console.log('Error: No se encontró el documento del usuario.');
      }
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
