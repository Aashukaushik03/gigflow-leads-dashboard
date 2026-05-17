import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { User, AuthState } from '../types';
import { authApi, LoginPayload, RegisterPayload } from '../api/auth';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (data: LoginPayload) => Promise<boolean>;
  register: (data: RegisterPayload) => Promise<boolean>;
  logout: () => void;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('gigflow_token'),
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_AUTH':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return { user: null, token: null, isAuthenticated: false, isLoading: false };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('gigflow_token');
    if (token) {
      authApi
        .getMe()
        .then(({ data }) => {
          if (data.data?.user) {
            dispatch({ type: 'SET_AUTH', payload: { user: data.data.user, token } });
          } else {
            dispatch({ type: 'LOGOUT' });
          }
        })
        .catch(() => {
          localStorage.removeItem('gigflow_token');
          dispatch({ type: 'LOGOUT' });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = useCallback(async (data: LoginPayload): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await authApi.login(data);
      const { user, token } = res.data.data!;
      localStorage.setItem('gigflow_token', token);
      dispatch({ type: 'SET_AUTH', payload: { user, token } });
      toast.success(`Welcome back, ${user.name}!`);
      return true;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed';
      toast.error(message);
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  }, []);

  const register = useCallback(async (data: RegisterPayload): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await authApi.register(data);
      const { user, token } = res.data.data!;
      localStorage.setItem('gigflow_token', token);
      dispatch({ type: 'SET_AUTH', payload: { user, token } });
      toast.success('Account created successfully!');
      return true;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed';
      toast.error(message);
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('gigflow_token');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
