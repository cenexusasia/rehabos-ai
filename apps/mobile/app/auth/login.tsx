import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        {/* Title */}
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#ffffff', marginBottom: 32 }}>
          Welcome back
        </Text>

        {/* Email */}
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#6b7280"
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            backgroundColor: '#1a1a1a',
            borderWidth: 1,
            borderColor: '#2a2a2a',
            borderRadius: 10,
            paddingVertical: 14,
            paddingHorizontal: 16,
            color: '#ffffff',
            fontSize: 16,
            marginBottom: 16,
          }}
        />

        {/* Password */}
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#6b7280"
          secureTextEntry
          style={{
            backgroundColor: '#1a1a1a',
            borderWidth: 1,
            borderColor: '#2a2a2a',
            borderRadius: 10,
            paddingVertical: 14,
            paddingHorizontal: 16,
            color: '#ffffff',
            fontSize: 16,
            marginBottom: 24,
          }}
        />

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: '#4f7cff',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 16,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 14, color: '#4f7cff' }}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={{ fontSize: 14, color: '#4f7cff', fontWeight: '600' }}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
