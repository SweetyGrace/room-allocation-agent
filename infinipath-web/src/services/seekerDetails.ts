import { UserListItem, UserDetails } from '../types/details';
import { mockUsers, mockAllUserDetails } from '../types/mockData';

export const fetchUsers = async (): Promise<UserListItem[]> => {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    // Fallback to mock data
    return mockUsers;
  }
};


export const fetchUserDetails = async (userId: string) => {
  try {
      const response = await fetch(`/api/user/${userId}`);

      const text = await response.text(); // Read raw response

      try {
          return JSON.parse(text); // Try parsing JSON manually
      } catch (err) {
          throw new Error("Invalid JSON: " + err.message);
      }
  } catch (error) {
      console.error("API Error:", error);
      throw error;
  }
};


