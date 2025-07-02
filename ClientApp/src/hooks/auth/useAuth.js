import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

// Create Auth Context
const AuthContext = createContext();

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

/**
 * Main authentication hook
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp > currentTime) {
          setUser({
            id: parseInt(decoded.sub, 10),
            email: decoded.email,
            role:
              decoded.role ||
              decoded[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              ],
            fullName:
              decoded.name ||
              decoded[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
              ],
          });
          setIsAuthenticated(true);
        } else {
          // Token expired
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/login`,
        { email, password }
      );

      const { token, user: userData } = response.data;

      localStorage.setItem("token", token);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/register`,
        userData
      );

      const { token, user: newUser } = response.data;

      localStorage.setItem("token", token);
      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      if (!user) throw new Error("User not authenticated");

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/api/users/${user.id}`,
          updates,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const updatedUser = response.data;
        setUser(updatedUser);

        return { success: true, user: updatedUser };
      } catch (error) {
        const message =
          error.response?.data?.message || "Profile update failed";
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const hasRole = useCallback(
    (role) => {
      return user?.role === role;
    },
    [user]
  );

  const isAdmin = useCallback(() => {
    return hasRole("Admin");
  }, [hasRole]);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    isAdmin,
  };
};

/**
 * Hook for user profile management
 */
export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProfile(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (userId, updates) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}`,
        updates,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProfile(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update profile";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
  };
};

/**
 * Hook for password management
 */
export const usePassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/change-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to change password";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);

      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/reset-password`,
        { email }
      );

      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to send reset email";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    changePassword,
    resetPassword,
  };
};
