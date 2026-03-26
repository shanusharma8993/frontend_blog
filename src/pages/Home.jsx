import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import BlogCard from '../components/BlogCard';

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/blogs')
      .then((res) => setBlogs(res.data))
      .catch(() => setError('Failed to load blogs. Make sure the server is running.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading blogs...</div>;

  return (
    <div className="home">
      <div className="home-header">
        <div>
          <h1>Latest Blogs</h1>
          <p className="home-subtitle">Discover stories, ideas, and insights</p>
        </div>
        <Link to="/create" className="btn btn-primary">
          + Write a Blog
        </Link>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {!error && blogs.length === 0 ? (
        <div className="empty-state">
          <h3>No blogs yet</h3>
          <p>Be the first to share your story!</p>
          <Link to="/create" className="btn btn-primary">
            Write First Blog
          </Link>
        </div>
      ) : (
        <div className="blog-grid">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}
