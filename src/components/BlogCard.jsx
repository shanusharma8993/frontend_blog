import { Link } from 'react-router-dom';

export default function BlogCard({ blog }) {
  const likeCount = blog.likes?.filter((l) => l.type === 'LIKE').length || 0;
  const dislikeCount = blog.likes?.filter((l) => l.type === 'DISLIKE').length || 0;
  const commentCount = blog._count?.comments || 0;
  const excerpt =
    blog.content.length > 180 ? blog.content.slice(0, 180).trimEnd() + '...' : blog.content;

  return (
    <div className="blog-card">
      <Link to={`/blog/${blog.id}`} className="blog-card-link">
        <h2 className="blog-card-title">{blog.title}</h2>
        <p className="blog-card-excerpt">{excerpt}</p>
      </Link>
      <div className="blog-card-footer">
        <div className="blog-card-author-date">
          <span className="chip">By {blog.author.username}</span>
          <span className="chip">
            {new Date(blog.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="blog-card-stats">
          <span>👍 {likeCount}</span>
          <span>👎 {dislikeCount}</span>
          <span>💬 {commentCount}</span>
        </div>
      </div>
    </div>
  );
}
