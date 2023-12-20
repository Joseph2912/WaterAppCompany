import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import LogOut from '../firebase/logOut';


function ContentDrawer( props) {
    return (
      <DrawerContentScrollView  {...props}>
        <DrawerItemList {...props} />
        <LogOut />
      </DrawerContentScrollView>
    );
  }
export default ContentDrawer;

