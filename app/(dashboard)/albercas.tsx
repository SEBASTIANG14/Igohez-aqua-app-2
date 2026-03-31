import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import TopAppBar from '@/components/ui/TopAppBar';
import PageHeader from '@/components/ui/PageHeader';
import GradientButton from '@/components/ui/GradientButton';
import PoolCard, { type PoolData } from '@/components/pool/PoolCard';
import { getPools, type Pool } from '@/services/pools';

// Map backend poolType to display label
const TYPE_DISPLAY: Record<string, string> = {
  'PARTICULAR': 'Particular',
  'COMERCIAL': 'Comercial',
  'RESIDENCIAL': 'Residencial',
  'CLUB_DEPORTIVO': 'Club Deportivo',
  'HOTEL': 'Hotel',
  'SALON': 'Salón',
};

function mapPoolToCard(pool: Pool): PoolData {
  const costLabel = pool.costPerWeek
    ? `$${pool.costPerWeek}/sem`
    : pool.costPerVisit
    ? `$${pool.costPerVisit}/vis`
    : '';

  return {
    id: pool.id,
    nombre: pool.name,
    direccion: pool.locationAddress || 'Sin dirección',
    tipo: TYPE_DISPLAY[pool.poolType] || pool.poolType,
    diaVisita: pool.maintenanceDay || '—',
    costoPeriodo: costLabel,
    status: 'active',
  };
}

export default function AlbercasScreen() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchPools = useCallback(async () => {
    try {
      setError('');
      const data = await getPools();
      setPools(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar albercas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh when screen comes into focus (e.g., after creating a new pool)
  useFocusEffect(
    useCallback(() => {
      fetchPools();
    }, [fetchPools])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPools();
  };

  const cardData = pools.map(mapPoolToCard);
  const totalIncome = pools.reduce((sum, p) => sum + (p.costPerWeek || 0), 0);

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />
      <TopAppBar />

      <ScrollView
        contentContainerClassName="px-6 pt-6 pb-36"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#005d90" />}
      >
        <PageHeader
          subtitle="GESTIÓN DE ACTIVOS"
          title="Mis Albercas"
          description={`${pools.length} albercas registradas`}
        />

        {/* Summary Cards */}
        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
            <View className="flex-row items-center gap-2 mb-2">
              <MaterialIcons name="pool" size={16} color="#005d90" />
              <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold">TOTAL</Text>
            </View>
            <Text className="font-headline font-extrabold text-3xl text-primary">{pools.length}</Text>
          </View>
          <View className="flex-1 bg-surface-container-lowest rounded-2xl p-5 shadow-sm">
            <View className="flex-row items-center gap-2 mb-2">
              <MaterialIcons name="attach-money" size={16} color="#00677d" />
              <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold">INGRESOS/SEM</Text>
            </View>
            <Text className="font-headline font-extrabold text-3xl text-secondary">
              ${totalIncome > 1000 ? `${(totalIncome / 1000).toFixed(1)}k` : totalIncome}
            </Text>
          </View>
        </View>

        {/* Loading */}
        {loading && (
          <View className="py-16 items-center">
            <ActivityIndicator size="large" color="#005d90" />
            <Text className="text-on-surface-variant mt-3">Cargando albercas...</Text>
          </View>
        )}

        {/* Error */}
        {error && !loading && (
          <View className="bg-error-container rounded-2xl p-6 items-center mb-6">
            <MaterialIcons name="error-outline" size={32} color="#93000a" />
            <Text className="text-on-error-container font-bold mt-2">{error}</Text>
            <Pressable onPress={fetchPools} className="mt-4 bg-primary px-6 py-2 rounded-full">
              <Text className="text-white font-bold text-sm">Reintentar</Text>
            </Pressable>
          </View>
        )}

        {/* Pool List */}
        {!loading && !error && (
          <>
            {cardData.length === 0 ? (
              <View className="bg-surface-container-lowest rounded-3xl p-10 items-center justify-center shadow-sm mb-6">
                <MaterialIcons name="pool" size={48} color="#bfc7d1" />
                <Text className="font-headline font-bold text-lg text-on-surface-variant mt-4">Sin albercas registradas</Text>
                <Text className="text-on-surface-variant text-sm mt-1 text-center">Agrega tu primera alberca para comenzar</Text>
              </View>
            ) : (
              <View className="mb-6">
                <Text className="font-label font-bold uppercase tracking-widest text-xs text-on-surface-variant px-1 mb-4">
                  Todas las Albercas
                </Text>
                <View className="flex-col gap-4">
                  {cardData.map((pool) => (
                    <PoolCard key={pool.id} pool={pool} />
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        <View className="mt-4">
          <GradientButton
            label="Agregar Nueva Alberca"
            icon="add-circle-outline"
            onPress={() => router.push('/(dashboard)/nueva')}
          />
        </View>
      </ScrollView>
    </View>
  );
}
