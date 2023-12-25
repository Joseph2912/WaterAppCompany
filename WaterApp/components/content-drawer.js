import React from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import LogOut from '../firebase/user-logout';

function ContentDrawer(props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <LogOut />
    </DrawerContentScrollView>
  );
}
export default ContentDrawer;
