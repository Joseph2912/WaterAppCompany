import 'react-native-gesture-handler';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import ContentDrawer from './content-drawer';
import Login from '../screen/login-screen';
import SignUp from '../screen/signup-screen';
import Admin from '../screen/admin-screen';
import Test from '../screen/driver-screen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerAdmin = () => (
  <Drawer.Navigator>
    <Drawer.Screen name="Admin" component={Admin} />
  </Drawer.Navigator>
);

const DrawerUser = () => (
  <Drawer.Navigator drawerContent={props => <ContentDrawer {...props} />}>
    <Drawer.Screen name="Test" component={Test} />
  </Drawer.Navigator>
);
const Nav = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Admin" component={DrawerAdmin} />
      <Stack.Screen name="Test" component={DrawerUser} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default Nav;
