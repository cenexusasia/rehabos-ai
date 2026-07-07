import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, CheckCircle, Play } from 'lucide-react-native';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  completed: boolean;
}

const initialExercises: Exercise[] = [
  { id: '1', name: 'Knee Extension', sets: 3, reps: 10, completed: false },
  { id: '2', name: 'Hamstring Curl', sets: 3, reps: 12, completed: false },
  { id: '3', name: 'Straight Leg Raise', sets: 2, reps: 15, completed: false },
  { id: '4', name: 'Heel Slides', sets: 3, reps: 10, completed: true },
  { id: '5', name: 'Calf Stretch', sets: 2, reps: 30, completed: true },
];

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState(initialExercises);

  const completedCount = exercises.filter((e) => e.completed).length;
  const totalCount = exercises.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleComplete = (id: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, completed: !ex.completed } : ex))
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        {/* Header */}
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#ffffff', marginTop: 16, marginBottom: 4 }}>
          Home Exercise Program
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
          {completedCount} of {totalCount} completed today
        </Text>

        {/* Progress Bar */}
        <View
          style={{
            backgroundColor: '#1a1a1a',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: '#2a2a2a',
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Today's Progress</Text>
            <Text style={{ fontSize: 14, color: '#4f7cff', fontWeight: '600' }}>{Math.round(progress)}%</Text>
          </View>
          <View style={{ height: 8, backgroundColor: '#2a2a2a', borderRadius: 4, overflow: 'hidden' }}>
            <View
              style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: '#4f7cff',
                borderRadius: 4,
              }}
            />
          </View>
        </View>

        {/* Exercise List */}
        {exercises.map((ex) => (
          <View
            key={ex.id}
            style={{
              backgroundColor: '#1a1a1a',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: ex.completed ? '#22c55e40' : '#2a2a2a',
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            {/* Video Thumbnail Placeholder */}
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 10,
                backgroundColor: '#2a2a2a',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Play size={20} color="#6b7280" />
            </View>

            {/* Exercise Info */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: ex.completed ? '#22c55e' : '#ffffff',
                }}
              >
                {ex.name}
              </Text>
              <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                {ex.sets} sets × {ex.reps} reps
              </Text>
            </View>

            {/* Mark Complete Button */}
            <TouchableOpacity
              onPress={() => toggleComplete(ex.id)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: ex.completed ? '#22c55e20' : '#2a2a2a',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: ex.completed ? '#22c55e' : '#3a3a3a',
              }}
            >
              {ex.completed ? <CheckCircle size={22} color="#22c55e" /> : <Dumbbell size={18} color="#6b7280" />}
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
