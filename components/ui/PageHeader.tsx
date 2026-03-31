import React from 'react';
import { View, Text } from 'react-native';

interface PageHeaderProps {
  subtitle: string;
  title: string;
  description?: string;
}

export default function PageHeader({ subtitle, title, description }: PageHeaderProps) {
  return (
    <View className="mb-8">
      <Text className="font-label uppercase tracking-widest text-xs text-on-surface-variant mb-2">
        {subtitle}
      </Text>
      <Text className="font-headline font-extrabold text-3xl text-on-surface tracking-tight mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-on-surface-variant font-body text-sm leading-relaxed">
          {description}
        </Text>
      )}
    </View>
  );
}
