
import React, { useState } from 'react';
import { Post, Category } from '../types';

interface PostCardProps {
  post: Post;
  isSeen: boolean;
  isOwnPost: boolean;
  onMarkAsSeen: (id: string) => void;
  onMarkAsSolved: (id: string) => void;
  onAddReply: (postId: string, content: string) => void;
}

const CategoryBadge: React.FC<{ category: Category }> = ({ category }) => {
  const styles: Record<Category, string> = {
    [Category.SAFETY]: 'bg-red-100 text-red-700 border-red-200',
    [Category.URGENT]: 'bg-orange-100 text-orange-700 border-orange-200',
    [Category.GIVEAWAY]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [Category.SOCIAL_IMPACT]: 'bg-blue-100 text-blue-700 border-blue-200',
    [Category.GENERAL]: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[category]}`}>
      {category}
    </span>
  );
};

const PostCard: React.FC<PostCardProps> = ({ post, isSeen, isOwnPost, onMarkAsSeen, onMarkAsSolved, onAddReply }) => {
  const [replyText, setReplyText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onAddReply(post.id, replyText);
    setReplyText('');
  };

  const handleCardClick = () => {
    if (!isSeen) onMarkAsSeen(post.id);
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md overflow-hidden ${
        post.isSolved ? 'opacity-75 grayscale-[0.2]' : ''
      } ${
        !isSeen && !post.isSolved ? 'border-indigo-400 border-2' : 'border-gray-100'
      }`}
    >
      {post.isSolved && (
        <div className="bg-purple-600 text-white px-5 py-2 flex items-center justify-center space-x-2 font-bold text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Solved — Thank you community!</span>
        </div>
      )}

      <div className="p-5 cursor-pointer" onClick={handleCardClick}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <CategoryBadge category={post.category} />
            {!isSeen && !post.isSolved && (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                <span>New</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {isOwnPost && !post.isSolved && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsSolved(post.id);
                }}
                className="text-[10px] font-bold text-purple-600 border border-purple-200 bg-purple-50 px-2 py-1 rounded-lg hover:bg-purple-600 hover:text-white transition-all"
              >
                Mark Solved
              </button>
            )}
            <span className="text-xs text-gray-400 font-medium">
              {new Date(post.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>

        <p className={`text-gray-800 text-lg leading-relaxed mb-4 ${post.isSolved ? 'line-through decoration-purple-200' : ''}`}>
          {post.content}
        </p>

        {post.media && (
          <div className="mb-4 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 aspect-video">
            {post.media.type === 'image' ? (
              <img src={post.media.url} alt="Post content" className="w-full h-full object-cover" />
            ) : (
              <video src={post.media.url} controls className="w-full h-full object-cover" />
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-indigo-600">@{post.authorAlias} {isOwnPost && '(You)'}</span>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.replies.length} replies</span>
            </div>
          </div>
          
          {post.location && (
            <div className="flex items-center text-indigo-600 hover:underline">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs truncate max-w-[120px]">
                {post.location.address || `${post.location.lat.toFixed(4)}, ${post.location.lng.toFixed(4)}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="bg-gray-50 px-5 pb-5 rounded-b-2xl border-t border-gray-100">
          <div className="space-y-4 pt-4">
            {post.replies.length > 0 ? (
              post.replies.map((reply) => (
                <div key={reply.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-indigo-600">@{reply.author}</span>
                    <span className="text-[10px] text-gray-400">{new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm text-gray-700">{reply.content}</p>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-xs text-gray-400 font-medium italic">No replies yet. Be the first to help!</p>
            )}

            {!post.isSolved && (
              <form onSubmit={handleSubmitReply} className="mt-4 flex space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
