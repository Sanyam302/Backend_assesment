import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';
import { tasksAPI } from '../services/api';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [alert, setAlert] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    page: 1,
    limit: 10,
  });

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  // 🔥 FIXED fetch
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      );

      const { data } = await tasksAPI.list(params);

      // ✅ handle both response types safely
      const tasksData = data.data || data;

      setTasks(tasksData);
      setMeta(data.meta || {});
    } catch (err) {
      console.log("Fetch error:", err);
      showAlert('Failed to load tasks.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ✅ SAVE (create/update)
  const handleSave = async (payload) => {
    try {
      if (modal && typeof modal === 'object') {
        await tasksAPI.update(modal._id, payload);
        showAlert('Task updated.');
      } else {
        await tasksAPI.create(payload);
        showAlert('Task created.');
      }

      setModal(null);
      fetchTasks();
    } catch {
      showAlert('Operation failed.', 'error');
    }
  };

  // ✅ DELETE FIXED (_id)
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

  // 📊 stats
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
          {[
            ['Total', tasks.length],
            ['Pending', statusCounts.pending || 0],
            ['In Progress', statusCounts.in_progress || 0],
            ['Done', statusCounts.completed || 0],
          ].map(([label, value]) => (
            <div className="stat-card" key={label}>
              <div className="label">{label}</div>
              <div className="value">{value}</div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="page-header">
          <h2 className="page-title">My Tasks</h2>
          <button className="btn btn-primary" onClick={() => setModal('create')}>
            + New Task
          </button>
        </div>

        {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

        {/* Filters */}
        <div className="filters">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))
            }
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters((p) => ({ ...p, priority: e.target.value, page: 1 }))
            }
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() =>
              setFilters({ status: '', priority: '', page: 1, limit: 10 })
            }
          >
            Reset
          </button>
        </div>

        {/* Task List */}
        {loading ? (
          <div style={{ display: 'grid', placeItems: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty">No tasks found.</div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div className="task-card" key={task._id}>
                <div className="task-body">
                  <div className="task-title">{task.title}</div>

                  <div className="task-meta">
                    <span className={`badge badge-${task.status}`}>
                      {task.status}
                    </span>
                    <span className={`badge badge-${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>

                  {task.description && (
                    <div className="task-desc">{task.description}</div>
                  )}
                </div>

                <div className="task-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setModal(task)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(task._id)} // ✅ FIXED
                  >
                    Del
                  </button>
                </div>
              </div>
            ))}
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