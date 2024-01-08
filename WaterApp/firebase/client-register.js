import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from './firebase-config';

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
      Name: eventText,
      Phone: cleanedPhoneNumber,
      Address: eventAddress,
      Neighborhood: eventNeighborhood,
      Description: eventDesc,
    });

    // Formatea la fecha como un string para usarla como parte del nombre del documento (solo el día)
    const formattedDate = value.toISOString().split('T')[0]; // Obtién solo la parte de la fecha (yyyy-mm-dd)

    // Combina el número de teléfono con la fecha actual para generar un identificador único
    const documentId = `${cleanedPhoneNumber}_${formattedDate}`;

    // Agregar un evento en la subcolección "date" con el nombre del documento
    const eventsCollection = collection(userDocRef, 'date');
    await setDoc(doc(eventsCollection, documentId), {
      id: documentId, // También puedes almacenar el ID en el documento si lo necesitas
      date: value,
      name: eventText || 'Name',
    });

    console.log(
      'Cliente registrado con número de teléfono:',
      cleanedPhoneNumber,
    );
  } catch (error) {
    console.error('Error al enviar el cliente:', error);
  }
};

export { RegisterClients };
