import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LikeDislike from './LikeDislike';

const MAX_DEPTH = 4;

export default function Comment({ comment, blogId, depth }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const likeCount = comment.likes?.filter((l) => l.type === 'LIKE').length || 0;
  const dislikeCount = comment.likes?.filter((l) => l.type === 'DISLIKE').length || 0;
  const userLike = user ? comment.likes?.find((l) => l.userId === user.id) : null;

  const handleReply = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!replyContent.trim()) return;
    setReplyLoading(true);
    try {
      await api.post(`/comments/blog/${blogId}`, {
        content: replyContent,
        parentId: comment.id,
      });
      setReplyContent('');
      setShowReply(false);
    } catch {
      alert('Failed to post reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    try {
      await api.put(`/comments/${comment.id}`, { content: editContent });
      setEditing(false);
    } catch {
      alert('Failed to update comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment and all its replies?')) return;
    try {
      await api.delete(`/comments/${comment.id}`);
    } catch {
      alert('Failed to delete comment');
    }
  };

  const handleReplyClick = () => {
    if (!user) { navigate('/login'); return; }
    setShowReply((v) => !v);
  };

  return (
    <div className={`comment depth-${Math.min(depth, MAX_DEPTH)}`}>
      <div className="comment-avatar">
        {comment.author.username.charAt(0).toUpperCase()}
      </div>
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">{comment.author.username}</span>
          <span className="comment-date">
            {new Date(comment.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        {editing ? (
          <form onSubmit={handleEdit} className="edit-form">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={2}
              autoFocus
            />
            <div className="edit-actions">
              <button type="submit" className="btn btn-primary btn-sm">
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setEditing(false); setEditContent(comment.content); }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="comment-content">{comment.content}</p>
        )}

        <div className="comment-actions">
          <LikeDislike
            type="comment"
            targetId={comment.id}
            likeCount={likeCount}
            dislikeCount={dislikeCount}
            userLike={userLike}
          />
          {depth < MAX_DEPTH && (
            <button className="btn-text" onClick={handleReplyClick}>
              Reply
            </button>
          )}
          {user?.id === comment.authorId && !editing && (
            <>
              <button className="btn-text" onClick={() => setEditing(true)}>
                Edit
              </button>
              <button className="btn-text btn-text-danger" onClick={handleDelete}>
                Delete
              </button>
            </>
          )}
        </div>

        {showReply && (
          <form onSubmit={handleReply} className="reply-form">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Reply to ${comment.author.username}...`}
              rows={2}
              autoFocus
            />
            <div className="reply-actions">
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={replyLoading}
              >
                {replyLoading ? 'Posting...' : 'Post Reply'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowReply(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {comment.replies?.length > 0 && (
          <div className="replies">
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                blogId={blogId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
