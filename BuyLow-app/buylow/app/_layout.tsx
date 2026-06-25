import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <CartProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="product" options={{ headerShown: false }} />
            <Stack.Screen name="category" options={{ headerShown: false }} />
            <Stack.Screen name="cart" options={{ headerShown: true, title: 'Shopping Cart' }} />
            <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
          </Stack>
        </CartProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}