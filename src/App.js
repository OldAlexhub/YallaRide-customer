import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import Popup from './components/Popup';
import { AuthProvider } from './context/AuthContext';
import { PopupProvider } from './context/PopupContext';
import useSocket from './hooks/useSocket';
import { I18nProvider } from './i18n';
import AppNavigator from './navigation/AppNavigator';

function AppContent() {
  // Global socket connection
  useSocket();

  return (
    <NavigationContainer theme={DefaultTheme}>
      <AppNavigator />
      <Popup />
    </NavigationContainer>
  );
}

function App() {
  return (
    <I18nProvider>
      <PopupProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </PopupProvider>
    </I18nProvider>
  );
}

export default App;