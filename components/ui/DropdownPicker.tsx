import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface DropdownPickerProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function DropdownPicker({ label, options, value, onChange }: DropdownPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <View className="mb-5">
      <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold mb-2">
        {label}
      </Text>
      <Pressable
        onPress={() => setOpen(!open)}
        className="flex-row items-center justify-between bg-surface-container-high rounded-xl px-4 py-3.5"
      >
        <Text className="text-on-surface font-body text-sm">{value}</Text>
        <MaterialIcons
          name={open ? 'expand-less' : 'expand-more'}
          size={24}
          color="#005d90"
        />
      </Pressable>
      {open && (
        <View className="bg-surface-container-lowest rounded-xl mt-2 border border-outline-variant overflow-hidden">
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`px-4 py-3.5 border-b border-surface-container-high ${
                value === option ? 'bg-primary-fixed' : ''
              }`}
            >
              <Text
                className={`font-body text-sm ${
                  value === option ? 'text-primary font-bold' : 'text-on-surface'
                }`}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
