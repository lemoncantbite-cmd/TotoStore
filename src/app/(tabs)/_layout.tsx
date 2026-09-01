import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  home: 'home',
  search: 'search',
  sell: 'add-circle',
  profile: 'person',
};

const LABELS: Record<string, string> = {
  home: 'Home',
  search: 'Search',
  sell: 'Sell',
  profile: 'Profile',
};

function FloatingTabBar({ state, navigation }: any) {
  return (
    <View style={styles.bar}>
      {state.routes.map((route: any, index: number) => {
        const focused = state.index === index;
        const iconName = ICONS[route.name] ?? 'home';

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.item, focused && styles.itemActive]}
          >
            <MaterialIcons
              name={iconName}
              size={focused ? 26 : 22}
              color={focused ? '#101214' : '#EFF5F5'}
            />
            <Text style={[styles.label, { color: focused ? '#101214' : '#EFF5F5' }]}>
              {LABELS[route.name] ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="sell" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#1F2A2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    minWidth: 72,
  },
  itemActive: {
    backgroundColor: '#BCEB5F',
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
  },
});
