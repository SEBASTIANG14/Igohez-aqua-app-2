import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface SectionCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'tinted';
}

export default function SectionCard({ icon, title, children, variant = 'default' }: SectionCardProps) {
  const containerClass =
    variant === 'tinted'
      ? 'bg-[#e8f4f0] rounded-2xl p-6 mb-6'
      : 'bg-surface-container-lowest rounded-2xl p-6 mb-6 shadow-sm';

  return (
    <View className={containerClass}>
      <View className="flex-row items-center gap-2 mb-6">
        <MaterialIcons name={icon} size={20} color="#005d90" />
        <Text className="font-headline font-bold text-lg text-on-surface">{title}</Text>
      </View>
      {children}
    </View>
  );
}
