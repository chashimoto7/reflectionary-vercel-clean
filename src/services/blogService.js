// Blog service for loading and managing blog posts
class BlogService {
  constructor() {
    this.posts = [];
    this.loaded = false;
  }

  // Import all blog post JSON files
  async loadBlogPosts() {
    if (this.loaded) return this.posts;

    try {
      // Use Vite's import.meta.glob to dynamically import all JSON files
      const postModules = import.meta.glob('../data/blog-posts/*.json');
      const posts = [];

      for (const path in postModules) {
        const module = await postModules[path]();
        posts.push(module.default);
      }

      // Sort by published date (newest first)
      this.posts = posts.sort((a, b) => 
        new Date(b.publishedDate) - new Date(a.publishedDate)
      );

      this.loaded = true;
      return this.posts;
    } catch (error) {
      console.error('Error loading blog posts:', error);
      return [];
    }
  }

  // Get all posts
  async getAllPosts() {
    return await this.loadBlogPosts();
  }

  // Get featured posts
  async getFeaturedPosts() {
    const posts = await this.loadBlogPosts();
    return posts.filter(post => post.featured);
  }

  // Get post by slug
  async getPostBySlug(slug) {
    const posts = await this.loadBlogPosts();
    return posts.find(post => post.slug === slug);
  }

  // Get posts by tag
  async getPostsByTag(tag) {
    const posts = await this.loadBlogPosts();
    return posts.filter(post => 
      post.tags && post.tags.includes(tag)
    );
  }

  // Get recent posts
  async getRecentPosts(limit = 5) {
    const posts = await this.loadBlogPosts();
    return posts.slice(0, limit);
  }

  // Get all unique tags
  async getAllTags() {
    const posts = await this.loadBlogPosts();
    const tagSet = new Set();
    
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => tagSet.add(tag));
      }
    });

    return Array.from(tagSet).sort();
  }

  // Format published date
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Calculate reading time estimate
  calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  }
}

// Export singleton instance
export const blogService = new BlogService();
export default blogService;