import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('accessToken', data.accessToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false });
      window.location.href = '/login';
    }
  },

  fetchMe: async () => {
    if (!localStorage.getItem('accessToken')) return;
    try {
      const { data } = await api.get('/users/me');
      set({ user: data, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false });
    }
  }
}));

export default useAuthStore;
