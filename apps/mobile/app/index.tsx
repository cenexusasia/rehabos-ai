import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Activity } from 'lucide-react-native';

export default function LandingScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
        {/* Logo / Brand */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Activity size={64} color="#4f7cff" />
          <Text style={{ fontSize: 36, fontWeight: '700', color: '#ffffff', marginTop: 16 }}>
            RehabOS
          </Text>
          <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center', marginTop: 8 }}>
            Your personal rehabilitation companion
          </Text>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={() => router.push('/auth/login')}
          style={{
            width: '100%',
            backgroundColor: '#4f7cff',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>Sign In</Text>
        </TouchableOpacity>

        {/* Get Started Button */}
        <TouchableOpacity
          onPress={() => router.push('/auth/signup')}
          style={{
            width: '100%',
            backgroundColor: '#1a1a1a',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#2a2a2a',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
