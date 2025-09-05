// Blog router for handling blog-related routes
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Blog from './Blog';
import BlogPost from './BlogPost';

export default function BlogRouter() {
  return (
    <Routes>
      <Route path="/" element={<Blog />} />
      <Route path="/:slug" element={<BlogPost />} />
      <Route path="*" element={<Navigate to="/blog" replace />} />
    </Routes>
  );
}