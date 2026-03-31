import React from 'react';
import { View, Text, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function ServiceReportScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />
      
      {/* TopAppBar */}
      <View 
        className="flex-row justify-between items-center w-full px-6 py-4 bg-[#f7f9fb] z-50 border-b border-transparent"
        style={{ paddingTop: Math.max(insets.top, 16) }}
      >
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-primary-fixed items-center justify-center overflow-hidden">
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCznjLgIHWcFBU2IGKqBdYCMftmtVInWXqUgW23pxqRFBI-ifLYvOovki9BKEt9eHy0Us2MGzCi-UEg8skvVmviR3ynun77tilqufODdxGQ6yHaNeJRoZTXkTZ42Om7nkkiyzOK-e5a41Jlue62Mve8St2dNKV8WtO3uusG3fDlwrFRWNf-Ks3SYJ_Ep3lEtqkBHEOmVQk-gfQso62uMompTXj0t2XrCiVhIIaoYyQCQIZDk0UU2NNVuDGw-j_B4soI-0sYwAOnAviW' }}
              className="w-full h-full"
            />
          </View>
          <Text className="font-headline font-extrabold text-[#0077B6] text-2xl tracking-tight">PoolFlow</Text>
        </View>
        <Pressable className="text-[#0077b6] active:scale-95 transition-transform p-2 rounded-full hover:bg-surface-container-low">
          <MaterialIcons name="notifications" size={24} color="#0077b6" />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerClassName="px-6 py-8 pb-32">
          
          {/* Hero Context */}
          <View className="mb-10">
            <Text className="font-headline font-bold text-3xl text-on-surface tracking-tight mb-2">Reporte de Servicio</Text>
            <Text className="text-on-surface-variant font-body">Registro rápido de mantenimiento para la Residencia Arboledas #42.</Text>
          </View>

          {/* Form Section */}
          <View className="space-y-8 flex-col gap-8">
            {/* Measurement Grid */}
            <View className="flex-col md:flex-row flex-wrap gap-4">
              {/* PH Level Card */}
              <View className="flex-1 bg-surface-container-lowest p-6 rounded-xl border-l-4 border-l-primary shadow-sm min-w-[300px]">
                <Text className="font-label uppercase tracking-widest text-xs font-bold text-on-surface-variant mb-4">Nivel de pH</Text>
                <View className="relative justify-center px-6 py-4 bg-surface-container-high rounded-full">
                  <Text className="text-on-surface font-medium">7.4 (Ideal)</Text>
                  <MaterialIcons name="expand-more" size={24} color="#005d90" style={{ position: 'absolute', right: 16 }} />
                </View>
              </View>

              {/* Chlorine Level Card */}
              <View className="flex-1 bg-surface-container-lowest p-6 rounded-xl border-l-4 border-l-secondary shadow-sm min-w-[300px]">
                <Text className="font-label uppercase tracking-widest text-xs font-bold text-on-surface-variant mb-4">Nivel de Cloro</Text>
                <View className="relative justify-center px-6 py-4 bg-surface-container-high rounded-full">
                  <Text className="text-on-surface font-medium">1.0 ppm</Text>
                  <MaterialIcons name="expand-more" size={24} color="#00677d" style={{ position: 'absolute', right: 16 }} />
                </View>
              </View>
            </View>

            {/* Chemicals Text Area */}
            <View className="bg-surface-container-low p-8 rounded-2xl">
              <View className="flex-row items-center gap-2 mb-4">
                <MaterialIcons name="science" size={16} color="#404850" />
                <Text className="font-label uppercase tracking-widest text-xs font-bold text-on-surface-variant">Químicos añadidos</Text>
              </View>
              <TextInput 
                className="w-full bg-surface-container-lowest rounded-xl p-4 text-on-surface placeholder:text-outline-variant min-h-[100px]"
                placeholder="Ej. 500g de Clarificador, 1 tableta de Cloro..."
                placeholderTextColor="#bfc7d1"
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Photo Upload */}
            <View className="relative w-full aspect-video bg-surface-container border-2 border-dashed border-outline-variant rounded-2xl items-center justify-center p-6 mt-4">
               <View className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mb-4">
                  <MaterialIcons name="add-a-photo" size={28} color="#005d90" />
               </View>
               <Text className="font-headline font-bold text-on-surface">Subir foto del resultado</Text>
               <Text className="text-xs text-on-surface-variant mt-1">JPG, PNG hasta 10MB</Text>
            </View>

            {/* Image Teaser */}
            <View className="flex-col md:flex-row gap-4 items-center">
              <View className="flex-1 bg-tertiary-fixed rounded-2xl p-6 flex-row items-center gap-4 w-full">
                <MaterialIcons name="verified" size={40} color="#3b5e65" />
                <View className="flex-1">
                  <Text className="font-bold text-on-tertiary-fixed text-lg">Confirmación de Calidad</Text>
                  <Text className="text-sm text-on-tertiary-fixed-variant flex-wrap mt-1">Asegúrate de que el área de la bomba esté limpia antes de finalizar.</Text>
                </View>
              </View>
            </View>

            {/* Final Action */}
            <View className="pt-8 mb-4">
              <Pressable className="rounded-full shadow-lg active:scale-95 transition-transform overflow-hidden">
                <LinearGradient
                   colors={['#005d90', '#0077b6']}
                   start={{x:0, y:0}}
                   end={{x:1, y:1}}
                   className="w-full py-5 flex-row items-center justify-center gap-3"
                >
                  <Text className="text-white font-headline font-bold text-xl">Finalizar Servicio</Text>
                  <MaterialIcons name="send" size={24} color="white" />
                </LinearGradient>
              </Pressable>
              <Text className="text-center text-on-surface-variant text-xs mt-4">Al finalizar, se enviará automáticamente el reporte al cliente.</Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
