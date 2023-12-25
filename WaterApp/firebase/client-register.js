import {doc, setDoc} from 'firebase/firestore';
import {db} from './firebase-config';

const RegisterClients = async (
  value,
  eventText,
  eventPhone,
  eventAddress,
  eventNeighborhood,
  eventDesc,
) => {
  try {
    const cleanedPhoneNumber = eventPhone.replace(/\D/g, '');

    const userDocRef = doc(db, 'Clients', cleanedPhoneNumber);
    await setDoc(userDocRef, {
      Date: value,
      Name: eventText,
      Phone: cleanedPhoneNumber,
      Address: eventAddress,
      Neighborhood: eventNeighborhood,
      Description: eventDesc,
    });
    console.log(
      'Cliente registrado con número de teléfono:',
      cleanedPhoneNumber,
    );
  } catch (error) {
    console.error('Error al enviar el cliente:', error);
  }
};

export {RegisterClients};
