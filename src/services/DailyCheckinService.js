// src/services/DailyCheckinService.js
import { supabase } from '../lib/supabase';

class DailyCheckinService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // ================================
  // DAILY CHECK-IN OPERATIONS
  // ================================

  async getTodaysCheckin(userId) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const cacheKey = `checkin_${userId}_${today}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .eq('checkin_date', today)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Database error fetching today\'s check-in:', error);
        throw new Error(`Failed to fetch today's check-in: ${error.message}`);
      }

      const result = { 
        success: true, 
        data: data || null,
        hasCheckedIn: !!data
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Error fetching today\'s check-in:', error);
      throw error;
    }
  }

  async saveCheckin(userId, checkinData) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Validate required data
      if (!this.validateCheckinData(checkinData)) {
        throw new Error('Invalid check-in data provided');
      }

      // Prepare check-in record
      const checkinRecord = {
        user_id: userId,
        checkin_date: today,
        checkin_time: new Date().toISOString(),
        
        // 1-10 scales
        sleep_quality: this.validateScale(checkinData.sleep_quality),
        nutrition_quality: this.validateScale(checkinData.nutrition_quality),
        hydration_quality: this.validateScale(checkinData.hydration_quality),
        exercise_intensity: this.validateScale(checkinData.exercise_intensity),
        exercise_duration: this.validateScale(checkinData.exercise_duration),
        mood: this.validateScale(checkinData.mood),
        stress_level: this.validateScale(checkinData.stress_level),
        energy_level: this.validateScale(checkinData.energy_level),
        
        // Emotions array (max 3)
        emotions: this.validateEmotions(checkinData.emotions),
        
        // Notes
        notes: checkinData.notes || null,
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Check if check-in already exists for today
      const existing = await this.getTodaysCheckin(userId);
      
      let result;
      if (existing.hasCheckedIn) {
        // Update existing check-in
        const { data, error } = await supabase
          .from('daily_checkins')
          .update({
            ...checkinRecord,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('checkin_date', today)
          .select()
          .single();

        if (error) {
          console.error('Database error updating check-in:', error);
          throw new Error(`Failed to update check-in: ${error.message}`);
        }

        result = { success: true, data, action: 'updated' };
      } else {
        // Create new check-in
        const { data, error } = await supabase
          .from('daily_checkins')
          .insert([checkinRecord])
          .select()
          .single();

        if (error) {
          console.error('Database error creating check-in:', error);
          throw new Error(`Failed to create check-in: ${error.message}`);
        }

        result = { success: true, data, action: 'created' };
      }

      // Update analytics
      await this.updateCheckinAnalytics(userId, result.data);

      // Clear cache
      this.clearUserCache(userId);

      return result;
    } catch (error) {
      console.error('Error saving check-in:', error);
      throw error;
    }
  }

  async getCheckinHistory(userId, days = 30) {
    try {
      const cacheKey = `checkin_history_${userId}_${days}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('checkin_date', startDateStr)
        .order('checkin_date', { ascending: false });

      if (error) {
        console.error('Database error fetching check-in history:', error);
        throw new Error(`Failed to fetch check-in history: ${error.message}`);
      }

      const result = { success: true, data };
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

      return result;
    } catch (error) {
      console.error('Error fetching check-in history:', error);
      throw error;
    }
  }

  async getCheckinAnalytics(userId, timeframe = '30days') {
    try {
      const cacheKey = `checkin_analytics_${userId}_${timeframe}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      let days;
      switch (timeframe) {
        case '7days': days = 7; break;
        case '30days': days = 30; break;
        case '90days': days = 90; break;
        default: days = 30;
      }

      const historyResult = await this.getCheckinHistory(userId, days);
      if (!historyResult.success) {
        throw new Error('Failed to fetch check-in data for analytics');
      }

      const checkins = historyResult.data;
      
      // Calculate analytics
      const analytics = this.calculateAnalytics(checkins, timeframe);

      const result = { success: true, data: analytics };
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

      return result;
    } catch (error) {
      console.error('Error fetching check-in analytics:', error);
      throw error;
    }
  }

  async getCheckinStreak(userId) {
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('checkin_date')
        .eq('user_id', userId)
        .order('checkin_date', { ascending: false })
        .limit(100); // Get last 100 days

      if (error) {
        console.error('Database error fetching check-in dates:', error);
        throw new Error(`Failed to fetch check-in dates: ${error.message}`);
      }

      const streak = this.calculateStreak(data);
      return { success: true, data: { currentStreak: streak } };
    } catch (error) {
      console.error('Error calculating check-in streak:', error);
      throw error;
    }
  }

  // ================================
  // VALIDATION METHODS
  // ================================

  validateCheckinData(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // At least one metric must be provided
    const metrics = [
      'sleep_quality', 'nutrition_quality', 'hydration_quality',
      'exercise_intensity', 'exercise_duration', 'mood',
      'stress_level', 'energy_level'
    ];

    return metrics.some(metric => data[metric] !== undefined && data[metric] !== null);
  }

  validateScale(value) {
    if (value === undefined || value === null) {
      return null;
    }
    
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1 || numValue > 10) {
      return null;
    }
    
    return numValue;
  }

  validateEmotions(emotions) {
    if (!emotions || !Array.isArray(emotions)) {
      return [];
    }

    // Limit to maximum 3 emotions and ensure they're strings
    return emotions
      .filter(emotion => typeof emotion === 'string' && emotion.trim().length > 0)
      .slice(0, 3)
      .map(emotion => emotion.trim().toLowerCase());
  }

  // ================================
  // ANALYTICS CALCULATIONS
  // ================================

  calculateAnalytics(checkins, timeframe) {
    if (!checkins || checkins.length === 0) {
      return this.getEmptyAnalytics();
    }

    const metrics = [
      'sleep_quality', 'nutrition_quality', 'hydration_quality',
      'exercise_intensity', 'exercise_duration', 'mood',
      'stress_level', 'energy_level'
    ];

    const analytics = {
      totalCheckins: checkins.length,
      timeframe: timeframe,
      averages: {},
      trends: {},
      topEmotions: [],
      streaks: this.calculateStreak(checkins),
      insights: []
    };

    // Calculate averages
    metrics.forEach(metric => {
      const values = checkins
        .map(c => c[metric])
        .filter(v => v !== null && v !== undefined);
      
      if (values.length > 0) {
        analytics.averages[metric] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
      }
    });

    // Calculate trends (compare first half vs second half)
    if (checkins.length >= 4) {
      const midpoint = Math.floor(checkins.length / 2);
      const recent = checkins.slice(0, midpoint);
      const earlier = checkins.slice(midpoint);

      metrics.forEach(metric => {
        const recentAvg = this.getAverageForMetric(recent, metric);
        const earlierAvg = this.getAverageForMetric(earlier, metric);
        
        if (recentAvg !== null && earlierAvg !== null) {
          const change = recentAvg - earlierAvg;
          analytics.trends[metric] = {
            direction: change > 0.5 ? 'improving' : change < -0.5 ? 'declining' : 'stable',
            change: Math.round(change * 10) / 10
          };
        }
      });
    }

    // Calculate top emotions
    const emotionCounts = {};
    checkins.forEach(checkin => {
      if (checkin.emotions) {
        checkin.emotions.forEach(emotion => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
      }
    });

    analytics.topEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count, percentage: Math.round((count / checkins.length) * 100) }));

    // Generate insights
    analytics.insights = this.generateInsights(analytics);

    return analytics;
  }

  getAverageForMetric(checkins, metric) {
    const values = checkins
      .map(c => c[metric])
      .filter(v => v !== null && v !== undefined);
    
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  calculateStreak(checkins) {
    if (!checkins || checkins.length === 0) return 0;

    // Sort by date descending
    const sortedDates = checkins
      .map(c => new Date(c.checkin_date))
      .sort((a, b) => b - a);

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Start of today

    for (const checkinDate of sortedDates) {
      const checkinDay = new Date(checkinDate);
      checkinDay.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate - checkinDay) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  generateInsights(analytics) {
    const insights = [];

    // Mood insights
    if (analytics.averages.mood) {
      if (analytics.averages.mood >= 7) {
        insights.push({
          type: 'positive',
          metric: 'mood',
          message: `Your average mood is ${analytics.averages.mood}/10 - you're doing great!`,
          suggestion: 'Keep up the practices that are supporting your wellbeing.'
        });
      } else if (analytics.averages.mood < 5) {
        insights.push({
          type: 'concern',
          metric: 'mood',
          message: `Your average mood is ${analytics.averages.mood}/10, which suggests some challenges.`,
          suggestion: 'Consider speaking with a healthcare provider or counselor for support.'
        });
      }
    }

    // Sleep insights
    if (analytics.averages.sleep_quality) {
      if (analytics.averages.sleep_quality < 6) {
        insights.push({
          type: 'improvement',
          metric: 'sleep_quality',
          message: `Your sleep quality average is ${analytics.averages.sleep_quality}/10.`,
          suggestion: 'Focus on sleep hygiene: consistent bedtime, limiting screens before bed, and creating a comfortable sleep environment.'
        });
      }
    }

    // Trend insights
    if (analytics.trends.mood) {
      if (analytics.trends.mood.direction === 'improving') {
        insights.push({
          type: 'positive',
          metric: 'mood',
          message: 'Your mood has been trending upward recently!',
          suggestion: 'Reflect on what changes or practices might be contributing to this improvement.'
        });
      }
    }

    return insights;
  }

  getEmptyAnalytics() {
    return {
      totalCheckins: 0,
      timeframe: null,
      averages: {},
      trends: {},
      topEmotions: [],
      streaks: 0,
      insights: []
    };
  }

  // ================================
  // ANALYTICS INTEGRATION
  // ================================

  async updateCheckinAnalytics(userId, checkinData) {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Update or create garden analytics entry
      const { data: existingAnalytics } = await supabase
        .from('garden_analytics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      const analyticsData = {
        user_id: userId,
        date: today,
        // We'll add check-in specific metrics here in the future
        created_at: new Date().toISOString()
      };

      if (existingAnalytics) {
        await supabase
          .from('garden_analytics')
          .update(analyticsData)
          .eq('id', existingAnalytics.id);
      } else {
        await supabase
          .from('garden_analytics')
          .insert([analyticsData]);
      }
    } catch (error) {
      console.error('Error updating check-in analytics:', error);
      // Don't throw - this is a background operation
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  clearUserCache(userId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(`_${userId}_`) || key.includes(`checkin_${userId}`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clearAllCache() {
    this.cache.clear();
  }
}

export default new DailyCheckinService();