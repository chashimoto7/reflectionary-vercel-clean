// src/services/LibraryContentService.js
import { supabase } from '../lib/supabase';
import KnowledgeGardenService from './KnowledgeGardenService';

class LibraryContentService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes for library content
  }

  // ================================
  // LIBRARY CONTENT BROWSING
  // ================================

  async getApprovedContent(filters = {}) {
    try {
      const cacheKey = `library_content_${JSON.stringify(filters)}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      let query = supabase
        .from('library_content')
        .select('*')
        .eq('approval_status', 'approved');

      // Apply filters
      if (filters.category) {
        if (filters.category !== 'all') {
          query = query.eq('primary_category', filters.category);
        }
      }

      if (filters.content_type) {
        if (filters.content_type !== 'all') {
          query = query.eq('content_type', filters.content_type);
        }
      }

      if (filters.difficulty_level) {
        if (filters.difficulty_level !== 'all') {
          query = query.eq('difficulty_level', parseInt(filters.difficulty_level));
        }
      }

      if (filters.max_reading_time) {
        query = query.lte('reading_time_minutes', parseInt(filters.max_reading_time));
      }

      if (filters.min_quality_score) {
        query = query.gte('quality_score', parseFloat(filters.min_quality_score));
      }

      if (filters.search_query) {
        query = query.or(`title.ilike.%${filters.search_query}%,description.ilike.%${filters.search_query}%,author.ilike.%${filters.search_query}%`);
      }

      // Apply sorting
      const sortBy = filters.sort_by || 'created_at';
      const sortOrder = filters.sort_order || 'desc';
      
      switch (sortBy) {
        case 'popularity':
          query = query.order('save_count', { ascending: sortOrder === 'asc' });
          break;
        case 'quality':
          query = query.order('quality_score', { ascending: sortOrder === 'asc' });
          break;
        case 'reading_time':
          query = query.order('reading_time_minutes', { ascending: sortOrder === 'asc' });
          break;
        default:
          query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database error fetching library content:', error);
        throw new Error(`Failed to fetch library content: ${error.message}`);
      }

      const result = { success: true, data };

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Error fetching library content:', error);
      throw error;
    }
  }

  async getLibraryCategories() {
    try {
      const cacheKey = 'library_categories';
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const { data, error } = await supabase
        .from('library_content')
        .select('primary_category')
        .eq('approval_status', 'approved');

      if (error) {
        console.error('Database error fetching categories:', error);
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      // Count items per category
      const categoryCounts = {};
      data.forEach(item => {
        categoryCounts[item.primary_category] = (categoryCounts[item.primary_category] || 0) + 1;
      });

      const categories = Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        count
      }));

      const result = { success: true, data: categories };
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

      return result;
    } catch (error) {
      console.error('Error fetching library categories:', error);
      throw error;
    }
  }

  async getContentRecommendations(userId, limit = 5) {
    try {
      // Get user's recent journal themes and saved content patterns
      const userProfile = await this.getUserContentProfile(userId);
      
      // Simple recommendation based on popular content in user's interest areas
      let query = supabase
        .from('library_content')
        .select('*')
        .eq('approval_status', 'approved')
        .order('save_count', { ascending: false })
        .limit(limit);

      // If user has interests, filter by those categories
      if (userProfile.interests && userProfile.interests.length > 0) {
        query = query.in('primary_category', userProfile.interests);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database error fetching recommendations:', error);
        throw new Error(`Failed to fetch recommendations: ${error.message}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching content recommendations:', error);
      throw error;
    }
  }

  async trackContentView(contentId) {
    try {
      const { error } = await supabase
        .from('library_content')
        .update({ 
          view_count: supabase.raw('view_count + 1') 
        })
        .eq('id', contentId);

      if (error) {
        console.error('Error tracking content view:', error);
      }
    } catch (error) {
      console.error('Error tracking content view:', error);
    }
  }

  // ================================
  // SAVE CONTENT TO PERSONAL GARDEN
  // ================================

  async saveContentToGarden(userId, libraryContentId, personalNotes = '') {
    try {
      // Check if already saved
      const { data: existingSave } = await supabase
        .from('user_library_saves')
        .select('*')
        .eq('user_id', userId)
        .eq('library_content_id', libraryContentId)
        .single();

      if (existingSave) {
        throw new Error('Content is already saved to your garden');
      }

      // Get the library content details
      const { data: libraryContent, error: fetchError } = await supabase
        .from('library_content')
        .select('*')
        .eq('id', libraryContentId)
        .eq('approval_status', 'approved')
        .single();

      if (fetchError || !libraryContent) {
        throw new Error('Library content not found or not approved');
      }

      // Create knowledge item from library content
      const knowledgeItemData = {
        title: libraryContent.title,
        content: libraryContent.description,
        item_type: 'article',
        source_type: 'library_import',
        source_url: libraryContent.content_url,
        source_author: libraryContent.author,
        source_published_date: libraryContent.published_date,
        difficulty_level: libraryContent.difficulty_level,
        user_notes: personalNotes,
        metadata: {
          libraryContentId: libraryContentId,
          originalTags: libraryContent.tags,
          originalCategories: [libraryContent.primary_category, ...(libraryContent.secondary_categories || [])],
          qualityScore: libraryContent.quality_score
        }
      };

      // Create the knowledge item
      const knowledgeResult = await KnowledgeGardenService.createKnowledgeItem(userId, knowledgeItemData);

      if (!knowledgeResult.success) {
        throw new Error('Failed to create knowledge item');
      }

      // Create the save record
      const saveData = {
        user_id: userId,
        library_content_id: libraryContentId,
        knowledge_item_id: knowledgeResult.data.id,
        user_notes: personalNotes,
        created_at: new Date().toISOString()
      };

      const { data: saveRecord, error: saveError } = await supabase
        .from('user_library_saves')
        .insert([saveData])
        .select()
        .single();

      if (saveError) {
        // If save record creation fails, cleanup the knowledge item
        await KnowledgeGardenService.deleteKnowledgeItem(knowledgeResult.data.id, userId, true);
        throw new Error(`Failed to save content: ${saveError.message}`);
      }

      // Update library content save count
      await supabase
        .from('library_content')
        .update({ 
          save_count: supabase.raw('save_count + 1') 
        })
        .eq('id', libraryContentId);

      // Clear caches
      this.clearUserCache(userId);
      KnowledgeGardenService.clearUserCache(userId);

      return { 
        success: true, 
        data: {
          saveRecord,
          knowledgeItem: knowledgeResult.data
        }
      };
    } catch (error) {
      console.error('Error saving content to garden:', error);
      throw error;
    }
  }

  async unsaveContentFromGarden(userId, libraryContentId) {
    try {
      // Get the save record
      const { data: saveRecord, error: fetchError } = await supabase
        .from('user_library_saves')
        .select('*')
        .eq('user_id', userId)
        .eq('library_content_id', libraryContentId)
        .single();

      if (fetchError || !saveRecord) {
        throw new Error('Save record not found');
      }

      // Delete the knowledge item
      if (saveRecord.knowledge_item_id) {
        await KnowledgeGardenService.deleteKnowledgeItem(saveRecord.knowledge_item_id, userId, true);
      }

      // Delete the save record
      const { error: deleteError } = await supabase
        .from('user_library_saves')
        .delete()
        .eq('id', saveRecord.id);

      if (deleteError) {
        throw new Error(`Failed to unsave content: ${deleteError.message}`);
      }

      // Update library content save count
      await supabase
        .from('library_content')
        .update({ 
          save_count: supabase.raw('GREATEST(save_count - 1, 0)') 
        })
        .eq('id', libraryContentId);

      // Clear caches
      this.clearUserCache(userId);
      KnowledgeGardenService.clearUserCache(userId);

      return { success: true };
    } catch (error) {
      console.error('Error unsaving content from garden:', error);
      throw error;
    }
  }

  async rateContent(userId, libraryContentId, rating) {
    try {
      // Validate rating
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Update user's save record with rating
      const { data, error } = await supabase
        .from('user_library_saves')
        .update({ user_rating: rating })
        .eq('user_id', userId)
        .eq('library_content_id', libraryContentId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to rate content: ${error.message}`);
      }

      // Update library content average rating (this would typically be done via a database function)
      await this.updateLibraryContentRating(libraryContentId);

      return { success: true, data };
    } catch (error) {
      console.error('Error rating content:', error);
      throw error;
    }
  }

  // ================================
  // USER'S SAVED CONTENT
  // ================================

  async getUserSavedContent(userId, filters = {}) {
    try {
      const cacheKey = `user_saved_${userId}_${JSON.stringify(filters)}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      let query = supabase
        .from('user_library_saves')
        .select(`
          *,
          library_content (*),
          knowledge_items (
            id,
            title,
            times_accessed,
            last_accessed_at,
            user_rating,
            is_archived
          )
        `)
        .eq('user_id', userId);

      // Apply filters
      if (filters.category && filters.category !== 'all') {
        query = query.eq('library_content.primary_category', filters.category);
      }

      // Apply sorting
      const sortBy = filters.sort_by || 'created_at';
      const sortOrder = filters.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) {
        console.error('Database error fetching saved content:', error);
        throw new Error(`Failed to fetch saved content: ${error.message}`);
      }

      const result = { success: true, data };
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

      return result;
    } catch (error) {
      console.error('Error fetching user saved content:', error);
      throw error;
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  async getUserContentProfile(userId) {
    try {
      // Get user's saved content to determine interests
      const { data: savedContent } = await supabase
        .from('user_library_saves')
        .select('library_content!inner(primary_category)')
        .eq('user_id', userId);

      const interests = [];
      if (savedContent) {
        const categoryCounts = {};
        savedContent.forEach(save => {
          const category = save.library_content.primary_category;
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        // Get top 3 categories
        interests.push(...Object.entries(categoryCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([category]) => category)
        );
      }

      return { interests };
    } catch (error) {
      console.error('Error getting user content profile:', error);
      return { interests: [] };
    }
  }

  async updateLibraryContentRating(libraryContentId) {
    try {
      // Calculate average rating from user saves
      const { data: ratings } = await supabase
        .from('user_library_saves')
        .select('user_rating')
        .eq('library_content_id', libraryContentId)
        .not('user_rating', 'is', null);

      if (ratings && ratings.length > 0) {
        const average = ratings.reduce((sum, r) => sum + r.user_rating, 0) / ratings.length;
        
        await supabase
          .from('library_content')
          .update({ average_user_rating: Math.round(average * 100) / 100 })
          .eq('id', libraryContentId);
      }
    } catch (error) {
      console.error('Error updating library content rating:', error);
    }
  }

  clearUserCache(userId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(`_${userId}_`) || key.includes(`user_${userId}`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clearAllCache() {
    this.cache.clear();
  }
}

export default new LibraryContentService();