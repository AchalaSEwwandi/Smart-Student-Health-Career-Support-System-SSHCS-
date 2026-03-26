import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import TopRatedWidget from '../../components/TopRatedWidget';
import api from '../../services/api';

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .sd-root {
    font-family: 'Plus Jakarta Sans', sans-serif;
    min-height: 100vh;
    background: #f0f4fa;
  }

  .sd-topbar {
    height: 4px;
    background: linear-gradient(90deg, #1a4ed8 0%, #3b82f6 55%, #93c5fd 100%);
  }

  .sd-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 36px 28px 60px;
  }

  .sd-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #dbe6f5;
  }
  .sd-greeting {
    font-size: 1.7rem;
    font-weight: 800;
    color: #0f1e3d;
    letter-spacing: -0.03em;
    line-height: 1.15;
  }
  .sd-greeting span { color: #1d4ed8; }
  .sd-subtext {
    font-size: 0.85rem;
    color: #6b7a9c;
    margin-top: 4px;
    font-weight: 400;
  }
  .sd-date-badge {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.72rem;
    color: #4b6cb7;
    background: #e8eeff;
    border: 1px solid #c7d8f7;
    padding: 6px 14px;
    border-radius: 6px;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }
  @media (max-width: 600px) { .sd-date-badge { display: none; } }

  .sd-stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 28px;
  }
  @media (max-width: 900px) { .sd-stat-grid { grid-template-columns: repeat(2, 1fr); } }

  .sd-stat {
    background: #fff;
    border: 1px solid #dbe6f5;
    border-radius: 10px;
    padding: 20px 20px 18px;
    position: relative;
    overflow: hidden;
    transition: box-shadow 0.18s, transform 0.18s;
  }
  .sd-stat:hover { box-shadow: 0 4px 20px rgba(29,78,216,0.09); transform: translateY(-2px); }

  .sd-stat-accent {
    position: absolute;
    top: 0; left: 0;
    width: 3px; height: 100%;
    border-radius: 10px 0 0 10px;
  }
  .sd-stat-accent.blue  { background: #1d4ed8; }
  .sd-stat-accent.sky   { background: #0ea5e9; }
  .sd-stat-accent.green { background: #16a34a; }
  .sd-stat-accent.slate { background: #475569; }

  .sd-stat-icon {
    font-size: 1.1rem;
    width: 36px; height: 36px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
  }
  .sd-stat-icon.blue  { background: #dbeafe; }
  .sd-stat-icon.sky   { background: #e0f2fe; }
  .sd-stat-icon.green { background: #dcfce7; }
  .sd-stat-icon.slate { background: #f1f5f9; }

  .sd-stat-value {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 2rem;
    font-weight: 500;
    color: #0f1e3d;
    line-height: 1;
  }
  .sd-stat-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #7b8fb5;
    margin-top: 5px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .sd-main {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 22px;
    align-items: start;
  }
  @media (max-width: 1024px) { .sd-main { grid-template-columns: 1fr; } }
  .sd-left  { display: flex; flex-direction: column; gap: 20px; }
  .sd-right { display: flex; flex-direction: column; gap: 20px; }

  .sd-panel {
    background: #fff;
    border: 1px solid #dbe6f5;
    border-radius: 10px;
    overflow: hidden;
  }
  .sd-panel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 22px;
    border-bottom: 1px solid #ecf2fb;
    background: #fafcff;
  }
  .sd-panel-title {
    font-size: 0.78rem;
    font-weight: 700;
    color: #1e3a6e;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .sd-panel-body { padding: 20px 22px; }

  .sd-actions {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }
  @media (max-width: 700px) { .sd-actions { grid-template-columns: repeat(3, 1fr); } }

  .sd-action {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    text-decoration: none;
    padding: 16px 8px 14px;
    border-radius: 8px;
    border: 1px solid #dbe6f5;
    background: #f8faff;
    transition: border-color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s;
  }
  .sd-action:hover {
    background: #eff6ff;
    border-color: #93c5fd;
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(29,78,216,0.08);
  }
  .sd-action-icon {
    width: 38px; height: 38px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
  }
  .sd-action-label {
    font-size: 0.71rem; font-weight: 600;
    color: #374e79; text-align: center; line-height: 1.3;
  }

  .sd-complaint {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 7px;
    border: 1px solid #ecf2fb;
    background: #fafcff;
    margin-bottom: 8px;
    transition: background 0.13s;
  }
  .sd-complaint:last-child { margin-bottom: 0; }
  .sd-complaint:hover { background: #eff6ff; border-color: #bfdbfe; }

  .sd-c-dot {
    width: 7px; height: 7px; border-radius: 50%;
    flex-shrink: 0; margin-top: 5px;
  }
  .sd-c-dot.pending      { background: #f59e0b; }
  .sd-c-dot.under_review { background: #2563eb; }
  .sd-c-dot.resolved     { background: #16a34a; }
  .sd-c-dot.dismissed    { background: #94a3b8; }

  .sd-c-subject { font-size: 0.855rem; font-weight: 600; color: #1a2e58; }
  .sd-c-meta    { font-size: 0.72rem; color: #8fa0c4; margin-top: 2px; }

  .sd-badge {
    font-size: 0.67rem; font-weight: 700;
    padding: 3px 9px; border-radius: 4px;
    white-space: nowrap; text-transform: capitalize;
    letter-spacing: 0.03em; flex-shrink: 0;
  }
  .sd-badge.pending      { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
  .sd-badge.under_review { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
  .sd-badge.resolved     { background: #dcfce7; color: #14532d; border: 1px solid #bbf7d0; }
  .sd-badge.dismissed    { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

  .sd-profile-top {
    display: flex; align-items: center; gap: 14px;
    padding: 18px 22px;
    border-bottom: 1px solid #ecf2fb;
  }
  .sd-avatar-img {
    width: 50px; height: 50px; border-radius: 50%;
    object-fit: cover; border: 2px solid #dbeafe; flex-shrink: 0;
  }
  .sd-avatar-fallback {
    width: 50px; height: 50px; border-radius: 50%;
    background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.25rem; font-weight: 700; color: #fff;
    flex-shrink: 0; border: 2px solid #dbeafe;
  }
  .sd-profile-name  { font-size: 0.9rem; font-weight: 700; color: #0f1e3d; }
  .sd-profile-email { font-size: 0.73rem; color: #7b8fb5; margin-top: 1px; }
  .sd-student-tag {
    display: inline-block; margin-top: 5px;
    font-size: 0.67rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.06em;
    background: #dbeafe; color: #1e3a8a;
    padding: 2px 8px; border-radius: 4px;
  }

  .sd-profile-rows { padding: 6px 22px 10px; }
  .sd-profile-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 9px 0;
    border-bottom: 1px solid #f0f4fa;
    font-size: 0.77rem;
  }
  .sd-profile-row:last-child { border-bottom: none; }
  .sd-profile-row-label { color: #7b8fb5; font-weight: 500; }
  .sd-profile-row-val   { color: #1a2e58; font-weight: 600; }

  .sd-edit-btn {
    display: block; text-align: center; text-decoration: none;
    margin: 4px 22px 18px;
    padding: 9px;
    border-radius: 7px;
    border: 1.5px solid #1d4ed8;
    color: #1d4ed8; font-size: 0.8rem; font-weight: 700;
    letter-spacing: 0.02em;
    transition: background 0.15s, color 0.15s;
  }
  .sd-edit-btn:hover { background: #1d4ed8; color: #fff; }

  .sd-view-all {
    font-size: 0.73rem; font-weight: 700;
    color: #1d4ed8; text-decoration: none;
    text-transform: uppercase; letter-spacing: 0.05em;
    transition: opacity 0.14s;
  }
  .sd-view-all:hover { opacity: 0.65; }

  .sd-empty { text-align: center; padding: 28px 0; color: #a0b0cc; font-size: 0.83rem; }
  .sd-empty-icon { font-size: 2rem; margin-bottom: 8px; }
  .sd-empty a { color: #1d4ed8; text-decoration: underline; display: block; margin-top: 6px; font-weight: 600; }

  .sd-skeleton {
    border-radius: 7px;
    background: linear-gradient(90deg, #e8f0fb 25%, #d5e4f7 50%, #e8f0fb 75%);
    background-size: 300%;
    animation: sd-shimmer 1.6s ease-in-out infinite;
    margin-bottom: 10px;
  }
  @keyframes sd-shimmer {
    0%   { background-position: 300% 0; }
    100% { background-position: -300% 0; }
  }
`;

const todayStr = new Date().toLocaleDateString('en-US', {
  weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
});

const StatCard = ({ icon, label, value, color }) => (
  <div className="sd-stat">
    <div className={`sd-stat-accent ${color}`} />
    <div className={`sd-stat-icon ${color}`}>{icon}</div>
    <p className="sd-stat-value">{value}</p>
    <p className="sd-stat-label">{label}</p>
  </div>
);

const badgeClass = (s) =>
  `sd-badge ${['pending','under_review','resolved','dismissed'].includes(s) ? s : 'dismissed'}`;
const dotClass = (s) =>
  `sd-c-dot ${['pending','under_review','resolved','dismissed'].includes(s) ? s : 'dismissed'}`;

const StudentDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints/my')
      .then(({ data }) => setComplaints(data.data.complaints || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openComplaints     = complaints.filter(c => ['pending','under_review'].includes(c.status)).length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;

  return (
    <>
      <style>{style}</style>
      <div className="sd-root">
        <div className="sd-topbar" />
        <div className="sd-inner">

          <div className="sd-header">
            <div>
              <h1 className="sd-greeting">
                Welcome back, <span>{user?.name?.split(' ')[0]}</span>.
              </h1>
              <p className="sd-subtext">Here's an overview of your student portal activity.</p>
            </div>
            <span className="sd-date-badge">{todayStr}</span>
          </div>

          <div className="sd-stat-grid">
            <StatCard icon="📝" label="Total Complaints" value={complaints.length}     color="blue"  />
            <StatCard icon="⏳" label="Open"             value={openComplaints}         color="sky"   />
            <StatCard icon="✅" label="Resolved"          value={resolvedComplaints}    color="green" />
            <StatCard icon="🎓" label="Semester"          value={user?.semester ? `Sem ${user.semester}` : '—'} color="slate" />
          </div>

          <div className="sd-main">

            <div className="sd-left">

              <div className="sd-panel">
                <div className="sd-panel-head">
                  <span className="sd-panel-title">Quick Actions</span>
                </div>
                <div className="sd-panel-body">
                  <div className="sd-actions">
                    {[
                      { to: '/student/feedback',   icon: '⭐', label: 'Give Feedback',  bg: '#fef9c3' },
                      { to: '/student/complaint',  icon: '📢', label: 'File Complaint', bg: '#fee2e2' },
                      { to: '/student/top-rated',  icon: '🏆', label: 'Top Rated',      bg: '#dbeafe' },
                      { to: '/student/complaints', icon: '📋', label: 'My Complaints',  bg: '#ede9fe' },
                      { to: '/profile',            icon: '👤', label: 'My Profile',     bg: '#dcfce7' },
                    ].map(({ to, icon, label, bg }) => (
                      <Link key={to} to={to} className="sd-action">
                        <div className="sd-action-icon" style={{ background: bg }}>{icon}</div>
                        <span className="sd-action-label">{label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sd-panel">
                <div className="sd-panel-head">
                  <span className="sd-panel-title">Recent Complaints</span>
                  <Link to="/student/complaints" className="sd-view-all">View All →</Link>
                </div>
                <div className="sd-panel-body">
                  {loading ? (
                    [1,2,3].map(i => <div key={i} className="sd-skeleton" style={{ height: 52 }} />)
                  ) : complaints.length === 0 ? (
                    <div className="sd-empty">
                      <div className="sd-empty-icon">📭</div>
                      <p>No complaints on record.</p>
                      <Link to="/student/complaint">File your first complaint</Link>
                    </div>
                  ) : (
                    complaints.slice(0, 3).map(c => (
                      <div key={c._id} className="sd-complaint">
                        <div className={dotClass(c.status)} />
                        <div style={{ flex: 1 }}>
                          <p className="sd-c-subject">{c.subject}</p>
                          <p className="sd-c-meta">{c.category} · {new Date(c.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={badgeClass(c.status)}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <div className="sd-right">

              <div className="sd-panel">
                <div className="sd-panel-head">
                  <span className="sd-panel-title">My Profile</span>
                </div>
                <div className="sd-profile-top">
                  {user?.avatar ? (
                    <img src={`http://localhost:5000${user.avatar}`} alt={user.name} className="sd-avatar-img" />
                  ) : (
                    <div className="sd-avatar-fallback">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="sd-profile-name">{user?.name}</p>
                    <p className="sd-profile-email">{user?.email}</p>
                    <span className="sd-student-tag">Student</span>
                  </div>
                </div>
                <div className="sd-profile-rows">
                  {user?.degree && (
                    <div className="sd-profile-row">
                      <span className="sd-profile-row-label">Degree</span>
                      <span className="sd-profile-row-val">{user.degree}</span>
                    </div>
                  )}
                  {user?.semester && (
                    <div className="sd-profile-row">
                      <span className="sd-profile-row-label">Semester</span>
                      <span className="sd-profile-row-val">Semester {user.semester}</span>
                    </div>
                  )}
                  <div className="sd-profile-row">
                    <span className="sd-profile-row-label">Complaints Filed</span>
                    <span className="sd-profile-row-val">{complaints.length}</span>
                  </div>
                </div>
                <Link to="/profile" className="sd-edit-btn">Edit Profile</Link>
              </div>

              <TopRatedWidget />

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default StudentDashboard;