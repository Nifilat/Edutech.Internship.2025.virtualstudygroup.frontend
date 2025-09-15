import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    },
  });

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        queryClient.setQueryData(['user'], data.user);
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authAPI.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successful! Please log in with your new password.');
      navigate('/login');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authAPI.forgotPassword,
    onSuccess: () => {
      toast.success('Password reset instructions sent to your email!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to send reset instructions';
      toast.error(message);
    },
  });

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    queryClient.clear();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('auth_token');
  };

  const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  return {
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    logout,
    isAuthenticated,
    getUser,
    isLoading: registerMutation.isPending || loginMutation.isPending || resetPasswordMutation.isPending || forgotPasswordMutation.isPending,
  };
};