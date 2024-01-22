import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LogOut from '../firebase/user-logout';
import { useNavigation } from '@react-navigation/native';

const LeftBar = ({}) => {

    const navigation = useNavigation();
    const handleHome = () => {
        navigation.dispatch(
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Admin',
              },
            ],
          })
        );
      };
  return (
    <View style={styles.leftbar}>
      <View>
        <Text style={styles.titleDrivers}>Water App</Text>
      </View>
      <View style={styles.space}>
        <TouchableOpacity onPress={handleHome} style={styles.btnAddEvent}>
          <Text style={styles.btnAddEventText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnAddEvent}>
          <Text style={styles.btnAddEventText}>Drivers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnAddEvent}>
          <Text style={styles.btnAddEventText}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnAddEvent}>
          <Text style={styles.btnAddEventText}>Settings</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.LogOut}>
        <LogOut />
      </TouchableOpacity>
    </View>
  );
};

export default LeftBar;

const styles = StyleSheet.create({
    leftbar: {
        paddingTop: 30,
        paddingBottom: 30,
        flexDirection: 'column',
        padding: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        height: '100%',
        width: 200,
      },
      btnAddEvent: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 150,
        height: 48,
        borderRadius: 40,
        backgroundColor: '#007aff',
        marginBottom: 20,
      },
      btnAddEventText: {
        fontFamily: 'Nunito-Medium',
        fontSize: 15,
        color: '#fff',
      },
      titleDrivers: {
        fontFamily: 'Roboto-Bold',
        color: '#000',
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: 10,
        marginLeft: 10,
        marginBottom: 30,
      },
      LogOut: {
        paddingTop: 45,
        width: 150,
        height: 48,
        borderRadius: 40,
        borderColor: '#ddd',
        borderWidth: 1,
      },
    })