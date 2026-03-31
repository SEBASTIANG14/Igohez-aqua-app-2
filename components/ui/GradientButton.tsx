import React from 'react';
import { Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}

export default function GradientButton({ label, icon, onPress }: GradientButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl shadow-lg active:scale-[0.97] overflow-hidden mb-6"
    >
      <LinearGradient
        colors={['#005d90', '#0077b6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="w-full py-5 flex-row items-center justify-center gap-3"
      >
        <Text className="text-white font-headline font-bold text-lg">{label}</Text>
        {icon && <MaterialIcons name={icon} size={22} color="white" />}
      </LinearGradient>
    </Pressable>
  );
}
