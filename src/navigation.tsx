import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  createNavigationContainerRef,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  getInitialNotification,
  getMessaging,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';
import {
  BookHeart,
  House,
  ListChecks,
  MessageCircleHeart,
  User,
} from 'lucide-react-native';
import { useApp } from './context/AppContext';
import { OnboardingProvider } from './context/OnboardingContext';
import WelcomeScreen from './screens/onboarding/WelcomeScreen';
import NameScreen from './screens/onboarding/NameScreen';
import StartDateScreen from './screens/onboarding/StartDateScreen';
import QuizScreen from './screens/onboarding/QuizScreen';
import PairScreen from './screens/PairScreen';
import PairedScreen from './screens/PairedScreen';
import HomeScreen from './screens/main/HomeScreen';
import QuestionsScreen from './screens/main/QuestionsScreen';
import PackScreen from './screens/main/PackScreen';
import StarterAnswersScreen from './screens/main/StarterAnswersScreen';
import MemoriesScreen from './screens/main/MemoriesScreen';
import MemoryEditorScreen from './screens/main/MemoryEditorScreen';
import ListsScreen from './screens/main/ListsScreen';
import ListSearchScreen from './screens/main/ListSearchScreen';
import ProfileScreen from './screens/main/ProfileScreen';
import { findQuestion } from './data/questions';
import { colors, fonts } from './theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
export const navigationRef = createNavigationContainerRef<any>();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.surface, primary: colors.ink },
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: { ...fonts.bodyMedium, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Ana sayfa', tabBarIcon: ({ color }) => <House size={22} color={color} /> }}
      />
      <Tab.Screen
        name="Questions"
        component={QuestionsScreen}
        options={{ title: 'Sorular', tabBarIcon: ({ color }) => <MessageCircleHeart size={22} color={color} /> }}
      />
      <Tab.Screen
        name="Memories"
        component={MemoriesScreen}
        options={{ title: 'Anılar', tabBarIcon: ({ color }) => <BookHeart size={22} color={color} /> }}
      />
      <Tab.Screen
        name="Lists"
        component={ListsScreen}
        options={{ title: 'Listeler', tabBarIcon: ({ color }) => <ListChecks size={22} color={color} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profil', tabBarIcon: ({ color }) => <User size={22} color={color} /> }}
      />
    </Tab.Navigator>
  );
}

/** Opens the right screen when the user taps a push notification. */
function useNotificationRouting(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const messaging = getMessaging();
    const route = (data?: Record<string, any>) => {
      if (!navigationRef.isReady()) {
        return;
      }
      const found = data?.questionId ? findQuestion(String(data.questionId)) : null;
      if (found) {
        navigationRef.navigate('Pack', { packId: found.pack.id });
      }
    };
    getInitialNotification(messaging).then(m => m && route(m.data));
    return onNotificationOpenedApp(messaging, m => route(m.data));
  }, [enabled]);
}

export function RootNavigator() {
  const { ready, profile, partner } = useApp();
  const onboarded = !!profile?.onboarded;
  const [navReady, setNavReady] = useState(false);
  useNotificationRouting(onboarded);

  // Show the "you're paired" screen once, for both partners.
  const celebrate =
    navReady && onboarded && !!profile?.coupleId && !!partner && profile?.pairCelebrated === false;
  useEffect(() => {
    if (celebrate && navigationRef.getCurrentRoute()?.name !== 'Paired') {
      navigationRef.navigate('Paired');
    }
  }, [celebrate]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return (
    <OnboardingProvider>
      <NavigationContainer ref={navigationRef} theme={theme} onReady={() => setNavReady(true)}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!onboarded ? (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="OnbName" component={NameScreen} />
              <Stack.Screen name="OnbDate" component={StartDateScreen} />
              <Stack.Screen name="OnbQuiz" component={QuizScreen} />
              <Stack.Screen name="Pair" component={PairScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Tabs" component={Tabs} />
              <Stack.Screen name="Pack" component={PackScreen} />
              <Stack.Screen
                name="StarterAnswers"
                component={StarterAnswersScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="Paired"
                component={PairedScreen}
                options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }}
              />
              <Stack.Screen
                name="Pair"
                component={PairScreen}
                options={{ animation: 'slide_from_bottom' }}
              />
              <Stack.Group screenOptions={{ presentation: 'modal' }}>
                <Stack.Screen name="MemoryEditor" component={MemoryEditorScreen} />
                <Stack.Screen name="ListSearch" component={ListSearchScreen} />
              </Stack.Group>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </OnboardingProvider>
  );
}
