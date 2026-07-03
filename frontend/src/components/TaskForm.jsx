import React, { useState, useEffect } from 'react';

const TaskForm = ({ task, onSubmit, onClose, currentUser, isSaving = false }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isEditMode = !!task;

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'PENDING');
      setAssignedUserId(task.userId || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('PENDING');
      setAssignedUserId('');
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Task Title is required.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
    };

    // If admin is creating or editing, they can assign or override the owner ID
    if (currentUser?.role === 'ADMIN' && assignedUserId.trim()) {
      payload.userId = assignedUserId.trim();
    }

    onSubmit(payload);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h3 className="modal-title">{isEditMode ? 'Modify Task Details' : 'Create New Task'}</h3>
          <button className="modal-close" onClick={onClose} disabled={isSaving}>&times;</button>
        </div>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              placeholder="Enter task name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSaving}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              className="form-input"
              rows="4"
              placeholder="Provide a detailed task description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
              disabled={isSaving}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-status">Status</label>
            <select
              id="task-status"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isSaving}
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {currentUser?.role === 'ADMIN' && (
            <div className="form-group">
              <label className="form-label" htmlFor="task-userid">
                Owner User ID (Admin Override - UUID Format)
              </label>
              <input
                id="task-userid"
                type="text"
                className="form-input"
                placeholder={task?.userId || "Leave empty for self assignment"}
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                disabled={isSaving}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Optionally specify target user's database ID.
              </span>
            </div>
          )}

          <div className="modal-buttons">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {isSaving && (
                <span className="spinner" style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
              )}
              <span>{isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Task')}</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TaskForm;
