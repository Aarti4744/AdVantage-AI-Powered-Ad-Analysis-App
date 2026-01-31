import { View, Text } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ForgotPasswordScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Forgot Password</Text>

      <Input placeholder="Email" />
      <Button title="Send Reset Link" />
    </View>
  );
}
