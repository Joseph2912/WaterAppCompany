import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';

const Admin = () => {
  const [selected, setSelected] = useState('');
  const [notes, setNotes] = useState({});
  const [showNoteView, setShowNoteView] = useState(false);
  const [newNote, setNewNote] = useState('');

  const handleDayPress = (day) => {
    setSelected(day.dateString);
    setShowNoteView(true);
    setNewNote(notes[day.dateString]?.note || '');
  };

  const handleAddNote = () => {
    setNotes({ ...notes, [selected]: { dots: [{ color: 'orange' }], selected: true, note: newNote } });
    setShowNoteView(false);
  };

  const handleViewNote = () => {
    setShowNoteView(true);
  };

  const handleEditNote = () => {
    setShowNoteView(true);
  };

  const handleDeleteNote = () => {
    const updatedNotes = { ...notes };
    delete updatedNotes[selected];
    setNotes(updatedNotes);
    setShowNoteView(false);
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          ...notes,
          [selected]: { selected: true, disableTouchEvent: true, selectedDotColor: 'orange' },
        }}
        hideExtraDays
        current={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
        monthFormat={'yyyy-MM'}
        onMonthChange={() => setShowNoteView(true)}
      />

      {showNoteView && (
        <View style={styles.noteContainer}>
          <TextInput
            style={styles.input}
            placeholder="Añadir comentario"
            onChangeText={(text) => setNewNote(text)}
            value={newNote}
          />
          <TouchableOpacity style={styles.button} onPress={handleAddNote}>
            <Text style={styles.buttonText}>Guardar</Text>
          </TouchableOpacity>
          {notes[selected] && (
            <View>
              <Text style={styles.viewNoteText}>Comentario actual:</Text>
              <Text style={styles.viewNoteContent}>{notes[selected].note}</Text>
              <TouchableOpacity style={styles.button} onPress={handleEditNote}>
                <Text style={styles.buttonText}>Editar Comentario</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleDeleteNote}>
                <Text style={styles.buttonText}>Eliminar Comentario</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noteContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: 200,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4caf50',
    height: 40,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewNoteText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  viewNoteContent: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default Admin;
