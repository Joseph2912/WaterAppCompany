// RepeatModal.js
import React, {useState} from 'react';
import {Modal, View, Text, TouchableOpacity} from 'react-native';

const RepeatModal = ({
  visible,
  onClose,
  onSaveRepeatOption,
  clientToRepeat,
}) => {
  const [selectedOption, setSelectedOption] = useState('');

  const handleSave = () => {
    onSaveRepeatOption(selectedOption, clientToRepeat);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <View style={{backgroundColor: 'white', padding: 20, borderRadius: 10}}>
          <Text>Select Repeat Option:</Text>
          {/* Add your UI elements for repeat options here */}
          <TouchableOpacity onPress={() => setSelectedOption('daily')}>
            <Text>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedOption('weekly')}>
            <Text>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedOption('custom')}>
            <Text>Custom</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedOption('every15days')}>
            <Text>Every 15 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave}>
            <Text>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default RepeatModal;
