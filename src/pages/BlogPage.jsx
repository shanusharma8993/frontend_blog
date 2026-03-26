import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import LikeDislike from '../components/LikeDislike';
import CommentSection from '../components/CommentSection';

export default function BlogPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/blogs/${id}`)
      .then((res) => setBlog(res.data))
      .catch(() => setError('Blog not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('join_blog', id);

    socket.on('new_comment', (comment) => {
      setBlog((prev) => {
        if (!prev) return prev;
        if (comment.parentId) {
          return {
            ...prev,
            comments: addReplyToComments(prev.comments, comment),
          };
        }
        return { ...prev, comments: [...prev.comments, comment] };
      });
    });

    socket.on('update_comment', (updated) => {
      setBlog((prev) => {
        if (!prev) return prev;
        return { ...prev, comments: updateCommentInList(prev.comments, updated) };
      });
    });

    socket.on('delete_comment', ({ id: commentId }) => {
      setBlog((prev) => {
        if (!prev) return prev;
        return { ...prev, comments: deleteCommentFromList(prev.comments, commentId) };
      });
    });

    socket.on('blog_like_update', ({ blogId, likes }) => {
      if (parseInt(blogId) === parseInt(id)) {
        setBlog((prev) => (prev ? { ...prev, likes } : prev));
      }
    });

    socket.on('comment_like_update', ({ commentId, likes }) => {
      setBlog((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: updateCommentLikes(prev.comments, commentId, likes),
        };
      });
    });

    return () => {
      socket.emit('leave_blog', id);
      socket.off('new_comment');
      socket.off('update_comment');
      socket.off('delete_comment');
      socket.off('blog_like_update');
      socket.off('comment_like_update');
    };
  }, [socket, id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await api.delete(`/blogs/${id}`);
      navigate('/');
    } catch {
      alert('Failed to delete blog');
    }
  };

  if (loading) return <div className="loading">Loading blog...</div>;
  if (error || !blog) return <div className="error-page">{error || 'Blog not found'}</div>;

  const likeCount = blog.likes?.filter((l) => l.type === 'LIKE').length || 0;
  const dislikeCount = blog.likes?.filter((l) => l.type === 'DISLIKE').length || 0;
  const userLike = user ? blog.likes?.find((l) => l.userId === user.id) : null;

  return (
    <div className="blog-page">
      <article className="blog-article">
        <header className="blog-header">
          <h1>{blog.title}</h1>
          <div className="blog-meta">
            <span className="blog-author">By {blog.author.username}</span>
            <span className="blog-date">
              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {user?.id === blog.authorId && (
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                Delete Blog
              </button>
            )}
          </div>
        </header>

        <div className="blog-body">
          {blog.content.split('\n').map((para, i) =>
            para.trim() ? <p key={i}>{para}</p> : <br key={i} />
          )}
        </div>

        <LikeDislike
          type="blog"
          targetId={blog.id}
          likeCount={likeCount}
          dislikeCount={dislikeCount}
          userLike={userLike}
        />
      </article>

      <CommentSection blogId={blog.id} comments={blog.comments || []} />
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function addReplyToComments(comments, reply) {
  return comments.map((c) => {
    if (c.id === reply.parentId) {
      return { ...c, replies: [...(c.replies || []), reply] };
    }
    if (c.replies?.length) {
      return { ...c, replies: addReplyToComments(c.replies, reply) };
    }
    return c;
  });
}

function updateCommentInList(comments, updated) {
  return comments.map((c) => {
    if (c.id === updated.id) return { ...c, ...updated };
    if (c.replies?.length) return { ...c, replies: updateCommentInList(c.replies, updated) };
    return c;
  });
}

function deleteCommentFromList(comments, id) {
  return comments
    .filter((c) => c.id !== id)
    .map((c) =>
      c.replies?.length ? { ...c, replies: deleteCommentFromList(c.replies, id) } : c
    );
}

function updateCommentLikes(comments, commentId, likes) {
  return comments.map((c) => {
    if (c.id === commentId) return { ...c, likes };
    if (c.replies?.length)
      return { ...c, replies: updateCommentLikes(c.replies, commentId, likes) };
    return c;
  });
}
