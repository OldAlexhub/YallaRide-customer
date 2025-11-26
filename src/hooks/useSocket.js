import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { usePopup } from '../context/PopupContext';

const rawSocketUrl = process.env.SOCKET_URL || 'http://192.168.1.18:5000';
const endpoint = `${rawSocketUrl.replace(/\/+$/, '')}/customer`;

const useSocket = () => {
  const { showPopup, showBanner, showAlert } = usePopup();
  const [tripStatus, setTripStatus] = useState(null);
  const [eta, setEta] = useState(null);
  const [connected, setConnected] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);

  useEffect(() => {
    const socket = io(endpoint, {
      transports: ['websocket'],
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('popup', (payload) => {
      // payload can be string or object { title, message }
      if (payload) {
        showPopup(payload);
      }
    });

    socket.on('banner', (payload) => {
      if (payload) {
        showBanner(payload);
      }
    });

    socket.on('alert', (payload) => {
      if (payload) {
        showAlert(payload);
      }
    });

    // also treat 'system' notifications as popup-style alerts
    socket.on('system', (payload) => {
      if (payload) showPopup(payload);
    });

    const tripEvents = [
      'trip:update',
      'trip:assigned',
      'trip:driver_enroute',
      'trip:driver_nearby',
      'trip:started',
      'trip:completed',
      'trip:canceled',
    ];

    tripEvents.forEach((event) => {
      socket.on(event, (data) => {
        setTripStatus({ event, data });
      });
    });

    socket.on('eta:update', (data) => {
      setEta(data);
    });

    socket.on('customer:banned', (data) => {
      showAlert(data?.message || 'Your account has been banned.');
      setAccountStatus({ type: 'banned', data });
    });

    socket.on('customer:blocked', (data) => {
      showAlert(data?.message || 'Your account has been temporarily blocked.');
      setAccountStatus({ type: 'blocked', data });
    });

    socket.on('customer:warning', (data) => {
      showBanner(data?.message || 'Warning on your account.');
      setAccountStatus({ type: 'warning', data });
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [showPopup, showBanner, showAlert]);

  return { tripStatus, eta, connected, accountStatus };
};

export default useSocket;
