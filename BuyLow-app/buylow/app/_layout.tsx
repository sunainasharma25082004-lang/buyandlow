import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { Colors } from '../constants/colors';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Define a blue-theme for navigation
const BlueTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.white,
    text: Colors.text,
    border: Colors.border,
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={BlueTheme}>
        <AuthProvider>
          <CartProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="category/[name]" options={{ headerShown: false }} />
              <Stack.Screen
                name="cart"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="checkout"
                options={{
                  headerShown: true,
                  title: 'Checkout',
                  headerStyle: { backgroundColor: Colors.primary },
                  headerTintColor: Colors.white,
                  headerTitleStyle: { fontWeight: 'bold' },
                }}
              />
              <Stack.Screen
                name="wishlist"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="help"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="account"
                options={{ headerShown: false }}
              />
            </Stack>
          </CartProvider>
        </AuthProvider>
        <StatusBar style="light" backgroundColor={Colors.primary} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}