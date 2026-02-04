import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants/routes';

// Screens
import SplashScreen from '../screens/home/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Import your AppNavigator
import AppNavigator from './AppNavigator'; 
import AuditResultScreen from '../screens/home/AuditResultScreen';
import AuditDetailScreen from '../screens/home/AuditDetailScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.OTP} component={OtpScreen} />
      <Stack.Screen name={ROUTES.SIGNUP} component={SignupScreen} />
      <Stack.Screen name={ROUTES.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
        

      <Stack.Screen name="MainApp" component={AppNavigator} />
      <Stack.Screen name="AuditResult" component={AuditResultScreen} />
      <Stack.Screen name="AuditDetail" component={AuditDetailScreen} />

    </Stack.Navigator>
  );
}