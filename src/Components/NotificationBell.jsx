import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '@/lib/axios';

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // 1. STATE MANAGEMENT & FETCHING
  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/notifications');
        const list = Array.isArray(response.data?.data) ? response.data.data : [];
        if (isMounted) {
          setNotifications(list);
          setUnreadCount(list.filter(n => !n.is_read).length);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    if (user) {
      fetchNotifications();
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  // 2. WEBSOCKET LISTENER (Laravel Echo)
  useEffect(() => {
    if (!user || !user.id || typeof window.Echo === 'undefined') return;

    const channelName = `App.Models.User.${user.id}`;
    const channel = window.Echo.private(channelName);

    channel.listen('Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (incomingPayload) => {
      setNotifications((prev) => [incomingPayload, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      window.Echo.leave(channelName);
    };
  }, [user]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    setIsOpen(false);
    const url = notification.url || notification.data?.url;
    
    if (url) {
        // use react-router navigate for SPA transition if possible
        // but if it's external or different we might need window.location
        if (url.startsWith('/')) {
            navigate(url);
        } else {
            window.location.href = url;
        }
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-gray-500 hover:text-primary transition-colors focus:outline-none"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-white">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md border border-gray-100 bg-white shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="border-b border-gray-50 px-4 py-3 bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800">Notifikasi</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-primary font-medium">{unreadCount} baru</span>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center flex flex-col items-center justify-center space-y-2">
                <Bell className="w-6 h-6 text-gray-300" strokeWidth={1} />
                <p className="text-sm text-gray-500">Belum ada notifikasi.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification, idx) => {
                  const title = notification.title || notification.data?.title || 'Notifikasi Baru';
                  const message = notification.message || notification.data?.message || '';
                  
                  return (
                    <button
                      key={notification.id || idx}
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full px-4 py-3 flex flex-col text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                    >
                      <span className="text-sm font-medium text-gray-800 mb-0.5">
                        {title}
                      </span>
                      {message && (
                        <span className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {message}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
