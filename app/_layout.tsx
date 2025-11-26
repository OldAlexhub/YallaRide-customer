import { useColorScheme } from '@/hooks/use-color-scheme';
import Popup from '@/src/components/Popup';
import { AuthProvider } from '@/src/context/AuthContext';
import { PopupProvider } from '@/src/context/PopupContext';
import useSocket from '@/src/hooks/useSocket';
import AppNavigator from '@/src/navigation/AppNavigator';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Global socket connection
  useSocket();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PopupProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AppNavigator />
            <Popup />
          </ThemeProvider>
        </PopupProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}