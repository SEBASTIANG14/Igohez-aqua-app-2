import React from 'react';
import { View, Text, ScrollView, Image, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function ClientsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />
      
      {/* TopAppBar */}
      <View 
        className="flex-row justify-between items-center w-full px-6 py-4 bg-[#f7f9fb] z-50 transition-colors"
        style={{ paddingTop: Math.max(insets.top, 16) }}
      >
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-primary-fixed items-center justify-center overflow-hidden">
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnJiyQnJPAuQ6blDl-g5TUiu4PR7nRBKwzadMEXDN3c5BtL_ZHnyFnhr2_bODJ1hZ9DVgVKv6xA3kVk0-jSRMo7N4W16YEzkdD6SCMY34fQoKR-UC5IczlR8YMzsUDlOHSgjleO8RW-dB-HWl2DWK0H7QSTj00JIHzH9f4RzOfIPyWeIQUxIdJyktZ2yWc3k8g4G247GCcD0bs3lwarcdcvp4cEjs393dvSWPwU89cFVVxe7x3WRpNKC5WZhd9RE8nZKDIyNNkVvBY' }}
              className="w-full h-full"
            />
          </View>
          <Text className="font-headline font-extrabold text-[#0077B6] text-2xl tracking-tight">PoolFlow</Text>
        </View>
        <Pressable className="w-10 h-10 items-center justify-center rounded-full hover:bg-[#f2f4f6] active:scale-95 transition-colors">
          <MaterialIcons name="notifications" size={24} color="#0077b6" />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerClassName="px-6 pt-8 pb-32">
          
          {/* Search & Editorial Header */}
          <View className="space-y-8 flex-col gap-8 mb-12">
            <View className="max-w-2xl">
              <Text className="font-label uppercase tracking-widest text-xs text-on-surface-variant mb-2">Directorio</Text>
              <Text className="font-headline font-extrabold text-4xl tracking-tight text-on-surface">Gestión de Clientes</Text>
            </View>

            {/* Search Bar */}
            <View className="relative justify-center flex-row items-center bg-surface-container-high rounded-full px-5 py-2 shadow-sm">
              <MaterialIcons name="search" size={24} color="#707881" className="mr-3" />
              <TextInput 
                className="flex-1 py-3 text-on-surface font-body outline-none placeholder:text-outline"
                placeholder="Buscar por nombre o dirección..."
                placeholderTextColor="#707881"
              />
            </View>
          </View>

          {/* Bento Grid Layout */}
          <View className="flex-col lg:flex-row gap-8">
            
            {/* Client Cards List */}
            <View className="w-full lg:flex-1 space-y-4 flex-col gap-4">
              <Text className="font-label font-bold uppercase tracking-widest text-xs text-on-surface-variant px-2">Clientes Recientes</Text>
              
              {/* Client Card 1 (Active) */}
              <Pressable className="bg-surface-container-lowest p-5 rounded-xl flex-row items-center gap-4 relative overflow-hidden active:bg-surface-container-low shadow-sm">
                <View className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                <View className="w-14 h-14 rounded-full bg-secondary-fixed items-center justify-center overflow-hidden shrink-0">
                  <Image 
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAccb9EF0XN_pBlNI_eCSwL2_tt7PisyyoTcJt92HEevkMPet9FjEwvUgiVd9M4wi4x_wfPaHJyeESkQjQY8dCDbCDQDZRq9ZHynFBhVlD0hDQKGgmp_YfAAHNpr4tjOr3T1drX-LSRPavQA9oB4ZstfJsHyI3YfyuOw7w9LWJ-c4foNE9mJiW6iPD3ZS1VTeczculAbGzl4nv1n3xzRTpS5A7Ac80Ilp3rmiK6w_v-p5kjACeUN91OW1EVE3arsm_GNetFfRdHjXp1' }}
                    className="w-full h-full"
                  />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="font-headline font-bold text-lg text-on-surface truncate" numberOfLines={1}>Lucía Méndez</Text>
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons name="calendar-today" size={14} color="#404850" />
                    <Text className="text-sm text-on-surface-variant">Último: 12 Oct, 2023</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#005d90" />
              </Pressable>

              {/* Client Card 2 */}
              <Pressable className="bg-surface-container-lowest p-5 rounded-xl flex-row items-center gap-4 overflow-hidden active:bg-surface-container-low shadow-sm">
                <View className="w-14 h-14 rounded-full bg-tertiary-fixed items-center justify-center shrink-0">
                  <Text className="text-on-tertiary-fixed font-headline font-bold text-xl">RC</Text>
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="font-headline font-bold text-lg text-on-surface truncate" numberOfLines={1}>Ricardo Castillo</Text>
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons name="calendar-today" size={14} color="#404850" />
                    <Text className="text-sm text-on-surface-variant">Último: 10 Oct, 2023</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#707881" />
              </Pressable>

              {/* Client Card 3 */}
              <Pressable className="bg-surface-container-lowest p-5 rounded-xl flex-row items-center gap-4 overflow-hidden active:bg-surface-container-low shadow-sm">
                <View className="w-14 h-14 rounded-full bg-primary-fixed items-center justify-center overflow-hidden shrink-0">
                  <Image 
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcOw5Zsi0pSCbBVJXADXBbTwM1R1J_VseTlgmBU2oJzhnx3pwnJ5N1XSufH_IG7jU4vczJUNh2clNc5Ze4rjxzKY4qh5cGol7DpolDEhk3Rf-JhhhejE-R-jRNJKowcmiZ_ZGUnCZNKtEGsr3J46La_AzQeMLeZ51J-5HWyAsxhlW7GD3Jz2DzDMQ7IgshFCJF2LwOsqrnA8JVv5VwBvKAqc6X2bnkmc3xdmPxD5I77EBUQ-V80FZkj4TCCDbMLhAO_8kFmciQx_vc' }}
                    className="w-full h-full"
                  />
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="font-headline font-bold text-lg text-on-surface truncate" numberOfLines={1}>Javier Solís</Text>
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons name="calendar-today" size={14} color="#404850" />
                    <Text className="text-sm text-on-surface-variant">Último: 08 Oct, 2023</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#707881" />
              </Pressable>
            </View>

            {/* Client Details Panel */}
            <View className="w-full lg:flex-[1.4] space-y-6 mt-8 lg:mt-0">
              <View className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
                <View className="absolute -top-12 -right-12 w-48 h-48 bg-primary-fixed rounded-full opacity-20 pointer-events-none" />
                
                <View className="flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                  <View className="space-y-1">
                    <Text className="text-3xl font-headline font-extrabold text-on-surface">Lucía Méndez</Text>
                    <View className="flex-row items-center gap-2 mt-2">
                       <MaterialIcons name="location-on" size={18} color="#005d90" />
                       <Text className="text-primary font-medium">Calle de las Garzas 402, Juriquilla</Text>
                    </View>
                  </View>
                  <View className="flex-row gap-2 mt-4 md:mt-0">
                    <Pressable className="bg-primary active:bg-primary-container px-6 py-3 rounded-full flex items-center justify-center">
                      <Text className="text-white font-bold text-sm">Editar</Text>
                    </Pressable>
                    <Pressable className="bg-surface-container-high active:bg-surface-container-highest px-4 py-3 rounded-full flex items-center justify-center">
                      <MaterialIcons name="more-vert" size={20} color="#191c1e" />
                    </Pressable>
                  </View>
                </View>

                <View className="mt-10 flex-col md:flex-row gap-8">
                  {/* Data Card 1: Tipo de Alberca */}
                  <View className="flex-1 space-y-3 flex-col gap-3">
                    <Text className="font-label uppercase tracking-widest text-xs text-on-surface-variant">Especificaciones</Text>
                    <View className="bg-surface-container-low p-5 rounded-2xl space-y-2">
                      <View className="flex-row items-center gap-3 mb-2">
                        <MaterialIcons name="pool" size={20} color="#00677d" />
                        <Text className="font-bold text-on-surface">Tipo de Alberca</Text>
                      </View>
                      <Text className="text-on-surface-variant ml-8">Infantil & Infinity Pool{'\n'}25,000 Litros • Agua Salada</Text>
                    </View>
                  </View>

                  {/* Data Card 2: Niveles Ideales */}
                  <View className="flex-1 space-y-3 flex-col gap-3 mt-6 md:mt-0">
                    <Text className="font-label uppercase tracking-widest text-xs text-on-surface-variant">Químicos Ideales</Text>
                    <View className="bg-surface-container-low p-5 rounded-2xl space-y-4 flex-col gap-4">
                      {/* Liquid Progress Bars */}
                      <View className="space-y-1 gap-1">
                        <View className="flex-row justify-between">
                          <Text className="text-xs font-bold">pH</Text>
                          <Text className="text-xs font-bold text-primary">7.4 - 7.6</Text>
                        </View>
                        <View className="h-3 w-full bg-primary-fixed rounded-full overflow-hidden">
                          <LinearGradient colors={['#005d90', '#00677d']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} className="h-full rounded-full w-[75%]" />
                        </View>
                      </View>
                      
                      <View className="space-y-1 gap-1">
                        <View className="flex-row justify-between">
                          <Text className="text-xs font-bold">Cloro (ppm)</Text>
                          <Text className="text-xs font-bold text-primary">1.5 - 3.0</Text>
                        </View>
                        <View className="h-3 w-full bg-primary-fixed rounded-full overflow-hidden">
                          <LinearGradient colors={['#005d90', '#00677d']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} className="h-full rounded-full w-[45%]" />
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Último Servicio Resumen */}
                <View className="mt-8">
                  <View className="p-6 bg-secondary-fixed/30 rounded-3xl flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4">
                      <View className="p-3 bg-white rounded-2xl shadow-sm">
                        <MaterialIcons name="history" size={24} color="#00677d" />
                      </View>
                      <View>
                        <Text className="text-[10px] font-bold uppercase text-on-secondary-fixed-variant">Próximo Servicio</Text>
                        <Text className="text-lg font-bold text-on-surface mt-1">18 de Octubre, 2023</Text>
                      </View>
                    </View>
                    <MaterialIcons name="event-available" size={32} color="#00677d" />
                  </View>
                </View>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FAB (Floating Action Button) */}
      <Pressable className="fixed absolute bottom-28 right-6 w-16 h-16 rounded-full flex items-center justify-center active:scale-90 transition-transform z-50 shadow-md overflow-hidden">
         <LinearGradient colors={['#005d90', '#0077b6']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} className="w-full h-full items-center justify-center">
            <MaterialIcons name="add" size={32} color="white" />
         </LinearGradient>
      </Pressable>
    </View>
  );
}
