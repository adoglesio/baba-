import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';
import HomeScreen from '../screens/HomeScreen';
import PlayersScreen from '../screens/PlayersScreen';
import DrawScreen from '../screens/DrawScreen';
import MatchScreen from '../screens/MatchScreen';
import StatsScreen from '../screens/StatsScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Início: '🏠',
  Jogadores: '👥',
  Sorteio: '🔀',
  Partida: '🏁',
  Ranking: '📊',
};

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarIcon: () => <Text style={{ fontSize: 18 }}>{ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Jogadores" component={PlayersScreen} />
      <Tab.Screen name="Sorteio" component={DrawScreen} />
      <Tab.Screen name="Partida" component={MatchScreen} />
      <Tab.Screen name="Ranking" component={StatsScreen} />
    </Tab.Navigator>
  );
}
