// Blog post detail page component
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Tag,
  ArrowLeft,
  Star,
  Share2,
  Mail,
  ExternalLink,
  User
} from 'lucide-react';
import blogService from '../services/blogService';
import PublicBlogLayout from '../components/PublicBlogLayout';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      const postData = await blogService.getPostBySlug(slug);
      if (postData) {
        setPost(postData);
        // Get related posts by tags
        if (postData.tags && postData.tags.length > 0) {
          const related = await blogService.getPostsByTag(postData.tags[0]);
          setRelatedPosts(related.filter(p => p.id !== postData.id).slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Could show a toast notification here
    }
  };

  const handleEmailSignup = () => {
    window.open('https://reflectionary.kit.com/blog', '_blank');
  };

  // Convert markdown-like content to JSX (basic implementation)
  const renderContent = (content) => {
    return content.split('\n\n').map((paragraph, index) => {
      // Handle headers
      if (paragraph.startsWith('# ')) {
        return (
          <h1 key={index} className="text-3xl font-bold text-white mb-6">
            {paragraph.replace('# ', '')}
          </h1>
        );
      }
      if (paragraph.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold text-white mb-4 mt-8">
            {paragraph.replace('## ', '')}
          </h2>
        );
      }
      if (paragraph.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-bold text-white mb-3 mt-6">
            {paragraph.replace('### ', '')}
          </h3>
        );
      }
      
      // Handle lists
      if (paragraph.includes('\n- ')) {
        const items = paragraph.split('\n- ').filter(item => item.trim());
        return (
          <ul key={index} className="list-disc list-inside text-gray-300 mb-6 space-y-2">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="ml-4">
                {item.replace(/^- /, '')}
              </li>
            ))}
          </ul>
        );
      }

      // Handle code blocks (basic)
      if (paragraph.startsWith('```')) {
        const code = paragraph.replace(/```\w*\n?/g, '').replace(/\n```$/, '');
        return (
          <pre key={index} className="bg-slate-800/50 border border-white/10 rounded-lg p-4 mb-6 overflow-x-auto">
            <code className="text-green-300 text-sm">
              {code}
            </code>
          </pre>
        );
      }
      
      // Handle links [text](url)
      let processedParagraph = paragraph
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-300 hover:text-purple-200 underline decoration-purple-300/50 hover:decoration-purple-200 transition-colors">$1</a>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="text-purple-200">$1</em>');
      
      // Regular paragraphs
      if (paragraph.trim()) {
        return (
          <p 
            key={index} 
            className="text-gray-300 mb-6 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: processedParagraph }}
          />
        );
      }
      
      return null;
    });
  };

  if (loading) {
    return (
      <PublicBlogLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-purple-200">Loading article...</p>
          </div>
        </div>
      </PublicBlogLayout>
    );
  }

  if (!post) {
    return (
      <PublicBlogLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Article Not Found</h1>
            <p className="text-gray-300 mb-6">The article you're looking for doesn't exist.</p>
            <Link
              to="/blog"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </PublicBlogLayout>
    );
  }

  return (
    <PublicBlogLayout>
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {post.featured && (
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-yellow-400 p-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-900" />
              </div>
              <span className="text-sm font-medium text-yellow-400">Featured Article</span>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium text-purple-300">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{blogService.formatDate(post.publishedDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-300 hover:text-purple-300 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-sm border border-purple-400/30 flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-lg p-8 md:p-12 mb-12">
          <div className="prose prose-lg max-w-none">
            {renderContent(post.content)}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30 shadow-lg p-8 mb-12 text-center">
          <Mail className="w-8 h-8 text-purple-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-3">
            Loved this article?
          </h3>
          <p className="text-purple-200 mb-6">
            Get more insights on consciousness evolution delivered to your inbox weekly.
          </p>
          <button
            onClick={handleEmailSignup}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium inline-flex items-center gap-2"
          >
            Subscribe to Updates
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-lg hover:bg-white/15 hover:border-purple-400/50 transition-all duration-300 p-6"
                >
                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-purple-200 transition-colors line-clamp-2">
                    {relatedPost.title}
                  </h4>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{blogService.formatDate(relatedPost.publishedDate)}</span>
                    <span>{relatedPost.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div className="text-center">
          <Link
            to="/blog"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Articles
          </Link>
        </div>
      </div>
    </div>
    </PublicBlogLayout>
  );
}