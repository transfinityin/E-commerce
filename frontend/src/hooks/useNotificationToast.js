import { useEffect, useRef } from 'react';
import { getUnreadCount } from '../services/notificationApi';

export function useNotificationToast() {
  const prevCount = useRef(0);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await getUnreadCount();
        const current = res.data.unread_count;
        if (current > prevCount.current && prevCount.current !== 0) {
          // New notification arrived!
          // You can integrate react-hot-toast or your own toast here
          console.log('🔔 New notification!');
        }
        prevCount.current = current;
      } catch (e) {
        // silent fail
      }
    };

    const interval = setInterval(check, 30000);
    check(); // initial
    return () => clearInterval(interval);
  }, []);
}