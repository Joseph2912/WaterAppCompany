import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../screen/Login';
import SignUp from '../screen/SignUp';
import Admin from '../screen/Admin';

const Stack = createNativeStackNavigator();

export default function Nav() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Admin" component={Admin} />
    </Stack.Navigator>
  );
}
