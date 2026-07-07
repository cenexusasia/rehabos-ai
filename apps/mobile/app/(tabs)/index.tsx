import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Calendar, Dumbbell, Flame, CheckCircle } from 'lucide-react-native';

const stats = [
  { label: 'Completion Rate', value: '78%', icon: CheckCircle, color: '#22c55e' },
  { label: 'Day Streak', value: '12', icon: Flame, color: '#f97316' },
];

const upcomingAppointments = [
  { id: '1', title: 'Physical Therapy', provider: 'Dr. Sarah Chen', time: 'Today, 2:00 PM', status: 'confirmed' },
  { id: '2', title: 'Follow-up Assessment', provider: 'Dr. Mike Rodriguez', time: 'Fri, 10:00 AM', status: 'pending' },
];

const pendingExercises = [
  { id: '1', name: 'Knee Extension', sets: 3, reps: 10 },
  { id: '2', name: 'Hamstring Curl', sets: 3, reps: 12 },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        {/* Greeting */}
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#ffffff', marginTop: 16, marginBottom: 4 }}>
          Welcome back,
        </Text>
        <Text style={{ fontSize: 18, color: '#6b7280', marginBottom: 24 }}>
          Let's stay on track today
        </Text>

        {/* Quick Stats */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          {stats.map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                backgroundColor: '#1a1a1a',
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: '#2a2a2a',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <stat.icon size={18} color={stat.color} />
                <Text style={{ fontSize: 12, color: '#6b7280' }}>{stat.label}</Text>
              </View>
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#ffffff' }}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Today's Schedule */}
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 12 }}>Today's Schedule</Text>
        <View style={{ backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2a2a2a', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Calendar size={18} color="#4f7cff" />
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Upcoming Appointments</Text>
          </View>
          {upcomingAppointments.map((apt) => (
            <View
              key={apt.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#2a2a2a',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '500', color: '#ffffff' }}>{apt.title}</Text>
                <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{apt.provider}</Text>
                <Text style={{ fontSize: 12, color: '#4f7cff', marginTop: 2 }}>{apt.time}</Text>
              </View>
              <View
                style={{
                  backgroundColor: apt.status === 'confirmed' ? '#22c55e20' : '#f9731620',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: apt.status === 'confirmed' ? '#22c55e' : '#f97316',
                    fontWeight: '500',
                  }}
                >
                  {apt.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pending HEP Exercises */}
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#ffffff', marginBottom: 12 }}>Today's Exercises</Text>
        <View style={{ backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2a2a2a' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Dumbbell size={18} color="#4f7cff" />
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Pending HEP</Text>
          </View>
          {pendingExercises.map((ex) => (
            <View
              key={ex.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#2a2a2a',
              }}
            >
              <View>
                <Text style={{ fontSize: 15, fontWeight: '500', color: '#ffffff' }}>{ex.name}</Text>
                <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                  {ex.sets} sets × {ex.reps} reps
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: '#4f7cff',
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 13, color: '#ffffff', fontWeight: '500' }}>Start</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/exercises')}
            style={{ alignItems: 'center', paddingVertical: 10, marginTop: 4 }}
          >
            <Text style={{ fontSize: 14, color: '#4f7cff', fontWeight: '500' }}>View All Exercises →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
