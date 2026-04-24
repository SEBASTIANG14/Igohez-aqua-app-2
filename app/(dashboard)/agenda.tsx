import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl, useWindowDimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { CalendarProvider, WeekCalendar } from 'react-native-calendars';

import TopAppBar from '@/components/ui/TopAppBar';
import { getAllVisits, type Visit } from '@/services/visits';

const CALENDAR_THEME = {
  backgroundColor: 'transparent',
  calendarBackground: 'transparent',
  textSectionTitleColor: '#707881',
  selectedDayBackgroundColor: '#005d90',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#005d90',
  todayBackgroundColor: '#cde5ff',
  dayTextColor: '#1a1c1e',
  textDisabledColor: '#bfc7d1',
  dotColor: '#005d90',
  selectedDotColor: '#ffffff',
  arrowColor: '#005d90',
  monthTextColor: '#1a1c1e',
  indicatorColor: '#005d90',
  textDayFontFamily: 'Inter',
  textMonthFontFamily: 'Manrope',
  textDayHeaderFontFamily: 'Inter',
  textDayFontSize: 15,
  textMonthFontSize: 16,
  textDayHeaderFontSize: 12,
};

function groupVisitsByDate(visits: Visit[]): Record<string, Visit[]> {
  const groups: Record<string, Visit[]> = {};
  for (const visit of visits) {
    const dateKey = visit.date.split('T')[0]; // YYYY-MM-DD
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(visit);
  }
  return groups;
}

function getMarkedDates(visitDates: string[], selectedDate: string) {
  const marked: Record<string, any> = {};
  for (const date of visitDates) {
    marked[date] = { marked: true, dotColor: '#005d90' };
  }
  marked[selectedDate] = { ...marked[selectedDate], selected: true, selectedColor: '#005d90' };
  return marked;
}

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  'PARTICULAR': { bg: 'bg-primary-fixed', color: '#005d90' },
  'COMERCIAL': { bg: 'bg-secondary-fixed', color: '#00677d' },
  'HOTEL': { bg: 'bg-tertiary-fixed', color: '#284c53' },
  'RESIDENCIAL': { bg: 'bg-[#e8d5ff]', color: '#5b3a8c' },
  'CLUB_DEPORTIVO': { bg: 'bg-[#cde5ff]', color: '#004e5f' },
};

export default function AgendaScreen() {
  const { width } = useWindowDimensions();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVisits = useCallback(async () => {
    try {
      const data = await getAllVisits();
      setVisits(data);
    } catch (err) {
      console.error('Error fetching visits:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchVisits();
    }, [fetchVisits])
  );

  const grouped = useMemo(() => groupVisitsByDate(visits), [visits]);
  const visitDates = useMemo(() => Object.keys(grouped), [grouped]);
  const markedDates = useMemo(() => getMarkedDates(visitDates, selectedDate), [visitDates, selectedDate]);
  const todayVisits = grouped[selectedDate] || [];

  const formattedDate = useMemo(() => {
    const d = new Date(selectedDate + 'T12:00:00');
    return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  }, [selectedDate]);

  const totalEarnings = useMemo(() => {
    return visits.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
  }, [visits]);

  const weekVisits = useMemo(() => {
    // Count visits in the current week
    const sel = new Date(selectedDate + 'T12:00:00');
    const weekStart = new Date(sel);
    weekStart.setDate(sel.getDate() - sel.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return visits.filter((v) => {
      const vd = new Date(v.date.split('T')[0] + 'T12:00:00');
      return vd >= weekStart && vd <= weekEnd;
    });
  }, [visits, selectedDate]);

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />
      <TopAppBar />

      <ScrollView
        contentContainerClassName="px-6 pt-4 pb-36"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVisits(); }} tintColor="#005d90" />}
      >
        {/* Title */}
        <View className="flex-row justify-between items-end mb-4">
          <View>
            <Text className="font-label uppercase tracking-widest text-xs text-on-surface-variant font-medium">Planificación</Text>
            <Text className="font-headline font-extrabold text-3xl text-on-surface tracking-tight mt-1">Tu Agenda</Text>
          </View>
          <View className="bg-primary-fixed px-3 py-1.5 rounded-full">
            <Text className="font-label text-xs font-bold text-primary uppercase tracking-widest">
              {todayVisits.length} {todayVisits.length === 1 ? 'cita' : 'citas'}
            </Text>
          </View>
        </View>

        {/* Week Calendar */}
        <View className="mb-8 bg-surface-container-lowest rounded-2xl p-3 shadow-sm overflow-hidden">
          <CalendarProvider date={selectedDate}>
            <WeekCalendar
              firstDay={1}
              onDayPress={(day: any) => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              theme={CALENDAR_THEME}
              allowShadow={false}
              calendarWidth={width - 72}
            />
          </CalendarProvider>
        </View>

        {/* Date header */}
        <View className="flex-row items-center gap-2 mb-6">
          <MaterialIcons name="event" size={20} color="#005d90" />
          <Text className="font-headline font-bold text-lg text-on-surface capitalize">
            {selectedDate === today ? 'Hoy' : formattedDate}
          </Text>
        </View>

        {/* Content */}
        {loading ? (
          <View className="py-16 items-center">
            <ActivityIndicator size="large" color="#005d90" />
            <Text className="text-on-surface-variant mt-3">Cargando agenda...</Text>
          </View>
        ) : (
          <View className="flex-col lg:flex-row gap-8 items-start">
            <View className="flex-1 flex-col gap-5 w-full">
              {todayVisits.length === 0 ? (
                <View className="bg-surface-container-lowest rounded-3xl p-10 items-center justify-center shadow-sm">
                  <MaterialIcons name="event-available" size={48} color="#bfc7d1" />
                  <Text className="font-headline font-bold text-lg text-on-surface-variant mt-4">Sin citas programadas</Text>
                  <Text className="text-on-surface-variant text-sm mt-1 text-center">No tienes servicios para este día</Text>
                  <Pressable
                    onPress={() => router.push('/(dashboard)/new-service')}
                    className="mt-6 bg-primary px-6 py-3 rounded-full active:scale-95"
                  >
                    <Text className="text-white font-bold text-sm">Programar Visita</Text>
                  </Pressable>
                </View>
              ) : (
                todayVisits.map((visit) => {
                  const poolName = visit.pool?.name || 'Alberca';
                  const poolType = visit.pool?.poolType || 'PARTICULAR';
                  const poolAddress = visit.pool?.locationAddress || '';
                  const typeStyle = TYPE_COLORS[poolType] || TYPE_COLORS['PARTICULAR'];
                  const time = new Date(visit.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });

                  return (
                    <Pressable
                      key={visit.id}
                      onPress={() => router.push(`/(dashboard)/visit/${visit.id}` as any)}
                      className="relative overflow-hidden bg-surface-container-lowest rounded-3xl p-6 active:scale-[0.98] border-l-4 border-l-primary flex-col gap-4 shadow-sm"
                    >
                      <View className="flex-row items-center gap-5">
                        <View className="flex-col items-center justify-center bg-surface-container-low rounded-2xl p-4 min-w-[80px]">
                          <Text className="font-headline font-extrabold text-primary text-lg">{time.split(' ')[0]}</Text>
                          <Text className="font-label text-[10px] text-on-surface-variant font-bold uppercase">{time.split(' ')[1]}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="font-headline font-bold text-lg text-on-surface">{poolName}</Text>
                          {poolAddress ? (
                            <View className="flex-row items-center gap-1 mt-0.5">
                              <MaterialIcons name="location-on" size={12} color="#707881" />
                              <Text className="text-on-surface-variant text-xs" numberOfLines={1}>{poolAddress}</Text>
                            </View>
                          ) : null}
                          <View className="flex-row gap-2 mt-3 flex-wrap">
                            <View className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full ${typeStyle.bg}`}>
                              <MaterialIcons name="pool" size={14} color={typeStyle.color} />
                              <Text style={{ color: typeStyle.color }} className="text-[10px] font-bold font-label uppercase">
                                {poolType.replace('_', ' ')}
                              </Text>
                            </View>
                            <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed">
                              <MaterialIcons name="attach-money" size={14} color="#284c53" />
                              <Text className="text-on-tertiary-fixed-variant text-[10px] font-bold font-label uppercase">
                                ${visit.totalAmount}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      {visit.notes ? (
                        <View className="bg-surface-container-low px-4 py-2 rounded-xl">
                          <Text className="text-on-surface-variant text-xs italic">{visit.notes}</Text>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })
              )}
            </View>

            {/* Side Widget */}
            <View className="w-full lg:w-80 flex-col gap-6">
              <View className="bg-primary rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                <Text className="font-headline font-bold text-2xl text-white relative z-10">Resumen Semanal</Text>
                <Text className="text-white/80 mt-2 text-sm relative z-10">
                  {weekVisits.length} visitas programadas esta semana
                </Text>
                <View className="mt-8 relative z-10">
                  <View className="flex-row justify-between items-end mb-2">
                    <Text className="font-label text-[10px] text-white uppercase tracking-widest font-bold">Visitas</Text>
                    <Text className="font-headline text-white font-extrabold text-xl">{weekVisits.length}</Text>
                  </View>
                  <View className="h-3 w-full bg-primary-container rounded-full overflow-hidden">
                    <View className="h-full bg-secondary-container rounded-full" style={{ width: `${Math.min((weekVisits.length / 20) * 100, 100)}%` }} />
                  </View>
                </View>
                <View className="mt-8 flex-row gap-4 relative z-10">
                  <View className="flex-1 bg-white/10 rounded-2xl p-4">
                    <Text className="font-label text-white text-[10px] uppercase opacity-70">Ingresos Sem.</Text>
                    <Text className="font-headline text-white font-bold text-lg">
                      ${weekVisits.reduce((s, v) => s + v.totalAmount, 0).toLocaleString()}
                    </Text>
                  </View>
                  <View className="flex-1 bg-white/10 rounded-2xl p-4">
                    <Text className="font-label text-white text-[10px] uppercase opacity-70">Total Hist.</Text>
                    <Text className="font-headline text-white font-bold text-lg">
                      ${totalEarnings > 1000 ? `${(totalEarnings / 1000).toFixed(1)}k` : totalEarnings}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/(dashboard)/new-service')}
        className="absolute bottom-28 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center active:scale-95 z-40"
        style={{ shadowColor: '#005d90', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 32, elevation: 10 }}
      >
        <MaterialIcons name="add" size={32} color="white" />
      </Pressable>
    </View>
  );
}
