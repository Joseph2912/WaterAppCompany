import 'react-native-gesture-handler';
import {View, TouchableOpacity, Text} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import ContentDrawer from './content-drawer';
import Login from '../screen/login-screen';
import SignUp from '../screen/signup-screen';
import Admin from '../screen/admin-screen';
import Test from '../screen/driver-screen';
import AdminDrivers from '../screen/admin-drivers';
import DriverDetailsScreen from '../screen/ditails-delivery-screen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerAdmin = () => (
  <Drawer.Navigator>
    <Drawer.Screen name="Home" component={Admin} />
    <Drawer.Screen name="Drivers" component={AdminDrivers} />
  </Drawer.Navigator>
);

const DrawerUser = () => (
  <Drawer.Navigator drawerContent={props => <ContentDrawer {...props} />}>
    <Drawer.Screen name="TestUser" component={Test} />
  </Drawer.Navigator>
);
const Nav = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Admin" component={DrawerAdmin} />
      <Stack.Screen name="TestUser" component={DrawerUser} />
      <Stack.Screen name="DriverDetails" component={DriverDetailsScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default Nav;
