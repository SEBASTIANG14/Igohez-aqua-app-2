import React from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface PhotoUploadProps {
  label?: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export default function PhotoUpload({
  label = 'Subir fotografía',
  subtitle,
  icon = 'photo-camera',
}: PhotoUploadProps) {
  return (
    <Pressable className="mb-6 w-full aspect-[16/10] bg-surface-container rounded-2xl border-2 border-dashed border-outline-variant items-center justify-center active:bg-surface-container-low">
      <View className="w-16 h-16 bg-primary-fixed/50 rounded-full items-center justify-center mb-3">
        <MaterialIcons name={icon} size={32} color="#005d90" />
      </View>
      <Text className="font-headline font-bold text-on-surface text-sm">{label}</Text>
      {subtitle && (
        <Text className="text-xs text-on-surface-variant mt-1">{subtitle}</Text>
      )}
    </Pressable>
  );
}
