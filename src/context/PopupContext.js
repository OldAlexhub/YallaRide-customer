import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const PopupContext = createContext(null);

let idCounter = 0;

export const PopupProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);

  const enqueue = useCallback((item) => {
    setQueue((prev) => [...prev, { id: ++idCounter, ...item }]);
  }, []);

  const dismiss = useCallback((id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // payload may be a string or an object like { title, message }
  const showPopup = useCallback(
    (payload, options = {}) => {
      let title, message;
      if (typeof payload === 'string') {
        message = payload;
      } else if (payload && typeof payload === 'object') {
        title = payload.title;
        message = payload.message || payload.body || '';
      }
      return enqueue({ type: 'toast', title, message, duration: options.duration || 4000, ...options });
    },
    [enqueue]
  );

  const showBanner = useCallback(
    (payload, options = {}) => {
      let title, message;
      if (typeof payload === 'string') {
        message = payload;
      } else if (payload && typeof payload === 'object') {
        title = payload.title;
        message = payload.message || payload.body || '';
      }
      return enqueue({ type: 'banner', title, message, ...options });
    },
    [enqueue]
  );

  const showAlert = useCallback(
    (payload, options = {}) => {
      let title, message;
      if (typeof payload === 'string') {
        message = payload;
      } else if (payload && typeof payload === 'object') {
        title = payload.title;
        message = payload.message || payload.body || '';
      }
      return enqueue({ type: 'alert', title, message, ...options });
    },
    [enqueue]
  );

  const value = useMemo(
    () => ({
      queue,
      showPopup,
      showBanner,
      showAlert,
      dismiss,
    }),
    [queue, showPopup, showBanner, showAlert, dismiss]
  );

  return (
    <PopupContext.Provider value={value}>
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const ctx = useContext(PopupContext);
  if (!ctx) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return ctx;
};

