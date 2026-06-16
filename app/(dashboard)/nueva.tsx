import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, Switch, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import TopAppBar from '@/components/ui/TopAppBar';
import PageHeader from '@/components/ui/PageHeader';
import SectionCard from '@/components/ui/SectionCard';
import FormField from '@/components/ui/FormField';
import DropdownPicker from '@/components/ui/DropdownPicker';
import PhotoUpload from '@/components/ui/PhotoUpload';
import GradientButton from '@/components/ui/GradientButton';
import { createPool } from '@/services/pools';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIPOS_ALBERCA = ['Particular', 'Comercial', 'Residencial', 'Club Deportivo', 'Hotel'];
const TIPOS_PAGO = ['POR SEMANA', 'POR MES', 'POR VISITA'];

// Map frontend values to backend enum-like strings
const POOL_TYPE_MAP: Record<string, string> = {
  'Particular': 'PARTICULAR',
  'Comercial': 'COMERCIAL',
  'Residencial': 'RESIDENCIAL',
  'Club Deportivo': 'CLUB_DEPORTIVO',
  'Hotel': 'HOTEL',
};

const PAYMENT_TYPE_MAP: Record<string, string> = {
  'POR SEMANA': 'POR_SEMANA',
  'POR MES': 'POR_MES',
  'POR VISITA': 'POR_VISITA',
};

export default function NuevaAlbercaScreen() {
  const [nombreAlberca, setNombreAlberca] = useState('');
  const [direccion, setDireccion] = useState('');
  const [tipoAlberca, setTipoAlberca] = useState('Particular');
  const [notasAdicionales, setNotasAdicionales] = useState('');
  const [programarMantenimiento, setProgramarMantenimiento] = useState(false);
  const [diaVisita, setDiaVisita] = useState('Lunes');
  const [horaEstimada, setHoraEstimada] = useState('');
  const [definirCostos, setDefinirCostos] = useState(false);
  const [tipoPago, setTipoPago] = useState('POR SEMANA');
  const [costoPeriodo, setCostoPeriodo] = useState('');
  const [costoVisita, setCostoVisita] = useState('');
  const [cobraQuimicos, setCobraQuimicos] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGuardar = async () => {
    if (!nombreAlberca.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa el nombre de la alberca.');
      return;
    }
    if (!direccion.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa la dirección completa.');
      return;
    }

    setSaving(true);
    try {
      await createPool({
        name: nombreAlberca.trim(),
        locationAddress: direccion.trim(),
        poolType: POOL_TYPE_MAP[tipoAlberca] || 'PARTICULAR',
        notes: notasAdicionales.trim() || undefined,
        paymentType: definirCostos ? (PAYMENT_TYPE_MAP[tipoPago] || undefined) : undefined,
        costPerWeek: definirCostos && costoPeriodo ? Number(costoPeriodo) : undefined,
        costPerVisit: definirCostos && costoVisita ? Number(costoVisita) : undefined,
        hasChemicalsCost: cobraQuimicos,
        maintenanceDay: programarMantenimiento ? diaVisita : undefined,
        maintenanceTime: programarMantenimiento && horaEstimada.trim() ? horaEstimada.trim() : undefined,
      });

      Alert.alert(
        '¡Alberca registrada!',
        `La alberca "${nombreAlberca}" ha sido guardada exitosamente.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo guardar la alberca.');
    } finally {
      setSaving(false);
    }
  };

  const getCostoPeriodoLabel = () => {
    switch (tipoPago) {
      case 'POR SEMANA': return 'COSTO/SEMANA';
      case 'POR MES': return 'COSTO/MES';
      case 'POR VISITA': return 'COSTO/VISITA';
      default: return 'COSTO';
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />
      <TopAppBar showBack />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerClassName="px-6 pt-4 pb-36">
          <PageHeader
            subtitle="GESTIÓN DE ACTIVOS"
            title="Registrar Nueva Alberca"
            description="Configura los detalles técnicos y de facturación para integrar una nueva piscina a tu flujo de mantenimiento."
          />

          <SectionCard icon="assignment" title="Información General">
            <FormField label="NOMBRE DE LA ALBERCA" icon="edit" placeholder="Ej. Residencia Arboledas" value={nombreAlberca} onChangeText={setNombreAlberca} />
            <FormField label="DIRECCIÓN COMPLETA" icon="location-on" placeholder="Calle, Número, Colonia, Ciudad" value={direccion} onChangeText={setDireccion} />
            <DropdownPicker label="TIPO DE ALBERCA" options={TIPOS_ALBERCA} value={tipoAlberca} onChange={setTipoAlberca} />
            <View>
              <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold mb-2">NOTAS ADICIONALES</Text>
              <View className="bg-surface-container-high rounded-xl px-4 py-3.5">
                <TextInput className="text-on-surface font-body text-sm min-h-[44px]" placeholder="Código de acceso, perros, etc" placeholderTextColor="#707881" value={notasAdicionales} onChangeText={setNotasAdicionales} multiline />
              </View>
            </View>
          </SectionCard>

          <SectionCard icon="schedule" title="Programación de Mantenimiento">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1 mr-4">
                <Text className="font-headline font-bold text-sm text-on-surface">¿Programar visitas recurrentes?</Text>
                <Text className="text-on-surface-variant text-xs mt-0.5">Asignar día y hora de visita fija</Text>
              </View>
              <Switch value={programarMantenimiento} onValueChange={setProgramarMantenimiento} trackColor={{ false: '#bfc7d1', true: '#005d90' }} thumbColor={programarMantenimiento ? '#ffffff' : '#f4f3f4'} />
            </View>
            {programarMantenimiento && (
              <View className="mt-4 pt-4 border-t border-surface-variant/20">
                <DropdownPicker label="DÍA DE VISITA" options={DIAS_SEMANA} value={diaVisita} onChange={setDiaVisita} />
                <FormField label="HORA ESTIMADA" icon="access-time" placeholder="--:-- --" value={horaEstimada} onChangeText={setHoraEstimada} />
              </View>
            )}
          </SectionCard>

          <PhotoUpload label="Subir fotografía de la alberca" />

          <SectionCard icon="account-balance-wallet" title="Esquema de Pagos" variant="tinted">
            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-1 mr-4">
                <Text className="font-headline font-bold text-sm text-on-surface">¿Definir costos fijos?</Text>
                <Text className="text-on-surface-variant text-xs mt-0.5">Desactivar si el costo varía por consumo de químicos</Text>
              </View>
              <Switch value={definirCostos} onValueChange={setDefinirCostos} trackColor={{ false: '#bfc7d1', true: '#005d90' }} thumbColor={definirCostos ? '#ffffff' : '#f4f3f4'} />
            </View>

            {definirCostos && (
              <View className="mt-4 pt-4 border-t border-[#c6ece0] mb-5">
                <View className="mb-5">
                  <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold mb-2">TIPO DE PAGO</Text>
                  <View className="flex-row bg-surface-container-high rounded-xl overflow-hidden">
                    {TIPOS_PAGO.map((tipo) => (
                      <Pressable key={tipo} onPress={() => setTipoPago(tipo)} className={`flex-1 py-3 items-center justify-center ${tipoPago === tipo ? 'bg-primary' : ''}`}>
                        <Text className={`font-label font-bold text-[10px] uppercase tracking-wider ${tipoPago === tipo ? 'text-white' : 'text-on-surface-variant'}`}>{tipo}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold mb-2">{getCostoPeriodoLabel()}</Text>
                    <View className="flex-row items-center bg-surface-container-lowest rounded-xl px-4 py-3.5">
                      <Text className="text-primary font-headline font-bold text-lg mr-2">$</Text>
                      <TextInput className="flex-1 text-on-surface font-body text-sm" placeholder="450" placeholderTextColor="#707881" value={costoPeriodo} onChangeText={setCostoPeriodo} keyboardType="numeric" />
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold mb-2">COSTO VISITA</Text>
                    <View className="flex-row items-center bg-surface-container-lowest rounded-xl px-4 py-3.5">
                      <Text className="text-primary font-headline font-bold text-lg mr-2">$</Text>
                      <TextInput className="flex-1 text-on-surface font-body text-sm" placeholder="150" placeholderTextColor="#707881" value={costoVisita} onChangeText={setCostoVisita} keyboardType="numeric" />
                    </View>
                  </View>
                </View>
              </View>
            )}

            <View className="flex-row items-center justify-between bg-surface-container-lowest rounded-xl px-4 py-3">
              <View className="flex-1 mr-4">
                <Text className="font-headline font-bold text-sm text-on-surface">¿Cobra Químicos?</Text>
                <Text className="text-on-surface-variant text-xs mt-0.5">Facturar insumos aparte</Text>
              </View>
              <Switch value={cobraQuimicos} onValueChange={setCobraQuimicos} trackColor={{ false: '#bfc7d1', true: '#005d90' }} thumbColor={cobraQuimicos ? '#ffffff' : '#f4f3f4'} />
            </View>
          </SectionCard>

          {saving ? (
            <View className="py-6 items-center">
              <ActivityIndicator size="large" color="#005d90" />
              <Text className="text-on-surface-variant mt-2 text-sm">Guardando alberca...</Text>
            </View>
          ) : (
            <GradientButton label="Guardar Alberca" icon="save" onPress={handleGuardar} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
