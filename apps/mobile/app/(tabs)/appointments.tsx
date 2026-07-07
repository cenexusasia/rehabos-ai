import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, MapPin, User as UserIcon, XCircle, Clock } from 'lucide-react-native';

interface Appointment {
  id: string;
  title: string;
  provider: string;
  date: string;
  time: string;
  location: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  isUpcoming: boolean;
}

const appointments: Appointment[] = [
  {
    id: '1',
    title: 'Physical Therapy',
    provider: 'Dr. Sarah Chen',
    date: 'Today',
    time: '2:00 PM',
    location: 'Room 204, Rehab Center',
    status: 'confirmed',
    isUpcoming: true,
  },
  {
    id: '2',
    title: 'Follow-up Assessment',
    provider: 'Dr. Mike Rodriguez',
    date: 'Fri, Jul 10',
    time: '10:00 AM',
    location: 'Clinic B, 3rd Floor',
    status: 'pending',
    isUpcoming: true,
  },
  {
    id: '3',
    title: 'Initial Evaluation',
    provider: 'Dr. Sarah Chen',
    date: 'Mon, Jun 29',
    time: '11:30 AM',
    location: 'Room 204, Rehab Center',
    status: 'completed',
    isUpcoming: false,
  },
  {
    id: '4',
    title: 'Strength Assessment',
    provider: 'Dr. James Park',
    date: 'Wed, Jun 24',
    time: '3:00 PM',
    location: 'Gym, 1st Floor',
    status: 'cancelled',
    isUpcoming: false,
  },
];

const statusConfig: Record<string, { color: string; label: string; bg: string }> = {
  confirmed: { color: '#22c55e', label: 'Confirmed', bg: '#22c55e20' },
  pending: { color: '#f97316', label: 'Pending', bg: '#f9731620' },
  cancelled: { color: '#ef4444', label: 'Cancelled', bg: '#ef444420' },
  completed: { color: '#6b7280', label: 'Completed', bg: '#6b728020' },
};

export default function AppointmentsScreen() {
  const [showUpcoming, setShowUpcoming] = useState(true);

  const filtered = appointments.filter((a) => (showUpcoming ? a.isUpcoming : !a.isUpcoming));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        {/* Header */}
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#ffffff', marginTop: 16, marginBottom: 16 }}>
          Appointments
        </Text>

        {/* Toggle */}
        <View style={{ flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 10, padding: 4, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => setShowUpcoming(true)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: showUpcoming ? '#4f7cff' : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: showUpcoming ? '#ffffff' : '#6b7280' }}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowUpcoming(false)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: !showUpcoming ? '#4f7cff' : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: !showUpcoming ? '#ffffff' : '#6b7280' }}>
              Past
            </Text>
          </TouchableOpacity>
        </View>

        {/* Appointment Cards */}
        {filtered.map((apt) => {
          const cfg = statusConfig[apt.status];
          return (
            <View
              key={apt.id}
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: '#2a2a2a',
                marginBottom: 12,
              }}
            >
              {/* Header Row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 17, fontWeight: '600', color: '#ffffff' }}>{apt.title}</Text>
                <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                  <Text style={{ fontSize: 12, color: cfg.color, fontWeight: '500' }}>{cfg.label}</Text>
                </View>
              </View>

              {/* Details */}
              <View style={{ gap: 8, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <UserIcon size= {16} color="#6b7280" />
                  <Text style={{ fontSize: 14, color: '#d1d5db' }}>{apt.provider}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Calendar size={16} color="#6b7280" />
                  <Text style={{ fontSize: 14, color: '#d1d5db' }}>{apt.date} at {apt.time}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MapPin size={16} color="#6b7280" />
                  <Text style={{ fontSize: 14, color: '#d1d5db' }}>{apt.location}</Text>
                </View>
              </View>

              {/* Action Buttons (only for upcoming) */}
              {apt.isUpcoming && (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#4f7cff',
                      paddingVertical: 10,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#ffffff' }}>Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#ef444420',
                      paddingVertical: 10,
                      borderRadius: 8,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#ef4444',
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#ef4444' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 32 }}>
            <Text style={{ fontSize: 16, color: '#6b7280' }}>No {showUpcoming ? 'upcoming' : 'past'} appointments</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
