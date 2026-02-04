import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

function Button(props) {
  const {
    title = 'Button',
    onPress = () => {},
    loading = false,
    disabled = false,
  } = props;

  return (
    <TouchableOpacity
      style={[styles.button, (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export default Button;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});
