import React from 'react';
import { StyleSheet, TextInput, View, TextInputProps } from 'react-native';

type InputProps = TextInputProps & {
  containerStyle?: any;
};

export default function Input({ style, containerStyle, ...rest }: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#94a3b8"
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    backgroundColor: '#ffffff',
  },
  input: {
    fontSize: 16,
    padding: 0,
  },
});
