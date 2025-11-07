import { createContext, useState, useEffect } from 'react';
import { login } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ id: payload.sub, role: payload.role });
    }
  }, [token]);

  const handleLogin = async (email, password) => {
    const { data } = await login(email, password);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
  };

  return (
    <AuthContext.Provider value={{ user, token, handleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};