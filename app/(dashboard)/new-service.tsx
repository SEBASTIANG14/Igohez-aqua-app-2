import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, Switch, Alert, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import TopAppBar from '@/components/ui/TopAppBar';
import PageHeader from '@/components/ui/PageHeader';
import SectionCard from '@/components/ui/SectionCard';
import FormField from '@/components/ui/FormField';
import DropdownPicker from '@/components/ui/DropdownPicker';
import PhotoUpload from '@/components/ui/PhotoUpload';
import GradientButton from '@/components/ui/GradientButton';
import { getPools, type Pool } from '@/services/pools';
import { createVisit } from '@/services/visits';

export default function NuevaVisitaScreen() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loadingPools, setLoadingPools] = useState(true);
  const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null);
  const [selectedPoolName, setSelectedPoolName] = useState('Seleccionar alberca...');

  const [fecha, setFecha] = useState('');
  const [visitsCount, setVisitsCount] = useState('1');
  const [pricePerVisit, setPricePerVisit] = useState('');
  const [notasServicio, setNotasServicio] = useState('');
  const [saving, setSaving] = useState(false);

  // Load pools for the dropdown
  useEffect(() => {
    (async () => {
      try {
        const data = await getPools();
        setPools(data);

        // Auto-fill price from pool's costPerVisit if available
        if (data.length > 0) {
          setSelectedPoolId(data[0].id);
          setSelectedPoolName(data[0].name);
          if (data[0].costPerVisit) {
            setPricePerVisit(String(data[0].costPerVisit));
          }
        }
      } catch (err) {
        console.warn('Error loading pools:', err);
      } finally {
        setLoadingPools(false);
      }
    })();
  }, []);

  const poolNames = pools.map((p) => p.name);

  const handlePoolSelect = (name: string) => {
    setSelectedPoolName(name);
    const pool = pools.find((p) => p.name === name);
    if (pool) {
      setSelectedPoolId(pool.id);
      if (pool.costPerVisit) {
        setPricePerVisit(String(pool.costPerVisit));
      }
    }
  };

  const handleGuardar = async () => {
    if (!selectedPoolId) {
      Alert.alert('Campo requerido', 'Por favor selecciona una alberca.');
      return;
    }
    if (!fecha.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa la fecha de la visita (YYYY-MM-DD).');
      return;
    }

    setSaving(true);
    try {
      await createVisit(selectedPoolId, {
        date: fecha.trim(),
        visitsCount: parseInt(visitsCount, 10) || 1,
        pricePerVisit: parseFloat(pricePerVisit) || 0,
        notes: notasServicio.trim() || undefined,
        items: [], // No chemicals for now
      });

      Alert.alert(
        '¡Visita programada!',
        `La visita ha sido creada exitosamente.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo crear la visita.');
    } finally {
      setSaving(false);
    }
  };

  // Default to today's date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFecha(today);
  }, []);

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />
      <TopAppBar showBack />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerClassName="px-6 pt-4 pb-36">
          <PageHeader
            subtitle="GESTIÓN DE SERVICIOS"
            title="Registrar Nueva Visita"
            description="Programa una nueva visita de mantenimiento y configura los detalles del servicio."
          />

          {/* Alberca Selection */}
          <SectionCard icon="pool" title="Alberca">
            {loadingPools ? (
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#005d90" />
                <Text className="text-on-surface-variant mt-2 text-sm">Cargando albercas...</Text>
              </View>
            ) : pools.length === 0 ? (
              <View className="py-4 items-center">
                <Text className="text-on-surface-variant text-sm mb-3">No hay albercas registradas</Text>
                <Pressable onPress={() => router.push('/(dashboard)/nueva')} className="bg-primary px-5 py-2 rounded-full">
                  <Text className="text-white font-bold text-sm">Crear Alberca</Text>
                </Pressable>
              </View>
            ) : (
              <DropdownPicker
                label="SELECCIONAR ALBERCA"
                options={poolNames}
                value={selectedPoolName}
                onChange={handlePoolSelect}
              />
            )}

            {selectedPoolId && !loadingPools && (() => {
              const pool = pools.find((p) => p.id === selectedPoolId);
              if (!pool) return null;
              return (
                <View className="bg-primary-fixed/30 rounded-xl p-4 mt-2 flex-row items-center gap-3">
                  <MaterialIcons name="location-on" size={16} color="#005d90" />
                  <Text className="text-on-surface text-sm flex-1">{pool.locationAddress || 'Sin dirección'}</Text>
                </View>
              );
            })()}
          </SectionCard>

          {/* Detalles del Servicio */}
          <SectionCard icon="build" title="Detalles del Servicio">
            <FormField label="FECHA DE VISITA" icon="event" placeholder="YYYY-MM-DD" value={fecha} onChangeText={setFecha} />
            <View className="flex-row gap-4">
              <View className="flex-1">
                <FormField label="NÚMERO DE VISITAS" icon="repeat" placeholder="1" value={visitsCount} onChangeText={setVisitsCount} keyboardType="numeric" />
              </View>
              <View className="flex-1">
                <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold mb-2">PRECIO/VISITA</Text>
                <View className="flex-row items-center bg-surface-container-high rounded-xl px-4 py-3.5">
                  <Text className="text-primary font-headline font-bold text-lg mr-2">$</Text>
                  <TextInput
                    className="flex-1 text-on-surface font-body text-sm"
                    placeholder="150"
                    placeholderTextColor="#707881"
                    value={pricePerVisit}
                    onChangeText={setPricePerVisit}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </SectionCard>

          {/* Notas */}
          <SectionCard icon="notes" title="Notas del Servicio">
            <View className="bg-surface-container-high rounded-xl px-4 py-3.5">
              <TextInput
                className="text-on-surface font-body text-sm min-h-[100px]"
                placeholder="Observaciones, indicaciones especiales, estado del equipo..."
                placeholderTextColor="#707881"
                value={notasServicio}
                onChangeText={setNotasServicio}
                multiline
                textAlignVertical="top"
              />
            </View>
          </SectionCard>

          <PhotoUpload label="Subir foto del servicio" subtitle="JPG, PNG hasta 10MB" icon="add-a-photo" />

          {/* Save */}
          {saving ? (
            <View className="py-6 items-center">
              <ActivityIndicator size="large" color="#005d90" />
              <Text className="text-on-surface-variant mt-2 text-sm">Guardando visita...</Text>
            </View>
          ) : (
            <GradientButton label="Guardar Visita" icon="check-circle" onPress={handleGuardar} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
