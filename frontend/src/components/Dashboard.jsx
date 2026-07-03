import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TaskList from './TaskList';
import TaskForm from './TaskForm';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  
  // Modal configurations
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filter configurations
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Load all tasks from API
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setApiError('');
    try {
      const response = await api.get('/tasks');
      if (response.status === 'success' && response.data?.tasks) {
        setTasks(response.data.tasks);
      }
    } catch (err) {
      setApiError(err.message || 'Failed to load tasks database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle task submissions (Creates & Updates)
  const handleSubmitTask = async (payload) => {
    setApiError('');
    setApiSuccess('');
    try {
      if (editingTask) {
        // Edit flow
        const response = await api.put(`/tasks/${editingTask.id}`, payload);
        if (response.status === 'success') {
          setApiSuccess('Task details modified successfully.');
          fetchTasks();
        }
      } else {
        // Create flow
        const response = await api.post('/tasks', payload);
        if (response.status === 'success') {
          setApiSuccess('Task successfully instantiated.');
          fetchTasks();
        }
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      setApiError(err.message || 'Error occurred while saving task.');
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to permanently delete this task?')) {
      return;
    }
    setApiError('');
    setApiSuccess('');
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      if (response.status === 'success') {
        setApiSuccess('Task successfully removed.');
        fetchTasks();
      }
    } catch (err) {
      setApiError(err.message || 'Error occurred while deleting task.');
    }
  };

  // Open creation modal
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Close form modal
  const handleCloseModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  };

  // Compute metrics statistics
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  // Filter tasks based on selected state
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  return (
    <>
      <header className="app-header">
        <div className="container header-container">
          <div className="app-logo">🛡️ AccessGuard</div>
          <div className="user-profile-badge">
            <div className="user-info-text">
              <div className="user-email">{user?.email}</div>
              <span className={`user-role-tag ${user?.role?.toLowerCase()}`}>
                {user?.role}
              </span>
            </div>
            <button onClick={logout} className="btn btn-secondary btn-sm">
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main container">
        {/* Stats Row Cards */}
        <section className="stats-grid">
          <div className="stat-card total">
            <div className="stat-info">
              <h3>Total Tasks</h3>
              <div className="stat-value">{totalCount}</div>
            </div>
            <div className="stat-icon">📊</div>
          </div>

          <div className="stat-card pending">
            <div className="stat-info">
              <h3>Pending</h3>
              <div className="stat-value">{pendingCount}</div>
            </div>
            <div className="stat-icon">⏳</div>
          </div>

          <div className="stat-card progress">
            <div className="stat-info">
              <h3>In Progress</h3>
              <div className="stat-value">{inProgressCount}</div>
            </div>
            <div className="stat-icon">⚙️</div>
          </div>

          <div className="stat-card completed">
            <div className="stat-info">
              <h3>Completed</h3>
              <div className="stat-value">{completedCount}</div>
            </div>
            <div className="stat-icon">✅</div>
          </div>
        </section>

        {/* Global Feedback Notifications */}
        {apiError && <div className="alert alert-danger">{apiError}</div>}
        {apiSuccess && <div className="alert alert-success">{apiSuccess}</div>}

        {/* Actions Bar (Filter & Add Button) */}
        <section className="dashboard-actions">
          <div>
            <h2 className="section-title">
              {user?.role === 'ADMIN' ? 'All System Tasks (Admin View)' : 'My Assigned Tasks'}
            </h2>
          </div>
          
          <div className="filters-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Only</option>
              <option value="IN_PROGRESS">In Progress Only</option>
              <option value="COMPLETED">Completed Only</option>
            </select>

            <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm">
              ➕ Add New Task
            </button>
          </div>
        </section>

        {/* Tasks display area */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
              Loading task records...
            </span>
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteTask}
            currentUser={user}
          />
        )}
      </main>

      {/* Task Modal Editor */}
      {isModalOpen && (
        <TaskForm
          task={editingTask}
          onSubmit={handleSubmitTask}
          onClose={handleCloseModal}
          currentUser={user}
        />
      )}
    </>
  );
};

export default Dashboard;
