import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';
import { tasksAPI } from '../services/api';

export default function Dashboard() {
  const [tasks,   setTasks]   = useState([]);
  const [meta,    setMeta]    = useState({});
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null); // null | 'create' | task object
  const [alert,   setAlert]   = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '', page: 1, limit: 10 });

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      );
      const { data } = await tasksAPI.list(params);
      setTasks(data.data.tasks);
      setMeta(data.meta || {});
    } catch {
      showAlert('Failed to load tasks.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSave = async (payload) => {
    if (modal && typeof modal === 'object') {
      await tasksAPI.update(modal.id, payload);
      showAlert('Task updated.');
    } else {
      await tasksAPI.create(payload);
      showAlert('Task created.');
    }
    setModal(null);
    fetchTasks();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      showAlert('Task deleted.');
      fetchTasks();
    } catch {
      showAlert('Could not delete task.', 'error');
    }
  };

  const statusCounts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <Navbar />
      <div className="page">
        {/* Stats */}
        <div className="stats-row">
          {[['Total', meta.total || 0], ['Pending', statusCounts.pending || 0],
            ['In Progress', statusCounts.in_progress || 0], ['Done', statusCounts.completed || 0]].map(([label, value]) => (
            <div className="stat-card" key={label}>
              <div className="label">{label}</div>
              <div className="value">{value}</div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="page-header">
          <h2 className="page-title">My Tasks</h2>
          <button className="btn btn-primary" onClick={() => setModal('create')}>+ New Task</button>
        </div>

        {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

        {/* Filters */}
        <div className="filters">
          <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          <select value={filters.priority} onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value, page: 1 }))}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status: '', priority: '', page: 1, limit: 10 })}>
            Reset
          </button>
        </div>

        {/* Task list */}
        {loading ? (
          <div style={{ display: 'grid', placeItems: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty">No tasks found. Create your first one!</div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div className="task-card" key={task.id}>
                <div className="task-body">
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    {task.due_date && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        📅 {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                    {task.tags?.map((tag) => (
                      <span key={tag} style={{ fontSize: '0.75rem', color: 'var(--accent)', background: '#5b6ef510', padding: '1px 6px', borderRadius: '99px' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                  {task.description && <div className="task-desc">{task.description}</div>}
                </div>
                <div className="task-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(task)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.id)}>Del</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.pages > 1 && (
          <div className="pagination">
            <button className="btn btn-ghost btn-sm" disabled={filters.page <= 1} onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}>← Prev</button>
            <span>Page {filters.page} of {meta.pages}</span>
            <button className="btn btn-ghost btn-sm" disabled={filters.page >= meta.pages} onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}>Next →</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <TaskModal
          task={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
