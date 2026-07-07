import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      Alert.alert('Success', 'Check your email for the confirmation link!');
      router.replace('/auth/login');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        {/* Title */}
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#ffffff', marginBottom: 32 }}>
          Create account
        </Text>

        {/* Full Name */}
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="John Doe"
          placeholderTextColor="#6b7280"
          autoCapitalize="words"
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
            marginBottom: 16,
          }}
        />

        {/* Confirm Password */}
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Confirm Password</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
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

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={handleSignup}
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: '#4f7cff',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 24,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Sign In Link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={{ fontSize: 14, color: '#4f7cff', fontWeight: '600' }}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
