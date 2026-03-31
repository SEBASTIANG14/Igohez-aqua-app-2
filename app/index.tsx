import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa email y contraseña');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      router.replace('/(dashboard)');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerClassName="flex-grow flex items-center justify-center p-6 relative">
        
        {/* Background Elements */}
        <View className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-fixed opacity-20 pointer-events-none" />
        <View className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-secondary-fixed opacity-15 pointer-events-none" />

        <View className="w-full max-w-md z-10">
          
          {/* Branding */}
          <View className="items-center mb-12">
            <LinearGradient
              colors={['#005d90', '#0077b6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="items-center justify-center w-20 h-20 rounded-full mb-6 shadow-md"
            >
              <MaterialIcons name="pool" size={36} color="white" />
            </LinearGradient>
            <Text className="font-headline font-extrabold text-4xl tracking-tight text-primary">PoolFlow</Text>
            <Text className="font-label uppercase tracking-widest text-xs mt-2 text-on-surface-variant font-medium">Panel de Administración</Text>
          </View>

          {/* Login Card */}
          <View className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm">
            <View className="space-y-6 flex-col gap-6">
              
              {/* Error Message */}
              {error ? (
                <View className="bg-error-container px-4 py-3 rounded-2xl flex-row items-center gap-2">
                  <MaterialIcons name="error-outline" size={18} color="#93000a" />
                  <Text className="text-on-error-container text-sm flex-1">{error}</Text>
                </View>
              ) : null}

              {/* Email */}
              <View className="space-y-2 flex-col gap-2">
                <Text className="font-label text-xs uppercase tracking-widest font-semibold text-on-surface-variant ml-4">
                  Email
                </Text>
                <View className="relative justify-center flex-row items-center bg-surface-container-high rounded-full px-4 py-1">
                  <MaterialIcons name="alternate-email" size={20} color="#707881" className="mr-2" />
                  <TextInput 
                    className="flex-1 py-3 text-on-surface font-body outline-none placeholder:text-outline/50"
                    placeholder="admin@poolflow.com"
                    placeholderTextColor="#70788180"
                    value={email}
                    onChangeText={(t) => { setEmail(t); setError(''); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Password */}
              <View className="space-y-2 flex-col gap-2">
                <View className="flex-row justify-between items-center ml-4 mr-2">
                  <Text className="font-label text-xs uppercase tracking-widest font-semibold text-on-surface-variant">
                    Contraseña
                  </Text>
                </View>
                <View className="relative justify-center flex-row items-center bg-surface-container-high rounded-full px-4 py-1">
                  <MaterialIcons name="lock" size={20} color="#707881" className="mr-2" />
                  <TextInput 
                    className="flex-1 py-3 text-on-surface font-body outline-none placeholder:text-outline/50"
                    placeholder="••••••••"
                    placeholderTextColor="#70788180"
                    value={password}
                    onChangeText={(t) => { setPassword(t); setError(''); }}
                    secureTextEntry
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Submit */}
              <View className="pt-4">
                <Pressable onPress={handleLogin} disabled={loading} className="active:scale-95 transition-transform overflow-hidden rounded-full">
                  <LinearGradient
                    colors={loading ? ['#89b4c8', '#89b4c8'] : ['#005d90', '#0077b6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-full py-4 px-6 flex-row items-center justify-center gap-2"
                  >
                    {loading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Text className="text-white font-headline font-bold">Iniciar Sesión</Text>
                        <MaterialIcons name="arrow-forward" size={20} color="white" />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View className="mt-8 text-center items-center">
            <Text className="text-[10px] font-label uppercase tracking-widest text-outline">
              Acceso Protegido © 2024 PoolFlow Maintenance Systems
            </Text>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
