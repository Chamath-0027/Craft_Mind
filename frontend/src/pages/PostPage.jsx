import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import CommentList from '../components/CommentList';
import { usePost } from '../hooks/usePost';
import { useAuth } from '../hooks/useAuth';

const PostPage = () => {
  const { postId } = useParams();
  const { post } = usePost(postId);
  const { currentUser } = useAuth();
  const location = useLocation();
  const commentListRef = useRef(null);
  
  useEffect(() => {
    if (location.state?.scrollToComment && commentListRef.current) {
      const commentPosition = location.state.commentPosition;
      const commentElements = commentListRef.current.querySelectorAll('.comment-item');
      
      if (commentElements[commentPosition]) {
        commentElements[commentPosition].scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        
        // Highlight the comment briefly
        commentElements[commentPosition].classList.add('highlight-comment');
        setTimeout(() => {
          commentElements[commentPosition].classList.remove('highlight-comment');
        }, 2000);
      }
    }
  }, [location, post]);

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <div ref={commentListRef}>
        <CommentList postId={postId} userId={currentUser?.id} />
      </div>
    </div>
  );
};

export default PostPage;