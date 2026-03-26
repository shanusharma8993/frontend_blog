import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LikeDislike({ type, targetId, likeCount, dislikeCount, userLike }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleVote = async (voteType) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const endpoint =
        type === 'blog' ? `/likes/blog/${targetId}` : `/likes/comment/${targetId}`;
      await api.post(endpoint, { type: voteType });
    } catch (err) {
      console.error('Vote failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="like-dislike">
      <button
        className={`vote-btn like-btn ${userLike?.type === 'LIKE' ? 'active' : ''}`}
        onClick={() => handleVote('LIKE')}
        disabled={loading}
        title="Like"
      >
        👍 <span>{likeCount}</span>
      </button>
      <button
        className={`vote-btn dislike-btn ${userLike?.type === 'DISLIKE' ? 'active' : ''}`}
        onClick={() => handleVote('DISLIKE')}
        disabled={loading}
        title="Dislike"
      >
        👎 <span>{dislikeCount}</span>
      </button>
    </div>
  );
}
