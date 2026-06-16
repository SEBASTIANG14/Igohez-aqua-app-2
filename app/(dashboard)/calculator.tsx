import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

import TopAppBar from '@/components/ui/TopAppBar';
import PageHeader from '@/components/ui/PageHeader';

// Product catalog matching the backend
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

interface ReportItem {
  product: string;
  quantity: number;
  unit: string;
  lineTotal: number;
}

export default function CalculatorScreen() {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCT_KEYS[0]);
  const [quantity, setQuantity] = useState('');
  const [poolLiters, setPoolLiters] = useState('');
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [reportItems, setReportItems] = useState<ReportItem[]>([]);

  const product = PRODUCT_CATALOG[selectedProduct] || { label: '', baseUnit: 'kg', pricePerBase: 0 };

  const totalEstimado = useMemo(() => {
    return reportItems.reduce((sum, item) => sum + item.lineTotal, 0);
  }, [reportItems]);

  const handleAddToReport = () => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      Alert.alert('Cantidad inválida', 'Por favor ingresa una cantidad válida.');
      return;
    }

    const lineTotal = qty * product.pricePerBase;

    setReportItems((prev) => [
      ...prev,
      {
        product: selectedProduct,
        quantity: qty,
        unit: product.baseUnit,
        lineTotal: Math.round(lineTotal * 100) / 100,
      },
    ]);

    setQuantity('');
  };

  const handleClearReport = () => {
    setReportItems([]);
  };

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />
      <TopAppBar />

      <ScrollView contentContainerClassName="px-6 pt-4 pb-36">
        <PageHeader
          subtitle="MANTENIMIENTO DE PRECISIÓN"
          title="Calculadora de Químicos"
          description="Gestione el balance hídrico con exactitud editorial. Calcule costos y dosificación instantáneamente para un servicio impecable."
        />

        {/* Parámetros del Producto */}
        <View className="bg-surface-container-lowest rounded-2xl p-6 mb-6 shadow-sm">
          <View className="flex-row items-center gap-2 mb-6">
            <MaterialIcons name="science" size={20} color="#005d90" />
            <Text className="font-headline font-bold text-lg text-on-surface">Parámetros del Producto</Text>
          </View>

          {/* Product Dropdown */}
          <View className="mb-5">
            <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold mb-2">
              PRODUCTO
            </Text>
            <Pressable
              onPress={() => setProductDropdownOpen(!productDropdownOpen)}
              className="flex-row items-center justify-between bg-surface-container-high rounded-xl px-4 py-3.5"
            >
              <Text className="text-on-surface font-body text-sm">
                {product.label} ({product.baseUnit})
              </Text>
              <MaterialIcons
                name={productDropdownOpen ? 'expand-less' : 'expand-more'}
                size={24}
                color="#005d90"
              />
            </Pressable>
            {productDropdownOpen && (
              <View className="bg-surface-container-lowest rounded-xl mt-2 border border-outline-variant overflow-hidden">
                {PRODUCT_KEYS.map((key) => {
                  const p = PRODUCT_CATALOG[key];
                  const isSelected = key === selectedProduct;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => {
                        setSelectedProduct(key);
                        setProductDropdownOpen(false);
                      }}
                      className={`px-4 py-3.5 border-b border-surface-container-high ${isSelected ? 'bg-primary-fixed' : ''}`}
                    >
                      <Text className={`font-body text-sm ${isSelected ? 'text-primary font-bold' : 'text-on-surface'}`}>
                        {p.label} ({p.baseUnit})
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Quantity + Pool Liters */}
          <View className="flex-row gap-4 mb-5">
            <View className="flex-1">
              <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold mb-2">
                CANTIDAD
              </Text>
              <View className="flex-row items-center bg-surface-container-high rounded-xl px-4 py-3.5">
                <TextInput
                  className="flex-1 text-on-surface font-body text-sm"
                  placeholder="0.0"
                  placeholderTextColor="#707881"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                />
                <Text className="text-on-surface-variant font-label text-xs uppercase ml-2">
                  {product.baseUnit}
                </Text>
              </View>
            </View>
            <View className="flex-1">
              <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold mb-2">
                LITROS ALBERCA
              </Text>
              <View className="flex-row items-center bg-surface-container-high rounded-xl px-4 py-3.5">
                <TextInput
                  className="flex-1 text-on-surface font-body text-sm"
                  placeholder="Opcional"
                  placeholderTextColor="#707881"
                  value={poolLiters}
                  onChangeText={setPoolLiters}
                  keyboardType="decimal-pad"
                />
                <Text className="text-on-surface-variant font-label text-xs uppercase ml-2">L</Text>
              </View>
            </View>
          </View>

          {/* Precio Unitario */}
          <View className="flex-row items-center gap-4 bg-surface-container rounded-xl px-5 py-4">
            <View className="w-10 h-10 rounded-full bg-primary-fixed items-center justify-center">
              <MaterialIcons name="sell" size={18} color="#005d90" />
            </View>
            <View>
              <Text className="text-on-surface-variant text-xs font-label uppercase tracking-widest">Precio Unitario</Text>
              <Text className="font-headline font-extrabold text-xl text-on-surface">
                ${product.pricePerBase.toFixed(2)} <Text className="text-on-surface-variant font-body text-sm font-normal">/ {product.baseUnit}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Agregar al Reporte Button */}
        <Pressable
          onPress={handleAddToReport}
          className="rounded-2xl shadow-lg active:scale-[0.97] overflow-hidden mb-4"
        >
          <LinearGradient
            colors={['#005d90', '#0077b6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full py-5 flex-row items-center justify-center gap-3"
          >
            <MaterialIcons name="playlist-add-check" size={22} color="white" />
            <Text className="text-white font-headline font-bold text-lg">Agregar al Reporte</Text>
          </LinearGradient>
        </Pressable>

        {/* Reset */}
        {reportItems.length > 0 && (
          <Pressable onPress={handleClearReport} className="items-center py-2 mb-4">
            <MaterialIcons name="refresh" size={24} color="#707881" />
          </Pressable>
        )}

        {/* Report Items */}
        {reportItems.length > 0 && (
          <View className="bg-surface-container-lowest rounded-2xl p-4 mb-6 shadow-sm">
            <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold mb-3 px-1">
              ITEMS EN REPORTE
            </Text>
            {reportItems.map((item, idx) => (
              <View key={idx} className="flex-row items-center justify-between px-3 py-3 border-b border-surface-container-high">
                <View className="flex-1">
                  <Text className="text-on-surface text-sm font-medium">
                    {PRODUCT_CATALOG[item.product]?.label}
                  </Text>
                  <Text className="text-on-surface-variant text-xs">
                    {item.quantity} {item.unit}
                  </Text>
                </View>
                <Text className="font-headline font-bold text-on-surface">${item.lineTotal.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Monto Total Estimado */}
        <View className="mb-6 overflow-hidden rounded-2xl">
          <LinearGradient
            colors={['#e8f4fa', '#dbeef7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-8 items-center"
          >
            <Text className="font-label uppercase tracking-widest text-xs text-primary font-bold mb-3">
              MONTO TOTAL ESTIMADO
            </Text>
            <Text className="font-headline font-extrabold text-5xl text-on-surface tracking-tight">
              ${totalEstimado.toFixed(2)}
            </Text>
            <Text className="text-on-surface-variant text-xs mt-3 text-center leading-relaxed">
              Cálculo basado en catálogo de productos actualizado.
            </Text>
          </LinearGradient>
        </View>

        {/* Tarifario de Referencia */}
        <View className="bg-surface-container-lowest rounded-2xl p-6 mb-6 shadow-sm">
          <Text className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold mb-4">
            TARIFARIO DE REFERENCIA
          </Text>
          {PRODUCT_KEYS.map((key) => {
            const p = PRODUCT_CATALOG[key];
            return (
              <View key={key} className="flex-row items-center justify-between py-3 border-b border-surface-container-high last:border-b-0">
                <Text className="text-on-surface text-sm font-medium">{p.label}</Text>
                <Text className="font-headline font-bold text-on-surface">${p.pricePerBase}/{p.baseUnit}</Text>
              </View>
            );
          })}
        </View>

        {/* Tip Card */}
        <View className="bg-[#e8f4f0] rounded-2xl p-6 flex-row gap-4">
          <View className="w-12 h-12 rounded-full bg-white items-center justify-center">
            <MaterialIcons name="tips-and-updates" size={24} color="#005d90" />
          </View>
          <View className="flex-1">
            <Text className="font-headline font-bold text-sm text-on-surface mb-1">Tip de Mezcla</Text>
            <Text className="text-on-surface-variant text-xs leading-relaxed">
              Siempre diluya los químicos en un balde con agua de la piscina antes de verter para evitar manchas.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
