import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface FormFieldProps extends TextInputProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export default function FormField({ label, icon, ...inputProps }: FormFieldProps) {
  return (
    <View className="mb-5">
      <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold mb-2">
        {label}
      </Text>
      <View className="flex-row items-center bg-surface-container-high rounded-xl px-4 py-3.5">
        {icon && (
          <MaterialIcons name={icon} size={18} color="#707881" style={{ marginRight: 10 }} />
        )}
        <TextInput
          className="flex-1 text-on-surface font-body text-sm"
          placeholderTextColor="#707881"
          {...inputProps}
        />
      </View>
    </View>
  );
}
