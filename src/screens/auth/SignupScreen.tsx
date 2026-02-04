import { View, Text } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function SignupScreen() {
  return ( 
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Signup</Text>

      <Input placeholder="Name" />
      <Input placeholder="Email" />
      <Input placeholder="Password" secureTextEntry />

      <Button title="Create Account" />
    </View>
  );
}
