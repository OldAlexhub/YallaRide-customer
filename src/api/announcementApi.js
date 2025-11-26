import axiosClient from './axiosClient';

const announcementApi = {
  list() {
    return axiosClient.get('/customer/announcement/list');
  },

  markRead(id) {
    return axiosClient.post('/customer/announcement/read', { id });
  },
};

export default announcementApi;

