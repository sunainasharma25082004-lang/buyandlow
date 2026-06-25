import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function SearchBar() {
  const router = useRouter();

  const goToSearch = () => router.push('/(tabs)/search');

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.inputContainer} onPress={goToSearch} activeOpacity={0.8}>
        <Feather name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
        <TextInput 
          placeholder="Search for products, brands and more..."
          placeholderTextColor={Colors.textLight}
          style={styles.input}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.searchButton} onPress={goToSearch}>
        <Feather name="search" size={20} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: Colors.white,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: Colors.text,
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  }
});