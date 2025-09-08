// src/services/KnowledgeGardenService.js
import { supabase } from '../lib/supabase';
import encryptionService from './encryptionService';

class KnowledgeGardenService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // ================================
  // KNOWLEDGE ITEMS CRUD OPERATIONS
  // ================================

  async createKnowledgeItem(userId, itemData) {
    try {
      // Validate required fields
      if (!itemData.title || !itemData.item_type) {
        throw new Error('Title and item type are required');
      }

      // Generate content hash for duplicate detection
      const contentHash = await this.generateContentHash(itemData.content || '');

      // Check for duplicates
      const { data: existingItems } = await supabase
        .from('knowledge_items')
        .select('id')
        .eq('user_id', userId)
        .eq('content_hash', contentHash);

      if (existingItems && existingItems.length > 0) {
        throw new Error('Similar content already exists in your garden');
      }

      // Encrypt the content
      const masterKey = await encryptionService.getStaticMasterKey();
      const dataKey = await encryptionService.generateDataKey();
      
      // Encrypt the data key with master key
      const encryptedKeyData = await encryptionService.encryptKey(dataKey, masterKey);
      
      // Prepare content for encryption
      const contentToEncrypt = JSON.stringify({
        content: itemData.content || '',
        rawContent: itemData.rawContent || '',
        metadata: itemData.metadata || {}
      });

      // Encrypt the content with data key
      const encryptedContent = await encryptionService.encryptText(contentToEncrypt, dataKey);

      // Calculate reading time and word count
      const wordCount = this.calculateWordCount(itemData.content || '');
      const readingTime = Math.ceil(wordCount / 200); // 200 WPM average

      // Prepare database record
      const knowledgeItem = {
        user_id: userId,
        title: itemData.title,
        item_type: itemData.item_type,
        source_type: itemData.source_type || 'user_created',
        
        // Encrypted data
        encrypted_data_key: encryptedKeyData.encryptedData,
        data_key_iv: encryptedKeyData.iv,
        encrypted_data: encryptedContent.encryptedData,
        data_iv: encryptedContent.iv,
        
        // Organization
        folder_id: itemData.folder_id || null,
        
        // Metadata
        content_hash: contentHash,
        word_count: wordCount,
        reading_time_minutes: readingTime,
        difficulty_level: itemData.difficulty_level || null,
        ai_summary: itemData.ai_summary || null,
        ai_insights: itemData.ai_insights || null,
        
        // Source information
        source_url: itemData.source_url || null,
        source_author: itemData.source_author || null,
        source_published_date: itemData.source_published_date || null,
        
        // User interaction
        user_rating: itemData.user_rating || null,
        user_notes: itemData.user_notes || null,
        times_accessed: 0,
        last_accessed_at: null,
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_archived: false
      };

      // Insert into database
      const { data, error } = await supabase
        .from('knowledge_items')
        .insert([knowledgeItem])
        .select()
        .single();

      if (error) {
        console.error('Database error creating knowledge item:', error);
        throw new Error(`Failed to create knowledge item: ${error.message}`);
      }

      // Handle tags if provided
      if (itemData.tags && itemData.tags.length > 0) {
        await this.addTagsToItem(data.id, userId, itemData.tags);
      }

      // Clear cache
      this.clearUserCache(userId);

      return { success: true, data };
    } catch (error) {
      console.error('Error creating knowledge item:', error);
      throw error;
    }
  }

  async getUserKnowledgeItems(userId, filters = {}) {
    try {
      const cacheKey = `user_items_${userId}_${JSON.stringify(filters)}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      let query = supabase
        .from('knowledge_items')
        .select(`
          *,
          knowledge_item_tags (
            tag_id,
            knowledge_tags (
              id,
              name,
              color
            )
          )
        `)
        .eq('user_id', userId)
        .eq('is_archived', false);

      // Apply filters
      if (filters.item_type) {
        query = query.eq('item_type', filters.item_type);
      }
      if (filters.folder_id) {
        query = query.eq('folder_id', filters.folder_id);
      }
      if (filters.has_connections) {
        // This would need a more complex query with joins
      }

      // Apply sorting
      const sortBy = filters.sort_by || 'created_at';
      const sortOrder = filters.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database error fetching knowledge items:', error);
        throw new Error(`Failed to fetch knowledge items: ${error.message}`);
      }

      // Decrypt the content for each item
      const masterKey = await encryptionService.getStaticMasterKey();
      const decryptedItems = await Promise.all(
        data.map(async (item) => {
          try {
            // Decrypt the data key
            const dataKey = await encryptionService.decryptKey({
              encryptedData: item.encrypted_data_key,
              iv: item.data_key_iv
            }, masterKey);

            // Decrypt the content
            const decryptedContentJson = await encryptionService.decryptText(
              item.encrypted_data,
              item.data_iv,
              dataKey
            );

            const decryptedContent = JSON.parse(decryptedContentJson);

            // Return item with decrypted content
            return {
              ...item,
              content: decryptedContent.content,
              rawContent: decryptedContent.rawContent,
              metadata: decryptedContent.metadata,
              tags: item.knowledge_item_tags.map(tag => tag.knowledge_tags),
              // Remove encrypted fields from response
              encrypted_data_key: undefined,
              data_key_iv: undefined,
              encrypted_data: undefined,
              data_iv: undefined
            };
          } catch (decryptError) {
            console.error(`Error decrypting item ${item.id}:`, decryptError);
            // Return item with error indicator
            return {
              ...item,
              content: '[Decryption Error]',
              rawContent: '',
              metadata: {},
              tags: [],
              decryptionError: true
            };
          }
        })
      );

      // Cache the result
      this.cache.set(cacheKey, {
        data: { success: true, data: decryptedItems },
        timestamp: Date.now()
      });

      return { success: true, data: decryptedItems };
    } catch (error) {
      console.error('Error fetching user knowledge items:', error);
      throw error;
    }
  }

  async updateKnowledgeItem(itemId, userId, updates) {
    try {
      // First verify ownership
      const { data: existing, error: fetchError } = await supabase
        .from('knowledge_items')
        .select('*')
        .eq('id', itemId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !existing) {
        throw new Error('Knowledge item not found or access denied');
      }

      const updateData = { updated_at: new Date().toISOString() };

      // Handle content updates (requires re-encryption)
      if (updates.content !== undefined || updates.rawContent !== undefined || updates.metadata !== undefined) {
        const masterKey = await encryptionService.getStaticMasterKey();
        
        // Decrypt existing content to merge with updates
        const existingDataKey = await encryptionService.decryptKey({
          encryptedData: existing.encrypted_data_key,
          iv: existing.data_key_iv
        }, masterKey);

        const existingDecryptedJson = await encryptionService.decryptText(
          existing.encrypted_data,
          existing.data_iv,
          existingDataKey
        );

        const existingContent = JSON.parse(existingDecryptedJson);

        // Merge updates with existing content
        const newContent = {
          content: updates.content !== undefined ? updates.content : existingContent.content,
          rawContent: updates.rawContent !== undefined ? updates.rawContent : existingContent.rawContent,
          metadata: updates.metadata !== undefined ? { ...existingContent.metadata, ...updates.metadata } : existingContent.metadata
        };

        // Generate new data key and encrypt
        const newDataKey = await encryptionService.generateDataKey();
        const encryptedKeyData = await encryptionService.encryptKey(newDataKey, masterKey);
        const encryptedContent = await encryptionService.encryptText(JSON.stringify(newContent), newDataKey);

        // Update encrypted fields
        updateData.encrypted_data_key = encryptedKeyData.encryptedData;
        updateData.data_key_iv = encryptedKeyData.iv;
        updateData.encrypted_data = encryptedContent.encryptedData;
        updateData.data_iv = encryptedContent.iv;

        // Update content-related metadata
        if (updates.content !== undefined) {
          updateData.content_hash = await this.generateContentHash(updates.content);
          updateData.word_count = this.calculateWordCount(updates.content);
          updateData.reading_time_minutes = Math.ceil(updateData.word_count / 200);
        }
      }

      // Handle non-encrypted field updates
      const allowedUpdates = [
        'title', 'item_type', 'source_type', 'folder_id', 'difficulty_level',
        'ai_summary', 'ai_insights', 'source_url', 'source_author', 'source_published_date',
        'user_rating', 'user_notes', 'is_archived'
      ];

      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          updateData[field] = updates[field];
        }
      });

      // Update access tracking
      if (updates.accessed) {
        updateData.times_accessed = existing.times_accessed + 1;
        updateData.last_accessed_at = new Date().toISOString();
      }

      // Perform the update
      const { data, error } = await supabase
        .from('knowledge_items')
        .update(updateData)
        .eq('id', itemId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Database error updating knowledge item:', error);
        throw new Error(`Failed to update knowledge item: ${error.message}`);
      }

      // Handle tag updates
      if (updates.tags !== undefined) {
        await this.updateItemTags(itemId, userId, updates.tags);
      }

      // Clear cache
      this.clearUserCache(userId);

      return { success: true, data };
    } catch (error) {
      console.error('Error updating knowledge item:', error);
      throw error;
    }
  }

  async deleteKnowledgeItem(itemId, userId, hardDelete = false) {
    try {
      if (hardDelete) {
        // Hard delete - remove from database
        const { error } = await supabase
          .from('knowledge_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', userId);

        if (error) {
          console.error('Database error deleting knowledge item:', error);
          throw new Error(`Failed to delete knowledge item: ${error.message}`);
        }
      } else {
        // Soft delete - mark as archived
        const { data, error } = await supabase
          .from('knowledge_items')
          .update({ 
            is_archived: true, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', itemId)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          console.error('Database error archiving knowledge item:', error);
          throw new Error(`Failed to archive knowledge item: ${error.message}`);
        }
      }

      // Clear cache
      this.clearUserCache(userId);

      return { success: true };
    } catch (error) {
      console.error('Error deleting knowledge item:', error);
      throw error;
    }
  }

  // ================================
  // FOLDER MANAGEMENT
  // ================================

  async createFolder(userId, folderData) {
    try {
      const folder = {
        user_id: userId,
        name: folderData.name,
        description: folderData.description || null,
        parent_folder_id: folderData.parent_folder_id || null,
        color: folderData.color || '#8B5CF6',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('knowledge_folders')
        .insert([folder])
        .select()
        .single();

      if (error) {
        console.error('Database error creating folder:', error);
        throw new Error(`Failed to create folder: ${error.message}`);
      }

      this.clearUserCache(userId);
      return { success: true, data };
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  async getUserFolders(userId) {
    try {
      const cacheKey = `user_folders_${userId}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const { data, error } = await supabase
        .from('knowledge_folders')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) {
        console.error('Database error fetching folders:', error);
        throw new Error(`Failed to fetch folders: ${error.message}`);
      }

      const result = { success: true, data };
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      return result;
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  }

  // ================================
  // TAG MANAGEMENT
  // ================================

  async createTag(userId, tagName, color = '#8B5CF6') {
    try {
      const tag = {
        user_id: userId,
        name: tagName.toLowerCase().trim(),
        color: color,
        usage_count: 0,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('knowledge_tags')
        .insert([tag])
        .select()
        .single();

      if (error) {
        console.error('Database error creating tag:', error);
        throw new Error(`Failed to create tag: ${error.message}`);
      }

      this.clearUserCache(userId);
      return { success: true, data };
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  }

  async getUserTags(userId) {
    try {
      const cacheKey = `user_tags_${userId}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const { data, error } = await supabase
        .from('knowledge_tags')
        .select('*')
        .eq('user_id', userId)
        .order('usage_count', { ascending: false });

      if (error) {
        console.error('Database error fetching tags:', error);
        throw new Error(`Failed to fetch tags: ${error.message}`);
      }

      const result = { success: true, data };
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      return result;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  async generateContentHash(content) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  calculateWordCount(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  async addTagsToItem(itemId, userId, tagNames) {
    try {
      for (const tagName of tagNames) {
        // Find or create tag
        let { data: existingTag } = await supabase
          .from('knowledge_tags')
          .select('*')
          .eq('user_id', userId)
          .eq('name', tagName.toLowerCase().trim())
          .single();

        if (!existingTag) {
          const tagResult = await this.createTag(userId, tagName);
          existingTag = tagResult.data;
        }

        // Create tag association
        const { error } = await supabase
          .from('knowledge_item_tags')
          .insert([{
            knowledge_item_id: itemId,
            tag_id: existingTag.id,
            created_at: new Date().toISOString()
          }]);

        if (error && error.code !== '23505') { // Ignore duplicate key errors
          console.error('Error adding tag to item:', error);
        }

        // Update tag usage count
        await supabase
          .from('knowledge_tags')
          .update({ usage_count: existingTag.usage_count + 1 })
          .eq('id', existingTag.id);
      }
    } catch (error) {
      console.error('Error adding tags to item:', error);
    }
  }

  async updateItemTags(itemId, userId, newTagNames) {
    try {
      // Remove existing tags
      await supabase
        .from('knowledge_item_tags')
        .delete()
        .eq('knowledge_item_id', itemId);

      // Add new tags
      if (newTagNames && newTagNames.length > 0) {
        await this.addTagsToItem(itemId, userId, newTagNames);
      }
    } catch (error) {
      console.error('Error updating item tags:', error);
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

export default new KnowledgeGardenService();