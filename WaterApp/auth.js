import { createUserWithEmailAndPassword } from "firebase/auth";
import { app, auth } from "./firebase/config";

const doLogin = async (email, password) => {
    try {
        const login = await createUserWithEmailAndPassword(auth, email, password)
    } catch( error ) {
        console.log('error creando usuario', error)
    }
}

export { doLogin }