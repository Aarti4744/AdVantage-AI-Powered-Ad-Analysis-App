import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function Button({ title, onPress }: any) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
