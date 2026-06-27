import React, { ReactNode } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

type Props = {
  children: ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
  backgroundColor?: string;
};

export default function Screen({
  children,
  edges = ['top', 'left', 'right'],
  style,
  backgroundColor = Colors.white,
}: Props) {
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor }, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});