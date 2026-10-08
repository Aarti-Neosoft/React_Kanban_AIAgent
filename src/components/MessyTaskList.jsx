import React, { useEffect, useRef, useState } from 'react';

const EMPTY_COMMENTS = [];

const getComments = (task) =>
  Array.isArray(task?.comments) ? task.comments : EMPTY_COMMENTS;

const createCommentId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

/**
 * Displays a task's local activity timeline and reports comment updates when
 * the optional parent callback is provided.
 */
export default function MessyTaskList({ task, onUpdate }) {
  const [comments, setComments] = useState(() => getComments(task));
  const commentsRef = useRef(comments);
  const [text, setText] = useState('');
  const [secondsActive, setSecondsActive] = useState(0);

  // Sync comments when the active task or task comments change.
  useEffect(() => {
    const nextComments = getComments(task);
    commentsRef.current = nextComments;
    setComments(nextComments);
  }, [task?.id, task?.comments]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSecondsActive((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleAddComment = () => {
    const commentText = text.trim();
    if (!commentText) return;

    const newComment = {
      id: createCommentId(),
      text: commentText,
      timestamp: new Date().toLocaleTimeString()
    };

    const updatedComments = [...commentsRef.current, newComment];
    commentsRef.current = updatedComments;
    setComments(updatedComments);

    if (task?.id != null && typeof onUpdate === 'function') {
      onUpdate(task.id, {
        comments: updatedComments,
        commentCount: updatedComments.length
      });
    }
    setText('');
  };

  return (
    <section className="messy-task-list" aria-label="Task Activity and Notes">
      <div className="messy-task-list__header">
        <h4 className="messy-task-list__title">
          Activity Timeline {task?.title ? `— ${task.title}` : ''}
        </h4>
        <span className="messy-task-list__timer" aria-label={`Session active: ${secondsActive} seconds`}>
          Session: {secondsActive}s
        </span>
      </div>

      {comments.length === 0 ? (
        <p className="messy-task-list__empty">No activity yet. Add a note below.</p>
      ) : (
        <div className="messy-task-list__comments" role="log" aria-label="Task notes history">
          {comments.map((comment) => (
            <div key={comment.id} className="messy-task-list__comment-item">
              <span className="messy-task-list__timestamp">{comment.timestamp}</span>
              <span className="messy-task-list__text">{comment.text}</span>
            </div>
          ))}
        </div>
      )}

      <div className="messy-task-list__input-row">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddComment();
            }
          }}
          placeholder={task ? `Add note for "${task.title}"...` : 'Add note...'}
          aria-label="Add a task note"
          className="form-input messy-task-list__input"
          disabled={!task}
        />
        <button
          type="button"
          onClick={handleAddComment}
          className="btn btn--primary messy-task-list__button"
          disabled={!task || !text.trim()}
        >
          Post Note
        </button>
      </div>
    </section>
  );
}
