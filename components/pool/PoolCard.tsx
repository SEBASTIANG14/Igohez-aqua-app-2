import React from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

function getTypeColor(tipo: string) {
  switch (tipo) {
    case 'Particular': return { bg: 'bg-primary-fixed', text: 'text-primary' };
    case 'Comercial': return { bg: 'bg-secondary-fixed', text: 'text-secondary' };
    case 'Hotel': return { bg: 'bg-tertiary-fixed', text: 'text-tertiary' };
    case 'Residencial': return { bg: 'bg-[#e8d5ff]', text: 'text-[#5b3a8c]' };
    default: return { bg: 'bg-surface-container', text: 'text-on-surface-variant' };
  }
}

export interface PoolData {
  id: number;
  nombre: string;
  direccion: string;
  tipo: string;
  diaVisita: string;
  costoPeriodo: string;
  status: 'active' | 'inactive';
}

interface PoolCardProps {
  pool: PoolData;
  onPress?: () => void;
}

export default function PoolCard({ pool, onPress }: PoolCardProps) {
  const typeStyle = getTypeColor(pool.tipo);
  const isInactive = pool.status === 'inactive';

  return (
    <Pressable
      onPress={onPress}
      className={`bg-surface-container-lowest rounded-2xl p-5 active:scale-[0.98] shadow-sm relative overflow-hidden ${
        isInactive ? 'opacity-60' : ''
      }`}
    >
      {/* Left accent bar */}
      <View
        className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${
          isInactive ? 'bg-outline-variant' : 'bg-primary'
        }`}
      />

      <View className="flex-row items-start gap-4 pl-3">
        {/* Pool icon */}
        <View
          className={`w-12 h-12 rounded-2xl items-center justify-center ${
            isInactive ? 'bg-surface-container' : 'bg-primary-fixed'
          }`}
        >
          <MaterialIcons name="pool" size={24} color={isInactive ? '#707881' : '#005d90'} />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="font-headline font-bold text-lg text-on-surface" numberOfLines={1}>
            {pool.nombre}
          </Text>
          <View className="flex-row items-center gap-1 mt-1">
            <MaterialIcons name="location-on" size={14} color="#707881" />
            <Text className="text-on-surface-variant text-sm" numberOfLines={1}>
              {pool.direccion}
            </Text>
          </View>

          {/* Tags */}
          <View className="flex-row gap-2 mt-3 flex-wrap">
            <View className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${typeStyle.bg}`}>
              <Text className={`text-[10px] font-bold font-label uppercase ${typeStyle.text}`}>
                {pool.tipo}
              </Text>
            </View>
            {isInactive ? (
              <View className="flex-row items-center gap-1 px-3 py-1 rounded-full bg-error-container">
                <Text className="text-on-error-container text-[10px] font-bold font-label uppercase">
                  Inactiva
                </Text>
              </View>
            ) : (
              <>
                <View className="flex-row items-center gap-1 px-3 py-1 rounded-full bg-surface-container">
                  <MaterialIcons name="event" size={12} color="#404850" />
                  <Text className="text-on-surface-variant text-[10px] font-bold font-label uppercase">
                    {pool.diaVisita}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1 px-3 py-1 rounded-full bg-tertiary-fixed">
                  <Text className="text-on-tertiary-fixed-variant text-[10px] font-bold font-label uppercase">
                    {pool.costoPeriodo}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Chevron */}
        <MaterialIcons name="chevron-right" size={24} color={isInactive ? '#707881' : '#005d90'} />
      </View>
    </Pressable>
  );
}
