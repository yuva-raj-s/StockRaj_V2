import { User } from '../types';

// Demo credentials
const DEMO_USERS = [
  {
    id: '1',
    email: 'demo@stockai.com',
    password: 'StockAI@2024',
    name: 'Demo User'
  }
];

export const authService = {
  login: async (email: string, password: string): Promise<User | null> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = DEMO_USERS.find(u => 
      u.email === email && u.password === password
    );
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    
    return null;
  },

  signup: async (name: string, email: string, password: string): Promise<User | null> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    if (DEMO_USERS.some(u => u.email === email)) {
      return null;
    }
    
    // In a real app, this would create a new user in the database
    return {
      id: '2',
      name,
      email
    };
  }
};