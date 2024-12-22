import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,
  isOtpVerified: false,
  pendingAdminVerification: null,

  signup: async ({ name, email, password, confirmPassword, phone, countryCode }) => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    set({ loading: true });
    try {
      const res = await axios.post("/auth/signup", {
        name,
        email,
        password,
        phone,
        countryCode,
      });
      set({ user: res.data, loading: false });
      toast.success("Signed up successfully");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/login", {
        email,
        password,
      });
      
      if (res.data.user?.role === "admin") {
        set({ 
          user: null,
          pendingAdminVerification: res.data.user,
          isOtpVerified: false,
          loading: false 
        });
        toast.success("Please verify OTP sent to your phone");
        return res.data;
      }

      set({ 
        user: res.data.user,
        pendingAdminVerification: null,
        isOtpVerified: true,
        loading: false 
      });
      toast.success("Logged in successfully");
      return res.data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  verifyOtp: async (userId, otp) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/verify-otp", {
        userId,
        otp,
      });
      
      set({ 
        user: res.data.user,
        pendingAdminVerification: null,
        isOtpVerified: true,
        loading: false 
      });
      toast.success("Admin verified successfully");
      return res.data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axios.get("/auth/profile");
      if (response.data?.role === "admin" && !get().isOtpVerified) {
        set({ 
          user: null,
          pendingAdminVerification: response.data,
          isOtpVerified: false,
          checkingAuth: false 
        });
        return;
      }
      set({ 
        user: response.data,
        pendingAdminVerification: null,
        isOtpVerified: true,
        checkingAuth: false 
      });
    } catch (error) {
      set({ 
        user: null,
        pendingAdminVerification: null,
        isOtpVerified: false,
        checkingAuth: false 
      });
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({ 
        user: null,
        pendingAdminVerification: null,
        isOtpVerified: false
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred during logout");
    }
  },

  refreshToken: async () => {
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      const response = await axios.post("/auth/refresh-token");
      set({ checkingAuth: false });
      return response.data;
    } catch (error) {
      set({ 
        user: null,
        pendingAdminVerification: null,
        isOtpVerified: false,
        checkingAuth: false
      });
      throw error;
    }
  },
}));
// Axios Interceptors for token refresh

let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // If a refresh is already in progress, wait for it to complete
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        // Start a new refresh process
        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login or handle as needed
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
