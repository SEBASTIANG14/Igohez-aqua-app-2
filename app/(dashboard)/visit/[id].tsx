import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, TextInput, Platform, KeyboardAvoidingView, Linking } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';

import TopAppBar from '@/components/ui/TopAppBar';
import { getVisitById, updateVisitStatus, type Visit } from '@/services/visits';
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
  
  // Unit toggle state
  const [selectedUnit, setSelectedUnit] = useState<'kg' | 'g' | 'l' | 'ml'>('kg');

  // Added items tracking
  const [items, setItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Determine default unit based on product
    const prod = PRODUCT_CATALOG[selectedProduct];
    if (prod) {
      if (prod.baseUnit === 'kg') {
        setSelectedUnit('kg');
      } else {
        setSelectedUnit('l');
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

  const handleSendReceipt = (visitData: Visit) => {
    const dateStr = new Date(visitData.date).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const basePrice = visitData.pricePerVisit || 0;
    const serviceSub = (visitData.visitsCount || 1) * basePrice;

    let chemicalsList = '';
    if (visitData.items && Array.isArray(visitData.items) && visitData.items.length > 0) {
      visitData.items.forEach((item: any) => {
        const prod = PRODUCT_CATALOG[item.product];
        const prodLabel = prod ? prod.label : item.product;
        const cost = item.lineTotal !== undefined ? item.lineTotal : 0;
        chemicalsList += `• ${prodLabel}: ${item.quantity} ${item.unit} ($${cost.toFixed(2)})\n`;
      });
    } else {
      chemicalsList = '• Ninguno\n';
    }

    const total = visitData.totalAmount || (serviceSub + (visitData.chemicalsSubtotal || 0));

    const message = `*PoolFlow Maintenance Systems*
----------------------------------------
*Resumen de Visita de Mantenimiento*
📅 *Fecha:* ${dateStr}
----------------------------------------
*DESGLOSE DEL SERVICIO:*
• Servicio Base (${visitData.visitsCount} vis): $${serviceSub.toFixed(2)}

*QUÍMICOS APLICADOS:*
${chemicalsList}----------------------------------------
*Monto Total:* $${total.toFixed(2)}
----------------------------------------
¡Gracias por su confianza!`;

    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to wa.me web link
        Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
      }
    }).catch(() => {
      Alert.alert('Error', 'No se pudo abrir WhatsApp.');
    });
  };

  const handleSave = async () => {
    if (!visit) return;
    setSaving(true);
    try {
      // 1. Guardar químicos actuales en la base de datos
      await apiPut(`/pools/${visit.poolId}/visits/${visit.id}`, {
        items: items
      });

      // 2. Actualizar el estado de la visita a COMPLETED
      const updated = await updateVisitStatus(visit.poolId, visit.id, 'COMPLETED');
      setVisit(updated);

      // 3. Abrir WhatsApp y enviar el recibo de forma automática
      handleSendReceipt(updated);

      Alert.alert('Finalizada', 'Visita guardada y finalizada exitosamente.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleReactivate = async () => {
    if (!visit) return;
    setSaving(true);
    try {
      const updated = await updateVisitStatus(visit.poolId, visit.id, 'ACTIVE');
      setVisit(updated);
      Alert.alert('Reactivada', 'La visita ha sido reactivada. Ahora puedes agregar o modificar químicos.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo reactivar la visita.');
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
  const isCompleted = visit.status === 'COMPLETED';

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

            {isCompleted ? (
              <View className="flex-row items-center gap-2">
                <View className="w-2.5 h-2.5 rounded-full bg-[#00677d]" />
                <Text className="text-[#00677d] font-bold text-sm">Finalizada</Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <View className="w-2.5 h-2.5 rounded-full bg-[#005d90]" />
                <Text className="text-[#005d90] font-bold text-sm">En Progreso</Text>
              </View>
            )}
          </View>

          {/* Registro de Químicos (Form) — Only show if visit is ACTIVE */}
          {!isCompleted && (
            <>
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
                        className="px-2 py-1 rounded-md"
                        style={
                          selectedUnit === 'g' || selectedUnit === 'ml'
                            ? {
                                backgroundColor: 'white',
                                ...Platform.select({
                                  ios: {
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 1,
                                  },
                                  android: {
                                    elevation: 1,
                                  },
                                }),
                              }
                            : null
                        }
                      >
                        <Text
                          className="font-label text-[10px] font-bold"
                          style={{
                            color: selectedUnit === 'g' || selectedUnit === 'ml' ? '#005d90' : '#404850',
                          }}
                        >
                          {isWeight ? 'G' : 'ML'}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setSelectedUnit(isWeight ? 'kg' : 'l')}
                        className="px-2 py-1 rounded-md"
                        style={
                          selectedUnit === 'kg' || selectedUnit === 'l'
                            ? {
                                backgroundColor: 'white',
                                ...Platform.select({
                                  ios: {
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 1,
                                  },
                                  android: {
                                    elevation: 1,
                                  },
                                }),
                              }
                            : null
                        }
                      >
                        <Text
                          className="font-label text-[10px] font-bold"
                          style={{
                            color: selectedUnit === 'kg' || selectedUnit === 'l' ? '#005d90' : '#404850',
                          }}
                        >
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
            </>
          )}

          {/* Registro de Químicos (Read-Only) — Show if visit is COMPLETED */}
          {isCompleted && (
            <>
              <View className="flex-row justify-between items-end mb-4">
                <Text className="font-headline font-bold text-lg text-on-surface">Químicos Aplicados</Text>
                <Text className="font-label uppercase tracking-widest text-[10px] text-[#00677d] font-bold">REGISTRADO</Text>
              </View>

              <View className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm mb-8">
                {items.length === 0 ? (
                  <View className="bg-surface-container-low rounded-xl px-4 py-4 items-center">
                    <Text className="text-on-surface-variant text-xs">No se aplicaron químicos en esta visita.</Text>
                  </View>
                ) : (
                  items.map((item, idx) => {
                    if (!item) return null;
                    const p = PRODUCT_CATALOG[item.product];
                    let baseQty = item.quantity;
                    if (item.unit === 'g' || item.unit === 'ml') baseQty = item.quantity / 1000;
                    const cost = baseQty * (p?.pricePerBase || 0);

                    return (
                      <View key={idx} className="bg-surface-container-low rounded-xl px-4 py-3.5 mb-2 flex-row items-center justify-between">
                        <View>
                          <Text className="font-headline font-bold text-sm text-on-surface">{p?.label || item.product}</Text>
                          <Text className="text-on-surface-variant text-[10px] uppercase font-label">
                            {item.quantity} {item.unit} APLICADO
                          </Text>
                        </View>
                        <Text className="font-headline font-bold text-on-surface">${cost.toFixed(2)}</Text>
                      </View>
                    );
                  })
                )}
              </View>
            </>
          )}

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

          {/* Action Buttons */}
          {saving ? (
            <View className="py-4 items-center bg-[#005d90] rounded-full">
               <ActivityIndicator color="white" />
            </View>
          ) : isCompleted ? (
            /* COMPLETED MODE BUTTONS */
            <View className="flex-col gap-4">
              <Pressable
                onPress={() => handleSendReceipt(visit)}
                className="w-full bg-[#00677d] py-4 rounded-full flex-row items-center justify-center gap-2 active:scale-[0.98] shadow-md"
              >
                <MaterialIcons name="share" size={20} color="white" />
                <Text className="text-white font-headline font-bold text-base">Rehacer y Mandar Recibo</Text>
              </Pressable>

              <Pressable
                onPress={handleReactivate}
                className="w-full bg-[#f2f4f6] py-4 rounded-full flex-row items-center justify-center gap-2 active:scale-[0.98] border border-outline-variant/30"
              >
                <MaterialIcons name="lock-open" size={20} color="#404850" />
                <Text className="text-[#404850] font-headline font-bold text-base">Reactivar Visita</Text>
              </Pressable>
            </View>
          ) : (
            /* ACTIVE MODE BUTTONS */
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
