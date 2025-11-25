// Mock authentication for testing without backend
// Remove this when you have a real backend

export const mockLogin = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Accept any credentials for demo
  if (email && password) {
    return {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: '1',
        email: email,
        name: 'Demo User'
      }
    };
  }
  
  throw new Error('Invalid credentials');
};
