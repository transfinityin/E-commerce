import { useEffect, useState, useRef } from 'react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../services/notificationApi';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notifRes, countRes] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);

      // Defensive: ensure array
      const notifs = Array.isArray(notifRes.data) ? notifRes.data : [];
      const count = countRes?.data?.unread_count || 0;

      setNotifications(notifs);
      setUnread(count);
    } catch (err) {
      console.error('Notification fetch failed', err);
      setNotifications([]);
      setUnread(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      fetchData();
    } catch (err) {
      console.error('Mark read failed', err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      fetchData();
    } catch (err) {
      console.error('Mark all read failed', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order': return '📦';
      case 'rank_up': return '🎖️';
      case 'promo': return '🎁';
      case 'support': return '🎧';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  // Safe guard: if somehow notifications is not array, use []
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all duration-200 relative ${
          open
            ? 'bg-[var(--color-bg-alt)] text-[var(--color-text)]'
            : 'text-[var(--color-muted)] hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-text)]'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="sm:w-5 sm:h-5"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 sm:top-1 sm:right-1 bg-[var(--color-primary)] text-white text-[9px] sm:text-[10px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center leading-none animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-[360px] sm:w-[400px] max-h-[480px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-lg)] z-[200] overflow-hidden animate-slideDown">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
            <h4 className="text-sm font-semibold text-[var(--color-text)]">Notifications</h4>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs font-medium text-[var(--color-primary)] hover:underline bg-transparent border-none cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && safeNotifications.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-muted)] text-sm">
                Loading...
              </div>
            ) : safeNotifications.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-muted)] text-sm">
                <span className="text-2xl block mb-2">🔔</span>
                No notifications yet
              </div>
            ) : (
              safeNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3 border-b border-[var(--color-border)] transition-colors cursor-default ${
                    n.is_read
                      ? 'opacity-70 hover:bg-[var(--color-bg-alt)]/50'
                      : 'bg-[var(--color-bg-alt)]/30 hover:bg-[var(--color-bg-alt)]/60'
                  }`}
                >
                  {/* Icon */}
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <span className="text-xl">{getIcon(n.type)}</span>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_6px_rgba(var(--color-primary-rgb),0.5)]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--color-text)] leading-snug mb-1">
                      {n.title}
                    </p>
                    <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-2">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[var(--color-muted)]/60">
                        {n.created_at ? new Date(n.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : ''}
                      </span>
                      {n.link && (
                        <a
                          href={n.link}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] font-medium text-[var(--color-primary)] hover:underline no-underline"
                        >
                          View →
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Mark read */}
                  {!n.is_read && (
                    <button
                      onClick={(e) => handleMarkRead(n.id, e)}
                      className="self-center w-7 h-7 flex items-center justify-center rounded-full bg-[var(--color-bg-alt)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all text-xs border-none cursor-pointer shrink-0"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}