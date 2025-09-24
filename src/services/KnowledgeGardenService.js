// frontend/src/services/KnowledgeGardenService.js
// Service for Knowledge Garden operations using backend API

class KnowledgeGardenService {
  constructor() {
    // Use the backend API URL from environment or default to localhost
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3003';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // ====================================================================
  // CACHE MANAGEMENT
  // ====================================================================

  clearCache() {
    this.cache.clear();
  }

  invalidateCache(pattern = null) {
    if (!pattern) {
      this.clearCache();
      return;
    }

    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  // ====================================================================
  // KNOWLEDGE ITEMS API
  // ====================================================================

  async getUserKnowledgeItems(userId, options = {}) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const cacheKey = `user_items_${userId}_${JSON.stringify(options)}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📦 Cache hit for user knowledge items');
        return cached.data;
      }
    }

    console.log('🔍 Fetching user knowledge items via API:', { userId, options });

    try {
      // Build query parameters
      const params = new URLSearchParams({
        user_id: userId,
        ...options
      });

      // Use the backend API endpoint that handles decryption server-side
      const response = await fetch(`${this.baseUrl}/api/knowledge/items?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch knowledge items');
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      console.log(`✅ Retrieved ${result.data?.length || 0} knowledge items for user ${userId}`);

      return result;

    } catch (error) {
      console.error('Error fetching user knowledge items:', error);
      throw new Error(`Failed to fetch knowledge items: ${error.message}`);
    }
  }

  async createKnowledgeItem(userId, itemData) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('➕ Creating knowledge item via API:', { userId, title: itemData.title });

    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge/items?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(itemData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create knowledge item');
      }

      // Invalidate cache
      this.invalidateCache(`user_items_${userId}`);

      console.log('✅ Knowledge item created:', result.data?.id);
      return result;

    } catch (error) {
      console.error('Error creating knowledge item:', error);
      throw new Error(`Failed to create knowledge item: ${error.message}`);
    }
  }

  async updateKnowledgeItem(userId, itemId, updates) {
    if (!userId || !itemId) {
      throw new Error('User ID and Item ID are required');
    }

    console.log('📝 Updating knowledge item via API:', { userId, itemId });

    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge/items?user_id=${userId}&item_id=${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update knowledge item');
      }

      // Invalidate cache
      this.invalidateCache(`user_items_${userId}`);

      console.log('✅ Knowledge item updated:', itemId);
      return result;

    } catch (error) {
      console.error('Error updating knowledge item:', error);
      throw new Error(`Failed to update knowledge item: ${error.message}`);
    }
  }

  async deleteKnowledgeItem(userId, itemId, hardDelete = false) {
    if (!userId || !itemId) {
      throw new Error('User ID and Item ID are required');
    }

    console.log('🗑️ Deleting knowledge item via API:', { userId, itemId, hardDelete });

    try {
      const params = new URLSearchParams({
        user_id: userId,
        item_id: itemId,
        hard_delete: hardDelete.toString()
      });

      const response = await fetch(`${this.baseUrl}/api/knowledge/items?${params.toString()}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete knowledge item');
      }

      // Invalidate cache
      this.invalidateCache(`user_items_${userId}`);

      console.log('✅ Knowledge item deleted:', itemId);
      return result;

    } catch (error) {
      console.error('Error deleting knowledge item:', error);
      throw new Error(`Failed to delete knowledge item: ${error.message}`);
    }
  }

  // ====================================================================
  // FOLDERS API
  // ====================================================================

  async getUserFolders(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const cacheKey = `user_folders_${userId}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📦 Cache hit for user folders');
        return cached.data;
      }
    }

    console.log('📁 Fetching user folders via API:', { userId });

    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge/folders?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch folders');
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      console.log(`✅ Retrieved ${result.data?.length || 0} folders for user ${userId}`);

      return result;

    } catch (error) {
      console.error('Error fetching user folders:', error);
      throw new Error(`Failed to fetch folders: ${error.message}`);
    }
  }

  // ====================================================================
  // SEARCH API
  // ====================================================================

  async searchKnowledgeItems(userId, searchOptions = {}) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('🔍 Searching knowledge items via API:', { userId, searchOptions });

    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge/search?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(searchOptions)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to search knowledge items');
      }

      console.log(`✅ Found ${result.data?.length || 0} search results for user ${userId}`);

      return result;

    } catch (error) {
      console.error('Error searching knowledge items:', error);
      throw new Error(`Failed to search knowledge items: ${error.message}`);
    }
  }

  // ====================================================================
  // ANALYTICS & INSIGHTS
  // ====================================================================

  async getKnowledgeAnalytics(userId, timeframe = '30d') {
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('📊 Fetching knowledge analytics:', { userId, timeframe });

    try {
      // For now, compute basic analytics from existing data
      const itemsResponse = await this.getUserKnowledgeItems(userId, { limit: 1000 });

      if (!itemsResponse.success) {
        throw new Error('Failed to fetch items for analytics');
      }

      const items = itemsResponse.data || [];
      const now = new Date();
      let cutoffDate;

      switch (timeframe) {
        case '7d':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const recentItems = items.filter(item => new Date(item.created_at) >= cutoffDate);

      const analytics = {
        totalItems: items.length,
        recentItems: recentItems.length,
        itemsByType: {},
        itemsByWeek: {},
        averageWordCount: 0,
        totalWordCount: 0
      };

      // Calculate type breakdown
      items.forEach(item => {
        const type = item.item_type || 'unknown';
        analytics.itemsByType[type] = (analytics.itemsByType[type] || 0) + 1;

        if (item.word_count) {
          analytics.totalWordCount += item.word_count;
        }
      });

      if (items.length > 0) {
        analytics.averageWordCount = Math.round(analytics.totalWordCount / items.length);
      }

      return { success: true, data: analytics };

    } catch (error) {
      console.error('Error fetching knowledge analytics:', error);
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
  }
}

// Export singleton instance
export default new KnowledgeGardenService();