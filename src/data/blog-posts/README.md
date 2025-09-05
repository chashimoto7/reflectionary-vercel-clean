# Blog Posts

This directory contains the blog posts for the Reflectionary website. Each post is stored as a JSON file and automatically loaded by the blog system.

## Adding New Blog Posts

1. Create a new JSON file in this directory with a descriptive filename (e.g., `new-post-title.json`)
2. Use the following structure:

```json
{
  "id": "unique-post-id",
  "title": "Your Post Title",
  "slug": "url-friendly-slug",
  "excerpt": "A brief summary of the post (shown in listings)",
  "content": "The full post content in markdown format...",
  "author": "Author Name",
  "publishedDate": "YYYY-MM-DD",
  "tags": ["tag1", "tag2", "tag3"],
  "readTime": "X min read",
  "featured": false,
  "image": "/images/blog/optional-image.jpg"
}
```

## Content Format

- The `content` field supports basic markdown:
  - `# ` for H1 headings
  - `## ` for H2 headings  
  - `### ` for H3 headings
  - `- ` for bullet lists
  - `**bold**` for bold text
  - `*italic*` for italic text
  - Code blocks with triple backticks
  - Regular paragraphs separated by double newlines

## Automatic Features

- Posts are automatically sorted by publication date (newest first)
- Featured posts appear in the featured section
- Tags enable filtering and related post suggestions
- Email signup links redirect to: https://reflectionary.kit.com/blog
- All posts are automatically loaded when the blog page loads

## Images

- Store blog images in `/public/images/blog/`
- Reference them in the JSON with `/images/blog/filename.jpg`
- Images are optional but recommended for better visual appeal

## Tips

- Keep excerpts under 200 characters for best display
- Use 3-5 relevant tags per post
- Set `featured: true` for your best content
- The reading time is automatically calculated if not provided
- Posts with the same tags will be suggested as related content