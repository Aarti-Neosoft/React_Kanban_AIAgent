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

    // Accept immutable comment updates from a parent without syncing on every render.
    useEffect(() => {
        const nextComments = getComments(task);
        commentsRef.current = nextComments;
        setComments(nextComments);
    }, [task?.comments]);

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
        <section style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
            <h4>Task Activity (Session: {secondsActive}s)</h4>

            {comments.length === 0 ? (
                <p>No activity yet.</p>
            ) : (
                <div>
                    {comments.map((comment) => (
                        <div key={comment.id} style={{ marginBottom: '6px' }}>
                            <span>{comment.timestamp}: </span>
                            <span>{comment.text}</span>
                        </div>
                    ))}
                </div>
            )}

            <input
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Add note..."
                aria-label="Add a task note"
            />
            <button type="button" onClick={handleAddComment}>
                Post
            </button>
        </section>
    );
}
