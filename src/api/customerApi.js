import axiosClient from './axiosClient';

const customerApi = {
  signup(name, phone, password, referralCode) {
    return axiosClient.post('/customer/auth/signup', {
      name,
      phone,
      password,
      referralCode,
    });
  },

  login(phone, password) {
    return axiosClient.post('/customer/auth/login', { phone, password });
  },

  getProfile() {
    return axiosClient.get('/customer/auth/profile');
  },

  getLoyaltyStatus() {
    return axiosClient.get('/customer/loyalty/status');
  },
};

export default customerApi;
