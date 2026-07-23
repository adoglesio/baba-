import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { colors } from './src/theme';

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.surface, border: colors.border, primary: colors.gold, text: colors.text },
};

function Root() {
  const { loading, ready } = useApp();
  if (loading || !ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Carregando Pelada+...</Text>
      </View>
    );
  }
  return (
    <NavigationContainer theme={navTheme}>
      <BottomTabNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: colors.textDim, fontWeight: '600' },
});
