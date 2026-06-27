import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../i18n/types';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function LanguagePicker({ visible, onClose }: Props) {
  const { language, setLanguage, t, languages } = useLanguage();

  const handleSelect = async (code: Language) => {
    await setLanguage(code);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{t('account.selectLanguage')}</Text>
          {languages.map((item) => {
            const selected = language === item.code;
            return (
              <TouchableOpacity
                key={item.code}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => handleSelect(item.code)}
              >
                <View>
                  <Text style={styles.optionLabel}>{item.nativeLabel}</Text>
                  <Text style={styles.optionSub}>{item.label}</Text>
                </View>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.background,
  },
  optionSelected: {
    backgroundColor: Colors.lightBlue,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  optionSub: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
});