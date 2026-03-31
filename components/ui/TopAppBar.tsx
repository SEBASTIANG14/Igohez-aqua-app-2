import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface TopAppBarProps {
  showBack?: boolean;
  showAvatar?: boolean;
  avatarUri?: string;
  title?: string;
}

export default function TopAppBar({ showBack = false, showAvatar = true, avatarUri, title }: TopAppBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row justify-between items-center w-full px-5 py-4 bg-[#f7f9fb] z-50"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      <View className="flex-row items-center gap-3">
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-container-low"
          >
            <MaterialIcons name="arrow-back" size={24} color="#005d90" />
          </Pressable>
        ) : (
          <View className="w-10 h-10 rounded-full bg-primary-fixed items-center justify-center overflow-hidden">
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} className="w-full h-full" />
            ) : (
              <MaterialIcons name="pool" size={20} color="#005d90" />
            )}
          </View>
        )}
        <Text className="font-headline font-extrabold text-[#0077B6] text-2xl tracking-tight">
          {title || 'PoolFlow'}
        </Text>
      </View>

      {showAvatar && !showBack ? (
        <Pressable className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-container-low">
          <MaterialIcons name="notifications" size={24} color="#404850" />
        </Pressable>
      ) : (
        <View className="w-10 h-10 rounded-full bg-primary-fixed items-center justify-center overflow-hidden">
          <MaterialIcons name="person" size={20} color="#005d90" />
        </View>
      )}
    </View>
  );
}
