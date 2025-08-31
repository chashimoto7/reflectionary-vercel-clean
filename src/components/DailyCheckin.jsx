// src/components/DailyCheckin.jsx
import React, { useState, useEffect } from 'react';
import './DailyCheckin.css';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Moon,
  Apple,
  Droplets,
  Zap,
  Clock,
  Heart,
  Brain,
  Battery,
  Smile,
  Frown,
  Meh,
  Save,
  CheckCircle,
} from 'lucide-react';

const DailyCheckin = ({ userName }) => {
  const { user } = useAuth();
  const [checkinData, setCheckinData] = useState({
    sleep_quality: 5,
    nutrition_quality: 5,
    hydration_quality: 5,
    exercise_intensity: 5,
    exercise_duration: 5,
    mood: 5,
    stress_level: 5,
    energy_level: 5,
    predominant_emotion: '',
    notes: '',
  });
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const emotions = [
    'Happy', 'Excited', 'Calm', 'Peaceful', 'Grateful',
    'Anxious', 'Stressed', 'Sad', 'Frustrated', 'Tired',
    'Motivated', 'Optimistic', 'Content', 'Overwhelmed', 'Focused'
  ];

  // Check if user has already checked in today
  useEffect(() => {
    const checkTodaysCheckin = async () => {
      if (!user) return;

      try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const { data, error } = await supabase
          .from('daily_checkins')
          .select('*')
          .eq('user_id', user.id)
          .eq('checkin_date', today)
          .single();

        if (data && !error) {
          setCheckinData({
            sleep_quality: data.sleep_quality || 5,
            nutrition_quality: data.nutrition_quality || 5,
            hydration_quality: data.hydration_quality || 5,
            exercise_intensity: data.exercise_intensity || 5,
            exercise_duration: data.exercise_duration || 5,
            mood: data.mood || 5,
            stress_level: data.stress_level || 5,
            energy_level: data.energy_level || 5,
            predominant_emotion: data.predominant_emotion || '',
            notes: data.notes || '',
          });
          setHasCheckedInToday(true);
        }
      } catch (error) {
        console.error('Error checking today\'s check-in:', error);
      } finally {
        setLoading(false);
      }
    };

    checkTodaysCheckin();
  }, [user]);

  const handleSliderChange = (field, value) => {
    setCheckinData(prev => ({
      ...prev,
      [field]: parseInt(value)
    }));
  };

  const handleEmotionChange = (emotion) => {
    setCheckinData(prev => ({
      ...prev,
      predominant_emotion: emotion
    }));
  };

  const handleSave = async () => {
    if (!user || saving) return;

    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .upsert({
          user_id: user.id,
          checkin_date: today,
          ...checkinData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,checkin_date'
        });

      if (error) throw error;

      setHasCheckedInToday(true);
    } catch (error) {
      console.error('Error saving check-in:', error);
      // TODO: Add error toast notification
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-white/10 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const SliderField = ({ icon: Icon, label, field, min = 1, max = 10, lowLabel, highLabel }) => (
    <div className="bg-white/5 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-5 h-5 text-purple-300" />
        <span className="text-white font-medium">{label}</span>
      </div>
      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          value={checkinData[field]}
          onChange={(e) => handleSliderChange(field, e.target.value)}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((checkinData[field] - min) / (max - min)) * 100}%, rgba(255,255,255,0.2) ${((checkinData[field] - min) / (max - min)) * 100}%, rgba(255,255,255,0.2) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-300">
          <span>{lowLabel}</span>
          <span className="font-semibold text-purple-200">{checkinData[field]}</span>
          <span>{highLabel}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-2">
          {getTimeBasedGreeting()} {userName}, how are you doing today?
        </h2>
        {hasCheckedInToday ? (
          <div className="flex items-center gap-2 text-green-300">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">You've already checked in today! You can update your responses below.</span>
          </div>
        ) : (
          <p className="text-gray-300">Take a moment to reflect on how you're feeling today.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <SliderField
          icon={Moon}
          label="Sleep Quality"
          field="sleep_quality"
          lowLabel="Poor"
          highLabel="Excellent"
        />
        <SliderField
          icon={Apple}
          label="Nutrition Quality"
          field="nutrition_quality"
          lowLabel="Poor"
          highLabel="Excellent"
        />
        <SliderField
          icon={Droplets}
          label="Hydration"
          field="hydration_quality"
          lowLabel="Dehydrated"
          highLabel="Well Hydrated"
        />
        <SliderField
          icon={Zap}
          label="Exercise Intensity"
          field="exercise_intensity"
          lowLabel="None"
          highLabel="High Intensity"
        />
        <SliderField
          icon={Clock}
          label="Exercise Duration"
          field="exercise_duration"
          lowLabel="None"
          highLabel="Long Session"
        />
        <SliderField
          icon={Heart}
          label="Mood"
          field="mood"
          lowLabel="Low"
          highLabel="Great"
        />
        <SliderField
          icon={Brain}
          label="Stress Level"
          field="stress_level"
          lowLabel="Relaxed"
          highLabel="Very Stressed"
        />
        <SliderField
          icon={Battery}
          label="Energy Level"
          field="energy_level"
          lowLabel="Drained"
          highLabel="Energized"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Smile className="w-5 h-5 text-purple-300" />
          <span className="text-white font-medium">Predominant Emotion</span>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {emotions.map(emotion => (
            <button
              key={emotion}
              onClick={() => handleEmotionChange(emotion)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                checkinData.predominant_emotion === emotion
                  ? 'bg-purple-600 text-white border-2 border-purple-400'
                  : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
              }`}
            >
              {emotion}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-3 mb-3">
          <Brain className="w-5 h-5 text-purple-300" />
          <span className="text-white font-medium">Additional Notes (Optional)</span>
        </label>
        <textarea
          value={checkinData.notes}
          onChange={(e) => setCheckinData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
          placeholder="Anything else you'd like to note about your day..."
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
        ) : (
          <Save className="w-5 h-5" />
        )}
        {saving ? 'Saving...' : hasCheckedInToday ? 'Update Check-in' : 'Save Check-in'}
      </button>
    </div>
  );
};

export default DailyCheckin;