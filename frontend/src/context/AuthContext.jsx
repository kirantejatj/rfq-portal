import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('rfq_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('rfq_token');
      const storedUser = localStorage.getItem('rfq_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        try {
          const res = await api.get('/auth/me');
          setUser(prev => ({ ...prev, ...res.data }));
          localStorage.setItem('rfq_user', JSON.stringify({ ...JSON.parse(storedUser), ...res.data }));
        } catch (err) {
          console.error("Session verification failed", err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const saveAuthData = (data) => {
    localStorage.setItem('rfq_token', data.access_token);
    const userInfo = {
      userId: data.user_id,
      name: data.name,
      mobile: data.mobile,
      role: data.role
    };
    localStorage.setItem('rfq_user', JSON.stringify(userInfo));
    setToken(data.access_token);
    setUser(userInfo);
  };

  const loginCE = async (mobile_no, password) => {
    const res = await api.post('/auth/ce/login', { mobile_no, password });
    saveAuthData(res.data);
    return res.data;
  };

  const loginApplicant = async (mobile_no, password) => {
    const res = await api.post('/auth/applicant/login', { mobile_no, password });
    saveAuthData(res.data);
    return res.data;
  };

  const verifyApplicantOTP = async (mobile_no, otp_code) => {
    const res = await api.post('/auth/applicant/verify-otp', { mobile_no, otp_code, purpose: 'LOGIN' });
    saveAuthData(res.data);
    return res.data;
  };

  const registerApplicant = async (formData) => {
    const res = await api.post('/auth/applicant/register', formData);
    saveAuthData(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('rfq_token');
    localStorage.removeItem('rfq_user');
    setToken(null);
    setUser(null);
  };

  const isCE = user && ['CE', 'ADMIN', 'SUPER_ADMIN'].includes(user.role);
  const isApplicant = user && user.role === 'APPLICANT';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isCE,
      isApplicant,
      loginCE,
      loginApplicant,
      verifyApplicantOTP,
      registerApplicant,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
