import 'react-native-gesture-handler';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import Login from '../screen/Login';
import SignUp from '../screen/SignUp';
import Admin from '../screen/Admin';
import Test from '../screen/test';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerAdmin = () => (
  <Drawer.Navigator>
    <Drawer.Screen name="Admin" component={Admin} />
    <Drawer.Screen name="Test" component={Test} />
  </Drawer.Navigator>
);

const Nav = () => (

  
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Admin" component={DrawerAdmin} />
      <Stack.Screen name="Test" component={DrawerAdmin} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default Nav;
