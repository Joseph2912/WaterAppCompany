import 'react-native-gesture-handler';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import ContentDrawer from './content-drawer';
import Login from '../screen/login-screen';
import SignUp from '../screen/signup-screen';
import Admin from '../screen/admin-screen';
import DriverScreen from '../screen/driver-screen';
import AdminDrivers from '../screen/admin-drivers-screen';
import DriverDetailsScreen from '../screen/ditails-delivery-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Platform} from 'react-native';
import ForgotPassword from '../screen/forgotPassword-screen';
import MapScreen from './map-for-drivers';

// Create navigation stacks and drawer
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer configuration for Admin
const DrawerAdmin = () => (
  <Drawer.Navigator
    initialRouteName="HomeAdmin"
    drawerContent={props => <ContentDrawer {...props} />}>
    <Drawer.Screen
      name="Dashboard"
      component={Admin}
      options={{
        headerShown: Platform.OS === 'ios' || Platform.OS === 'android',
      }}
    />
    <Drawer.Screen
      name="DriversAdmin"
      component={AdminDrivers}
      options={{
        headerShown: Platform.OS === 'ios' || Platform.OS === 'android',
      }}
    />
  </Drawer.Navigator>
);

// Drawer configuration for User
const DrawerUser = () => (
  <Drawer.Navigator
    initialRouteName="DriverScreen"
    drawerContent={props => <ContentDrawer {...props} />}>
    <Drawer.Screen
      name="Deliveries"
      component={DriverScreen}
      options={{
        headerShown: false,
        drawerIcon: ({color, size}) => (
          <Icon name="truck-delivery-outline" size={size} color={color} />
        ),
      }}
    />
  </Drawer.Navigator>
);

// Main navigation component
const Nav = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Admin" component={DrawerAdmin} />
      <Stack.Screen name="DriverScreen" component={DrawerUser} />
      <Stack.Screen name="DriverDetails" component={DriverDetailsScreen} />
      <Stack.Screen name="MapScreen" component={MapScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Forgot" component={ForgotPassword} />
      <Stack.Screen name="SignUp" component={SignUp} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default Nav;

//
