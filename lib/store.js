import { create } from 'zustand';
import api from './axios';

export const useStore = create((set, get) => ({
  centers: [],
  doctors: [],
  vaccines: [],
  users: [],
  
  // To avoid spamming loading states when data is already there
  loadingCenters: false,
  loadingDoctors: false,
  loadingVaccines: false,
  loadingUsers: false,

  fetchCenters: async (force = false) => {
    if (get().centers.length > 0 && !force) return;
    set({ loadingCenters: true });
    try {
      const res = await api.get('/vaccinationCenter/getAll');
      set({ centers: res.data });
    } catch (err) {
      console.error(err);
    } finally {
      set({ loadingCenters: false });
    }
  },

  fetchDoctors: async (force = false) => {
    if (get().doctors.length > 0 && !force) return;
    set({ loadingDoctors: true });
    try {
      const res = await api.get('/doctor/getAll');
      set({ doctors: res.data });
    } catch (err) {
      console.error(err);
    } finally {
      set({ loadingDoctors: false });
    }
  },

  fetchVaccines: async (force = false) => {
    if (get().vaccines.length > 0 && !force) return;
    set({ loadingVaccines: true });
    try {
      const res = await api.get('/vaccine/getAll');
      set({ vaccines: res.data });
    } catch (err) {
      console.error(err);
    } finally {
      set({ loadingVaccines: false });
    }
  },

  fetchUsers: async (force = false) => {
    if (get().users.length > 0 && !force) return;
    set({ loadingUsers: true });
    try {
      const res = await api.get('/user/getAll');
      set({ users: res.data });
    } catch (err) {
      console.error(err);
    } finally {
      set({ loadingUsers: false });
    }
  },

  // Calling this will forcefully fetch all
  refreshAll: async () => {
    await Promise.all([
      get().fetchCenters(true),
      get().fetchDoctors(true),
      get().fetchVaccines(true),
      get().fetchUsers(true)
    ]);
  }
}));
