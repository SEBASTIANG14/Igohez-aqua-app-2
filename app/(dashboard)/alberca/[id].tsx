import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, Switch, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import TopAppBar from '@/components/ui/TopAppBar';
import PageHeader from '@/components/ui/PageHeader';
import SectionCard from '@/components/ui/SectionCard';
import FormField from '@/components/ui/FormField';
import DropdownPicker from '@/components/ui/DropdownPicker';
import GradientButton from '@/components/ui/GradientButton';
import { getPoolById, updatePool, deletePool, type Pool } from '@/services/pools';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const TIPOS_ALBERCA = ['Particular', 'Comercial', 'Residencial', 'Club Deportivo', 'Hotel'];
const TIPOS_PAGO = ['POR SEMANA', 'POR MES', 'POR VISITA'];

const POOL_TYPE_MAP: Record<string, string> = {
  'Particular': 'PARTICULAR',
  'Comercial': 'COMERCIAL',
  'Residencial': 'RESIDENCIAL',
  'Club Deportivo': 'CLUB_DEPORTIVO',
  'Hotel': 'HOTEL',
};

const REVERSE_POOL_TYPE_MAP: Record<string, string> = {
  'PARTICULAR': 'Particular',
  'COMERCIAL': 'Comercial',
  'RESIDENCIAL': 'Residencial',
  'CLUB_DEPORTIVO': 'Club Deportivo',
  'HOTEL': 'Hotel',
};

const PAYMENT_TYPE_MAP: Record<string, string> = {
  'POR SEMANA': 'POR_SEMANA',
  'POR MES': 'POR_MES',
  'POR VISITA': 'POR_VISITA',
};

const REVERSE_PAYMENT_TYPE_MAP: Record<string, string> = {
  'POR_SEMANA': 'POR SEMANA',
  'POR_MES': 'POR MES',
  'POR_VISITA': 'POR VISITA',
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  'PARTICULAR': { bg: 'bg-primary-fixed', color: '#005d90' },
  'COMERCIAL': { bg: 'bg-secondary-fixed', color: '#00677d' },
  'HOTEL': { bg: 'bg-tertiary-fixed', color: '#284c53' },
  'RESIDENCIAL': { bg: 'bg-[#e8d5ff]', color: '#5b3a8c' },
  'CLUB_DEPORTIVO': { bg: 'bg-[#cde5ff]', color: '#004e5f' },
};

export default function PoolDetailScreen() {
  const { id } = useLocalSearchParams();
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
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

  const loadPoolData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPoolById(Number(id));
      setPool(data);
      
      // Populate form state
      setNombreAlberca(data.name || '');
      setDireccion(data.locationAddress || '');
      setTipoAlberca(REVERSE_POOL_TYPE_MAP[data.poolType] || 'Particular');
      setNotasAdicionales(data.notes || '');
      setProgramarMantenimiento(!!data.maintenanceDay);
      setDiaVisita(data.maintenanceDay || 'Lunes');
      setHoraEstimada(data.maintenanceTime || '');
      setDefinirCostos(!!data.paymentType);
      setTipoPago(REVERSE_PAYMENT_TYPE_MAP[data.paymentType || ''] || 'POR SEMANA');
      setCostoPeriodo(data.costPerWeek ? String(data.costPerWeek) : '');
      setCostoVisita(data.costPerVisit ? String(data.costPerVisit) : '');
      setCobraQuimicos(!!data.hasChemicalsCost);
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo cargar la alberca.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPoolData();
  }, [loadPoolData]);

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
      const updated = await updatePool(Number(id), {
        name: nombreAlberca.trim(),
        locationAddress: direccion.trim(),
        poolType: POOL_TYPE_MAP[tipoAlberca] || 'PARTICULAR',
        notes: notasAdicionales.trim() || null,
        paymentType: definirCostos ? (PAYMENT_TYPE_MAP[tipoPago] || null) : null,
        costPerWeek: definirCostos && costoPeriodo ? Number(costoPeriodo) : null,
        costPerVisit: definirCostos && costoVisita ? Number(costoVisita) : null,
        hasChemicalsCost: cobraQuimicos,
        maintenanceDay: programarMantenimiento ? diaVisita : null,
        maintenanceTime: programarMantenimiento && horaEstimada.trim() ? horaEstimada.trim() : null,
      });

      setPool(updated);
      setIsEditing(false);
      Alert.alert('¡Alberca actualizada!', 'Los cambios han sido guardados exitosamente.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = () => {
    Alert.alert(
      '¿Eliminar Alberca?',
      'Esta acción es permanente y eliminará la alberca así como todo su historial de visitas asociadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              await deletePool(Number(id));
              Alert.alert('Eliminada', 'La alberca ha sido eliminada con éxito.', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'No se pudo eliminar la alberca.');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const getCostoPeriodoLabel = () => {
    switch (tipoPago) {
      case 'POR SEMANA': return 'COSTO/SEMANA';
      case 'POR MES': return 'COSTO/MES';
      case 'POR VISITA': return 'COSTO/VISITA';
      default: return 'COSTO';
    }
  };

  if (loading || !pool) {
    return (
      <View className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator size="large" color="#005d90" />
        <Text className="text-on-surface-variant mt-3 font-body text-sm">Cargando detalles...</Text>
      </View>
    );
  }

  const typeStyle = TYPE_COLORS[pool.poolType] || TYPE_COLORS['PARTICULAR'];

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />
      <TopAppBar showBack title={isEditing ? 'Editar Alberca' : 'Detalle de Alberca'} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerClassName="px-6 pt-4 pb-36">
          {!isEditing ? (
            /* VIEW MODE */
            <>
              {/* Main Summary Card */}
              <View className="bg-surface-container-lowest border-l-4 border-l-primary rounded-2xl p-6 shadow-sm mb-6 relative overflow-hidden">
                <View className="flex-row justify-between items-start mb-3">
                  <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold">
                    ID: #{pool.id}
                  </Text>
                  <View className={`px-3 py-1 rounded-full ${typeStyle.bg}`}>
                    <Text style={{ color: typeStyle.color }} className="font-label uppercase font-bold text-[10px] tracking-widest">
                      {tipoAlberca}
                    </Text>
                  </View>
                </View>
                
                <Text className="font-headline font-bold text-2xl text-on-surface mb-2 tracking-tight">
                  {pool.name}
                </Text>
                
                {pool.locationAddress ? (
                  <View className="flex-row items-center gap-1.5 mt-2">
                    <MaterialIcons name="location-on" size={16} color="#005d90" />
                    <Text className="text-on-surface-variant font-body text-sm flex-1">{pool.locationAddress}</Text>
                  </View>
                ) : null}
              </View>

              {/* Mantenimiento Schedule Card */}
              <SectionCard icon="schedule" title="Mantenimiento">
                <View className="flex-row items-center justify-between py-1">
                  <View className="flex-1">
                    <Text className="font-label text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Día de Visita</Text>
                    <Text className="font-headline text-base font-bold text-on-surface mt-1">
                      {pool.maintenanceDay || 'Sin día fijo programado'}
                    </Text>
                  </View>
                  {pool.maintenanceTime ? (
                    <View className="items-end">
                      <Text className="font-label text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Hora de Visita</Text>
                      <Text className="font-headline text-base font-bold text-primary mt-1">{pool.maintenanceTime}</Text>
                    </View>
                  ) : null}
                </View>
              </SectionCard>

              {/* Payments & Pricing Card */}
              <SectionCard icon="account-balance-wallet" title="Información de Facturación" variant="tinted">
                <View className="flex-row justify-between items-center py-2 border-b border-surface-variant/20">
                  <Text className="text-on-surface-variant text-sm font-medium">Esquema de Pago</Text>
                  <Text className="text-on-surface font-headline font-bold text-sm">
                    {pool.paymentType ? REVERSE_PAYMENT_TYPE_MAP[pool.paymentType] : 'Tarifa Variable'}
                  </Text>
                </View>

                {pool.costPerWeek ? (
                  <View className="flex-row justify-between items-center py-2 border-b border-surface-variant/20">
                    <Text className="text-on-surface-variant text-sm font-medium">Costo por Semana</Text>
                    <Text className="text-primary font-headline font-bold text-sm">${pool.costPerWeek}</Text>
                  </View>
                ) : null}

                {pool.costPerVisit ? (
                  <View className="flex-row justify-between items-center py-2 border-b border-surface-variant/20">
                    <Text className="text-on-surface-variant text-sm font-medium">Costo por Visita</Text>
                    <Text className="text-primary font-headline font-bold text-sm">${pool.costPerVisit}</Text>
                  </View>
                ) : null}

                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-on-surface-variant text-sm font-medium">Cobra Químicos Aparte</Text>
                  <Text className={`font-headline font-bold text-sm ${pool.hasChemicalsCost ? 'text-[#00677d]' : 'text-on-surface-variant'}`}>
                    {pool.hasChemicalsCost ? 'Sí' : 'No'}
                  </Text>
                </View>
              </SectionCard>

              {/* Notes Card */}
              {pool.notes ? (
                <SectionCard icon="notes" title="Notas Adicionales">
                  <Text className="text-on-surface font-body text-sm leading-relaxed italic">
                    &ldquo;{pool.notes}&rdquo;
                  </Text>
                </SectionCard>
              ) : null}

              {/* Actions */}
              <View className="mt-8 flex-col gap-4">
                <GradientButton
                  label="Editar Alberca"
                  icon="edit"
                  onPress={() => setIsEditing(true)}
                />
                
                <Pressable
                  onPress={handleEliminar}
                  disabled={saving}
                  className="w-full bg-[#fce8e6] py-4 rounded-full flex-row items-center justify-center gap-2 active:scale-[0.98] border border-[#f5b3b1]"
                >
                  <MaterialIcons name="delete" size={20} color="#ba1a1a" />
                  <Text className="text-[#ba1a1a] font-headline font-bold text-base">Eliminar Alberca</Text>
                </Pressable>
              </View>
            </>
          ) : (
            /* EDIT MODE */
            <>
              <PageHeader
                subtitle="EDITAR DETALLES"
                title={pool.name}
                description="Modifica los campos técnicos o comerciales y presiona guardar."
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

              {/* Save / Cancel actions */}
              <View className="mt-8 flex-col gap-4">
                {saving ? (
                  <View className="py-4 items-center bg-primary rounded-full">
                    <ActivityIndicator color="white" />
                  </View>
                ) : (
                  <GradientButton label="Guardar Cambios" icon="save" onPress={handleGuardar} />
                )}

                <Pressable
                  onPress={() => setIsEditing(false)}
                  disabled={saving}
                  className="w-full bg-[#f2f4f6] py-4 rounded-full flex-row items-center justify-center gap-2 active:scale-[0.98] border border-outline-variant/30"
                >
                  <MaterialIcons name="close" size={20} color="#404850" />
                  <Text className="text-[#404850] font-headline font-bold text-base">Cancelar</Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
