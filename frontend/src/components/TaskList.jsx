import React from 'react';

const TaskList = ({ tasks, onEdit, onDelete, currentUser }) => {
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'task-badge completed';
      case 'IN_PROGRESS':
        return 'task-badge in_progress';
      case 'PENDING':
      default:
        return 'task-badge pending';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'PENDING':
      default:
        return 'Pending';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="empty-state glass-card">
        <div className="empty-icon">📁</div>
        <h3>No Tasks Found</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Create a new task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="tasks-grid">
      {tasks.map((task) => {
        // Enforce visible feedback on edit/delete actions depending on user role or ownership
        const isOwner = task.userId === currentUser?.id;
        const isAdmin = currentUser?.role === 'ADMIN';
        const canManage = isOwner || isAdmin;

        return (
          <div key={task.id} className="task-card glass-card">
            <div className="task-header">
              <h3 className="task-title">{task.title}</h3>
              <span className={getStatusBadgeClass(task.status)}>
                {getStatusLabel(task.status)}
              </span>
            </div>
            
            <p className="task-desc">
              {task.description || 'No description provided.'}
            </p>

            <div className="task-footer">
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem' }}>Assigned To</span>
                <span className="task-owner-email" title={task.user?.email || currentUser?.email}>
                  {task.user?.email || currentUser?.email}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.725rem', marginBottom: '8px' }}>
                  {formatDate(task.createdAt)}
                </span>
                
                {canManage && (
                  <div className="task-actions">
                    <button
                      onClick={() => onEdit(task)}
                      className="btn btn-secondary btn-sm"
                      title="Edit Task"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="btn btn-danger btn-sm"
                      title="Delete Task"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
