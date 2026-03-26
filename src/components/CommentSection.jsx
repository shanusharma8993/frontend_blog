import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Comment from './Comment';

export default function CommentSection({ blogId, comments }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.post(`/comments/blog/${blogId}`, { content });
      setContent('');
    } catch {
      setError('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="comment-section">
      <h3 className="comment-section-title">
        {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            required
          />
          {error && <div className="alert alert-error">{error}</div>}
          <div className="comment-form-footer">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="login-prompt">
          <a href="/login">Sign in</a> to join the conversation
        </div>
      )}

      <div className="comments-list">
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} blogId={blogId} depth={0} />
        ))}
      </div>
    </section>
  );
}
