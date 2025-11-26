import axiosClient from './axiosClient';

const tripApi = {
  requestTrip(payload) {
    return axiosClient.post('/trip/customer/request', payload || {});
  },

  // Note: backend cancel endpoint wiring is not finalized yet.
  cancelTrip(tripId, reason) {
    return axiosClient.post('/customer/cancel', { tripId, reason });
  },

  // Placeholder: backend does not yet expose a dedicated "active trip" endpoint.
  getActiveTrip() {
    return axiosClient.get('/trip/customer/active');
  },

  getEstimate(payload) {
    return axiosClient.post('/trip/customer/estimate', payload || {});
  },

  getTripHistory(page = 1, limit = 10) {
    return axiosClient.get('/trip/customer/history', { params: { page, limit } });
  },
};

export default tripApi;
