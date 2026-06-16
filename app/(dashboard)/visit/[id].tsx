import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';

import TopAppBar from '@/components/ui/TopAppBar';
import { getVisitById, type Visit } from '@/services/visits';
import { apiPut } from '@/services/api';

// Shared Product Catalog
const PRODUCT_CATALOG: Record<string, { label: string; baseUnit: string; pricePerBase: number }> = {
  cloro_polvo: { label: 'Cloro Polvo', baseUnit: 'kg', pricePerBase: 120 },
  cloro_granulado: { label: 'Cloro Granulado', baseUnit: 'kg', pricePerBase: 120 },
  cloro_pastilla: { label: 'Cloro Pastilla', baseUnit: 'kg', pricePerBase: 140 },
  ph_mas: { label: 'pH +', baseUnit: 'kg', pricePerBase: 120 },
  ph_menos: { label: 'pH -', baseUnit: 'kg', pricePerBase: 120 },
  alguicida: { label: 'Alguicida', baseUnit: 'l', pricePerBase: 130 },
  floculante: { label: 'Floculante', baseUnit: 'l', pricePerBase: 120 },
};
const PRODUCT_KEYS = Object.keys(PRODUCT_CATALOG);

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  'PARTICULAR': { bg: 'bg-primary-fixed', color: '#005d90' },
  'COMERCIAL': { bg: 'bg-secondary-fixed', color: '#00677d' },
  'HOTEL': { bg: 'bg-tertiary-fixed', color: '#284c53' },
  'RESIDENCIAL': { bg: 'bg-[#cde5ff]', color: '#005d90' },
  'CLUB_DEPORTIVO': { bg: 'bg-[#e8d5ff]', color: '#5b3a8c' },
};

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Chemicals Form State
  const [selectedProduct, setSelectedProduct] = useState(PRODUCT_KEYS[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quantity, setQuantity] = useState('');
  
  // Note: Backend handles unit conversions. We will just send 'g' or 'kg', 'ml' or 'l'
  const [selectedUnit, setSelectedUnit] = useState<'kg' | 'g' | 'l' | 'ml'>('kg');

  // Added items tracking
  const [items, setItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Determine default unit based on product
    const prod = PRODUCT_CATALOG[selectedProduct];
    if (prod) {
      if (prod.baseUnit === 'kg') {
        setSelectedUnit('kg'); // Or user can toggle to 'g'
      } else {
        setSelectedUnit('l'); // Or user can toggle to 'ml'
      }
    }
  }, [selectedProduct]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getVisitById(Number(id));
        setVisit(data);
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
        }
      } catch (err) {
        Alert.alert('Error', 'No se pudo cargar la visita.');
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddItem = () => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      Alert.alert('Cantidad inválida', 'Ingresa una cantidad válida.');
      return;
    }

    const newItem = {
      product: selectedProduct,
      quantity: qty,
      unit: selectedUnit,
    };

    setItems([...items, newItem]);
    setQuantity('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!visit) return;
    setSaving(true);
    try {
      // API call to update visit
      await apiPut(`/pools/${visit.poolId}/visits/${visit.id}`, {
        items: items
      });
      Alert.alert('Guardado', 'Visita actualizada exitosamente.', [{
        text: 'OK',
        onPress: () => router.back()
      }]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !visit) {
    return (
      <View className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator size="large" color="#005d90" />
      </View>
    );
  }

  const poolType = visit.pool?.poolType || 'PARTICULAR';
  const typeStyle = TYPE_COLORS[poolType] || TYPE_COLORS['PARTICULAR'];
  const basePrice = visit.pricePerVisit || 0;

  // Optimistic calculation for display
  const itemsSubtotal = items.reduce((sum, item) => {
    if (!item) return sum;
    const prod = PRODUCT_CATALOG[item.product];
    if (!prod) return sum;
    let baseQty = item.quantity;
    if (item.unit === 'g' || item.unit === 'ml') baseQty = item.quantity / 1000;
    return sum + (baseQty * prod.pricePerBase);
  }, 0);

  const totalAmount = basePrice + itemsSubtotal;

  const currentProd = PRODUCT_CATALOG[selectedProduct] || { label: '', baseUnit: 'kg', pricePerBase: 0 };
  const isWeight = currentProd.baseUnit === 'kg';

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />
      <TopAppBar showBack title="Detalle de Visita" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerClassName="px-6 pt-4 pb-36">
          
          {/* Main Info Card */}
          <View className="bg-surface-container-lowest border-l-4 border-l-primary rounded-2xl p-6 shadow-sm mb-8">
            <View className="flex-row justify-between items-start mb-3">
              <Text className="font-label uppercase tracking-widest text-xs text-on-surface-variant font-bold">
                Propiedad
              </Text>
              <View className={`px-3 py-1 rounded-full ${typeStyle.bg}`}>
                <Text style={{ color: typeStyle.color }} className="font-label uppercase font-bold text-[10px] tracking-widest">
                  {poolType.replace('_', ' ')}
                </Text>
              </View>
            </View>
            
            <Text className="font-headline font-bold text-2xl text-on-surface mb-2 tracking-tight">
              {visit.pool?.name || 'Alberca'}
            </Text>
            
            {visit.pool?.locationAddress && (
              <View className="flex-row items-center gap-1.5 mb-5">
                <MaterialIcons name="location-on" size={14} color="#404850" />
                <Text className="text-on-surface-variant text-sm flex-1">{visit.pool.locationAddress}</Text>
              </View>
            )}

            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-[#005d90]" />
              <Text className="text-[#005d90] font-bold text-sm">En Progreso</Text>
            </View>
          </View>

          {/* Registro de Químicos */}
          <View className="flex-row justify-between items-end mb-4">
            <Text className="font-headline font-bold text-lg text-on-surface">Registro de Químicos</Text>
            <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant">CATÁLOGO</Text>
          </View>

          <View className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm mb-8">
            
            <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold mb-2 ml-1">
              PRODUCTO
            </Text>
            <Pressable
              onPress={() => setDropdownOpen(!dropdownOpen)}
              className="flex-row items-center justify-between bg-surface-container-low rounded-xl px-4 py-3 mb-4"
            >
              <Text className="text-on-surface font-body text-sm">
                {currentProd.label}
              </Text>
              <MaterialIcons name={dropdownOpen ? 'expand-less' : 'expand-more'} size={20} color="#707881" />
            </Pressable>
            {dropdownOpen && (
              <View className="bg-surface-container-low rounded-xl mb-4 border border-outline-variant overflow-hidden">
                {PRODUCT_KEYS.map((key) => {
                  const p = PRODUCT_CATALOG[key];
                  const isSelected = key === selectedProduct;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => {
                        setSelectedProduct(key);
                        setDropdownOpen(false);
                      }}
                      className={`px-4 py-3 border-b border-surface-container-high ${isSelected ? 'bg-primary-fixed' : ''}`}
                    >
                      <Text className={`font-body text-sm ${isSelected ? 'text-primary font-bold' : 'text-on-surface'}`}>
                        {p.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold mb-2 ml-1">
              CANTIDAD
            </Text>
            <View className="flex-row gap-3 items-center mb-6">
              <View className="flex-1 flex-row items-center bg-surface-container-low rounded-xl px-4 py-1 h-[48px]">
                <TextInput
                  className="flex-1 text-on-surface font-body text-sm h-full"
                  placeholder="0.0"
                  placeholderTextColor="#707881"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                />
                
                {/* Unit Toggle */}
                <View className="flex-row bg-surface-container rounded-lg p-0.5 ml-2">
                  <Pressable
                    onPress={() => setSelectedUnit(isWeight ? 'g' : 'ml')}
                    className={`px-2 py-1 rounded-md ${selectedUnit === 'g' || selectedUnit === 'ml' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`font-label text-[10px] font-bold ${selectedUnit === 'g' || selectedUnit === 'ml' ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {isWeight ? 'G' : 'ML'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setSelectedUnit(isWeight ? 'kg' : 'l')}
                    className={`px-2 py-1 rounded-md ${selectedUnit === 'kg' || selectedUnit === 'l' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`font-label text-[10px] font-bold ${selectedUnit === 'kg' || selectedUnit === 'l' ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {isWeight ? 'KG' : 'L'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={handleAddItem}
                className="w-12 h-12 bg-[#005d90] rounded-xl items-center justify-center active:scale-95 shadow-sm"
              >
                <MaterialIcons name="add" size={24} color="white" />
              </Pressable>
            </View>

            <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold mb-2 ml-1">
              APLICADOS HOY
            </Text>
            {items.length === 0 ? (
              <View className="bg-surface-container-low rounded-xl px-4 py-4 mb-2 items-center">
                <Text className="text-on-surface-variant text-xs">Aún no hay químicos agregados.</Text>
              </View>
            ) : (
              items.map((item, idx) => {
                if (!item) return null;
                const p = PRODUCT_CATALOG[item.product];
                let baseQty = item.quantity;
                if (item.unit === 'g' || item.unit === 'ml') baseQty = item.quantity / 1000;
                const cost = baseQty * (p?.pricePerBase || 0);

                return (
                  <View key={idx} className="bg-surface-container-low rounded-xl px-4 py-3 mb-2 flex-row items-center justify-between">
                    <View>
                      <Text className="font-headline font-bold text-sm text-on-surface">{p?.label || item.product}</Text>
                      <Text className="text-on-surface-variant text-[10px] uppercase font-label">
                        {item.quantity} {item.unit} APLICADO
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                      <Text className="font-headline font-bold text-[#005d90]">${cost.toFixed(2)}</Text>
                      <Pressable onPress={() => handleRemoveItem(idx)} className="p-1 active:opacity-50">
                        <MaterialIcons name="delete" size={18} color="#d32f2f" />
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Resumen de Costos */}
          <View className="bg-surface-container-low rounded-3xl p-6 mb-8">
            <Text className="font-label uppercase tracking-widest text-[#404850] text-xs mb-5 font-bold">
              RESUMEN DE COSTOS
            </Text>
            
            <View className="flex-row justify-between mb-3">
              <Text className="text-on-surface-variant text-sm">Precio Base Visita</Text>
              <Text className="text-on-surface font-headline font-bold">${basePrice.toFixed(2)}</Text>
            </View>
            
            <View className="flex-row justify-between mb-6">
              <Text className="text-on-surface-variant text-sm">Total Químicos</Text>
              <Text className="text-on-surface font-headline font-bold">${itemsSubtotal.toFixed(2)}</Text>
            </View>

            <View className="h-2 w-full bg-[#005d90] rounded-full mb-6" />

            <View className="flex-row justify-between items-center">
              <Text className="text-on-surface font-headline font-bold text-base">Monto Total</Text>
              <Text className="font-headline font-extrabold text-[32px] text-[#005d90] tracking-tight">
                ${totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Finalize Button */}
          {saving ? (
            <View className="py-4 items-center bg-[#005d90] rounded-full">
               <ActivityIndicator color="white" />
            </View>
          ) : (
            <Pressable
              onPress={handleSave}
              className="w-full bg-[#005d90] py-4 rounded-full flex-row items-center justify-center gap-2 active:scale-[0.98] shadow-md border border-[#005d90]"
            >
              <MaterialIcons name="save" size={20} color="white" />
              <Text className="text-white font-headline font-bold text-base">Finalizar y Guardar Visita</Text>
            </Pressable>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
