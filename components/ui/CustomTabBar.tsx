import React, { useState, useRef, useEffect } from 'react';
import { View, Pressable, Text, Platform, Animated } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export default function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const visibleTabs = ['index', 'agenda', '__plus__', 'calculator', 'albercas'];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: menuOpen ? 1 : 0,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }),
      Animated.timing(fadeAnim, {
        toValue: menuOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: menuOpen ? 1 : 0,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }),
    ]).start();
  }, [menuOpen]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const handleMenuOption = (route: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  return (
    <View
      className="absolute bottom-0 left-0 w-full items-center z-50"
      style={{ paddingBottom: Platform.OS === 'ios' ? 20 : 0 }}
    >
      {/* Overlay to close menu */}
      {menuOpen && (
        <Pressable
          onPress={() => setMenuOpen(false)}
          className="absolute -top-[800px] left-0 right-0 bottom-0"
          style={{ zIndex: 5 }}
        />
      )}

      {/* Popup Menu */}
      <Animated.View
        className="absolute items-center z-20"
        style={{
          top: -140,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
      >
        <View
          className="bg-white rounded-2xl overflow-hidden min-w-[200px]"
          style={{
            shadowColor: '#005d90',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 24,
            elevation: 16,
          }}
        >
          <Pressable
            onPress={() => handleMenuOption('/(dashboard)/nueva')}
            className="flex-row items-center gap-3 px-5 py-4 active:bg-primary-fixed border-b border-[#f0f2f5]"
          >
            <View className="w-10 h-10 rounded-xl bg-primary-fixed items-center justify-center">
              <MaterialIcons name="pool" size={20} color="#005d90" />
            </View>
            <View>
              <Text className="font-bold text-sm text-on-surface">Nueva Alberca</Text>
              <Text className="text-[11px] text-on-surface-variant">Registrar piscina</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => handleMenuOption('/(dashboard)/new-service')}
            className="flex-row items-center gap-3 px-5 py-4 active:bg-primary-fixed"
          >
            <View className="w-10 h-10 rounded-xl bg-secondary-fixed items-center justify-center">
              <MaterialIcons name="add-task" size={20} color="#00677d" />
            </View>
            <View>
              <Text className="font-bold text-sm text-on-surface">Nueva Visita</Text>
              <Text className="text-[11px] text-on-surface-variant">Programar servicio</Text>
            </View>
          </Pressable>
        </View>

        {/* Arrow pointing down */}
        <View
          className="w-4 h-4 bg-white -mt-2"
          style={{ transform: [{ rotate: '45deg' }] }}
        />
      </Animated.View>

      {/* FAB floating above the bar */}
      <View className="absolute -top-7 z-30">
        <Pressable
          onPress={() => setMenuOpen(!menuOpen)}
          className="w-[60px] h-[60px] rounded-full bg-primary items-center justify-center active:scale-90"
          style={{
            shadowColor: '#005d90',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 14,
            elevation: 12,
          }}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <MaterialIcons name="add" size={30} color="white" />
          </Animated.View>
        </Pressable>
      </View>

      {/* Tab bar */}
      <View
        className="w-full flex-row justify-around items-center bg-white px-2 pt-3 pb-5 rounded-t-3xl"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {visibleTabs.map((tabName) => {
          if (tabName === '__plus__') {
            return <View key="__plus__" className="w-[60px]" />;
          }

          const routeIndex = state.routes.findIndex((r: any) => r.name === tabName);
          if (routeIndex === -1) return null;

          const route = state.routes[routeIndex];
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? route.name;
          const iconName = options.tabBarIconName;
          const isFocused = state.index === routeIndex;

          const onPress = () => {
            if (menuOpen) setMenuOpen(false);
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              className="flex-col items-center justify-center active:scale-90 px-3"
            >
              <MaterialIcons
                name={iconName}
                size={24}
                color={isFocused ? '#005d90' : '#9ca3af'}
              />
              <Text
                className={`text-[10px] font-medium mt-1 ${
                  isFocused ? 'text-[#005d90]' : 'text-[#9ca3af]'
                }`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
