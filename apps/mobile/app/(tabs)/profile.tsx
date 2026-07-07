import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { User, ChevronRight, Bell, Moon, Globe, LogOut, Users } from 'lucide-react-native';

const settingsItems = [
  { label: 'Notifications', icon: Bell, color: '#4f7cff' },
  { label: 'Dark Theme', icon: Moon, color: '#8b5cf6' },
  { label: 'Language', icon: Globe, color: '#22c55e' },
];

const careTeam = [
  { name: 'Dr. Sarah Chen', role: 'Physical Therapist' },
  { name: 'Dr. Mike Rodriguez', role: 'Orthopedic Surgeon' },
];

export default function ProfileScreen() {
  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        {/* Avatar / Name */}
        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 32 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#4f7cff',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <User size={36} color="#ffffff" />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#ffffff' }}>John Doe</Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>john.doe@example.com</Text>
        </View>

        {/* Personal Info */}
        <TouchableOpacity
          style={{
            backgroundColor: '#1a1a1a',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: '#2a2a2a',
            marginBottom: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>Personal Information</Text>
            <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Name, contact, emergency details</Text>
          </View>
          <ChevronRight size={20} color="#6b7280" />
        </TouchableOpacity>

        {/* Care Team */}
        <View
          style={{
            backgroundColor: '#1a1a1a',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: '#2a2a2a',
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Users size={18} color="#4f7cff" />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>Care Team</Text>
          </View>
          {careTeam.map((member, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: i < careTeam.length - 1 ? 1 : 0,
                borderBottomColor: '#2a2a2a',
              }}
            >
              <View>
                <Text style={{ fontSize: 15, fontWeight: '500', color: '#ffffff' }}>{member.name}</Text>
                <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Settings */}
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff', marginBottom: 10, marginTop: 4 }}>
          Settings
        </Text>
        <View
          style={{
            backgroundColor: '#1a1a1a',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#2a2a2a',
            marginBottom: 24,
            overflow: 'hidden',
          }}
        >
          {settingsItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderBottomWidth: i < settingsItems.length - 1 ? 1 : 0,
                borderBottomColor: '#2a2a2a',
              }}
            >
              <item.icon size={20} color={item.color} />
              <Text style={{ flex: 1, fontSize: 15, color: '#ffffff' }}>{item.label}</Text>
              <ChevronRight size={18} color="#6b7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#ef444410',
            paddingVertical: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#ef444430',
          }}
        >
          <LogOut size={18} color="#ef4444" />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#ef4444' }}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
