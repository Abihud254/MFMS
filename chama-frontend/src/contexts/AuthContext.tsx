import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data.data);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Failed to verify token', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    verifyUser();
  }, [])

  const handleResponse = async (response: Response) => {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        return response.json();
      } else {
        const text = await response.text();
        throw new Error(`Expected JSON, but received ${contentType}. Response: ${text}`);
      }
    };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setIsLoading(false);
        try {
          // Try to parse as JSON, as the error might be a structured message
          const errorData = JSON.parse(errorText);
          return { success: false, message: errorData.error || 'Login failed.' };
        } catch (e) {
          // If not JSON, return the raw text
          return { success: false, message: errorText || 'Login failed.' };
        }
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('token', data.token);
      setIsLoading(false);
      return { success: true, message: 'Login successful' };

    } catch (error) {
      setIsLoading(false);
      return { success: false, message: 'An error occurred during login.' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setIsLoading(false);
        try {
          const errorData = JSON.parse(errorText);
          return { success: false, message: errorData.error || 'Registration failed.' };
        } catch (e) {
          return { success: false, message: errorText || 'Registration failed.' };
        }
      }

      const data = await response.json();
      setUser(data.data); // Set user from `data` property
      localStorage.setItem('token', data.token); // Save the token
      setIsLoading(false);
      return { success: true, message: data.message }; // Return the message from the backend

    } catch (error) {
      setIsLoading(false);
      return { success: false, message: 'An error occurred during registration.' };
    }
  };

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}