import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';

type ButtonProps = TouchableOpacityProps & {
  title: string;
  loading?: boolean;
};

export default function Button({ title, loading, disabled, style, ...rest }: ButtonProps) {
  const isDisabled = !!disabled || !!loading;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.button, isDisabled ? styles.buttonDisabled : undefined, style]}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text style={[styles.title, isDisabled && styles.titleDisabled]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  titleDisabled: {
    color: '#d1e7ee',
  },
});
