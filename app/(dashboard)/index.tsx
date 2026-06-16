import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';

import TopAppBar from '@/components/ui/TopAppBar';
import { getPools, type Pool } from '@/services/pools';
import { getAllVisits, type Visit } from '@/services/visits';

export default function DashboardIndexScreen() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [poolsData, visitsData] = await Promise.all([getPools(), getAllVisits()]);
      setPools(poolsData);
      setVisits(visitsData);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const today = new Date().toISOString().split('T')[0];

  const todayVisits = useMemo(() => {
    return visits.filter((v) => v.date.split('T')[0] === today);
  }, [visits, today]);

  const todayEarnings = useMemo(() => {
    return todayVisits.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
  }, [todayVisits]);

  const weekEarnings = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    return visits
      .filter((v) => new Date(v.date) >= weekStart)
      .reduce((sum, v) => sum + (v.totalAmount || 0), 0);
  }, [visits]);

  const avgPerService = useMemo(() => {
    if (visits.length === 0) return 0;
    const total = visits.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
    return Math.round(total / visits.length);
  }, [visits]);

  // Get upcoming visits (today and future, sorted)
  const upcomingVisits = useMemo(() => {
    return visits
      .filter((v) => v.date.split('T')[0] >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [visits, today]);

  // Simple weekly chart data (last 7 days earnings)
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayTotal = visits
        .filter((v) => v.date.split('T')[0] === key)
        .reduce((sum, v) => sum + (v.totalAmount || 0), 0);
      days.push({ key, total: dayTotal, isToday: i === 0 });
    }
    const max = Math.max(...days.map((d) => d.total), 1);
    return days.map((d) => ({ ...d, height: Math.max((d.total / max) * 100, 5) }));
  }, [visits]);

  const completedToday = todayVisits.length;
  const totalPools = pools.length;
  const completionPct = totalPools > 0 ? Math.round((completedToday / totalPools) * 100) : 0;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />
      <TopAppBar />

      <ScrollView
        contentContainerClassName="px-6 py-8 pb-36"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#005d90" />}
      >
        {/* Hero Summary */}
        <View className="mb-10 overflow-hidden rounded-[2rem] shadow-lg">
          <LinearGradient
            colors={['#005d90', '#0077b6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-8 relative"
          >
            <View className="relative z-10">
              <Text className="font-label uppercase tracking-widest text-xs text-primary-fixed mb-2">Resumen del día</Text>
              {loading ? (
                <ActivityIndicator color="white" size="small" className="my-4" />
              ) : (
                <>
                  <Text className="font-headline font-bold text-4xl text-white tracking-tight">
                    {completedToday} visita{completedToday !== 1 ? 's' : ''} hoy
                  </Text>
                  <View className="mt-6 flex-row items-center gap-3 flex-wrap">
                    <View className="bg-secondary-fixed px-4 py-1.5 rounded-full">
                      <Text className="text-on-secondary-fixed text-sm font-medium">{pools.length} albercas</Text>
                    </View>
                    <Text className="text-primary-fixed text-sm">
                      ${todayEarnings.toLocaleString()} ganado hoy
                    </Text>
                  </View>
                  <View className="w-full mt-5">
                    <View className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                      <View className="h-full bg-white rounded-full" style={{ width: `${Math.min(completionPct, 100)}%` }} />
                    </View>
                  </View>
                </>
              )}
            </View>
            <View className="absolute top-0 right-0 opacity-10 pointer-events-none overflow-hidden" style={{ width: 160, height: 160 }}>
              <MaterialIcons name="waves" size={160} color="white" />
            </View>
          </LinearGradient>
        </View>

        {/* Quick Access */}
        <View className="flex-row gap-4 mb-8">
          <Pressable className="flex-1 flex-col items-center justify-center p-6 bg-surface-container-lowest rounded-[2rem] active:scale-95" onPress={() => router.push('/(dashboard)/new-service')}>
            <View className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center mb-3">
              <MaterialIcons name="add-task" size={24} color="#005d90" />
            </View>
            <Text className="font-label font-bold text-xs uppercase tracking-wider text-on-surface">Nueva Visita</Text>
          </Pressable>
          <Pressable className="flex-1 flex-col items-center justify-center p-6 bg-surface-container-lowest rounded-[2rem] active:scale-95" onPress={() => router.push('/(dashboard)/nueva')}>
            <View className="w-12 h-12 rounded-2xl bg-tertiary-fixed flex items-center justify-center mb-3">
              <MaterialIcons name="pool" size={24} color="#3b5e65" />
            </View>
            <Text className="font-label font-bold text-xs uppercase tracking-wider text-on-surface">Nueva Alberca</Text>
          </Pressable>
        </View>

        <View className="flex-col lg:flex-row gap-8">
          {/* Upcoming Appointments */}
          <View className="flex-1">
            <View className="bg-surface-container-low rounded-[2rem] p-6">
              <View className="flex-row items-center gap-2 mb-6">
                <MaterialIcons name="calendar-today" size={24} color="#005d90" />
                <Text className="font-headline font-bold text-xl text-on-surface">Próximas Citas</Text>
              </View>

              {loading ? (
                <ActivityIndicator color="#005d90" className="my-8" />
              ) : upcomingVisits.length === 0 ? (
                <View className="items-center py-8">
                  <MaterialIcons name="event-available" size={36} color="#bfc7d1" />
                  <Text className="text-on-surface-variant text-sm mt-2">Sin citas próximas</Text>
                </View>
              ) : (
                <View className="flex-col gap-4">
                  {upcomingVisits.map((visit) => {
                    const isToday = visit.date.split('T')[0] === today;
                    const time = new Date(visit.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <Pressable 
                        key={visit.id} 
                        onPress={() => router.push(`/(dashboard)/visit/${visit.id}` as any)}
                        className="bg-surface-container-lowest p-5 rounded-2xl flex-row items-center gap-4 relative overflow-hidden active:bg-surface-container-low"
                      >
                        <View className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${isToday ? 'bg-primary' : 'bg-outline-variant opacity-30'}`} />
                        <View className="flex-1 pl-2">
                          <Text className="font-headline font-bold text-lg text-on-surface">{visit.pool?.name || 'Alberca'}</Text>
                          {visit.pool?.locationAddress ? (
                            <View className="flex-row items-center gap-1 mt-1">
                              <MaterialIcons name="location-on" size={14} color="#404850" />
                              <Text className="text-on-surface-variant text-sm" numberOfLines={1}>{visit.pool.locationAddress}</Text>
                            </View>
                          ) : null}
                        </View>
                        <View className="items-end">
                          <Text className={`font-headline font-bold ${isToday ? 'text-primary' : 'text-on-surface-variant'}`}>{time}</Text>
                          <Text className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
                            {isToday ? 'Hoy' : new Date(visit.date).toLocaleDateString('es-MX', { weekday: 'short' })}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <Pressable onPress={() => router.push('/(dashboard)/agenda')} className="w-full mt-6 py-3 border border-primary/20 rounded-full items-center active:bg-primary/5">
                <Text className="font-label font-bold text-xs uppercase tracking-widest text-primary">Ver Calendario Completo</Text>
              </Pressable>
            </View>
          </View>

          {/* Earnings */}
          <View className="flex-1">
            <View className="bg-surface-container-lowest rounded-[2rem] p-6 shadow-sm overflow-hidden">
              <View className="flex-row justify-between items-start mb-6">
                <View className="flex-1 mr-4">
                  <Text className="font-label uppercase tracking-widest text-xs text-on-surface-variant mb-1">Ganancias de hoy</Text>
                  <Text className="font-headline font-bold text-3xl tracking-tight text-on-surface">
                    ${todayEarnings.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>

              {/* Chart */}
              <View className="h-48 flex-row items-end justify-between gap-2 mb-6">
                {chartData.map((bar) => (
                  <View
                    key={bar.key}
                    className={`flex-1 rounded-t-xl ${bar.isToday ? 'bg-primary' : 'bg-primary/10'}`}
                    style={{ height: `${bar.height}%` }}
                  >
                    {bar.isToday && (
                      <View className="absolute -top-6 w-full items-center">
                        <Text className="font-headline font-bold text-primary text-xs">Hoy</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 p-4 rounded-2xl bg-surface-container-low">
                  <Text className="font-label uppercase tracking-tighter text-[10px] text-on-surface-variant mb-1">Prom/servicio</Text>
                  <Text className="font-headline font-bold text-xl text-on-surface">${avgPerService}</Text>
                </View>
                <View className="flex-1 p-4 rounded-2xl bg-surface-container-low">
                  <Text className="font-label uppercase tracking-tighter text-[10px] text-on-surface-variant mb-1">Proy. semanal</Text>
                  <Text className="font-headline font-bold text-xl text-on-surface">
                    ${weekEarnings > 1000 ? `${(weekEarnings / 1000).toFixed(1)}k` : weekEarnings}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
