import { User } from '../types';

const API_Base = '/api';

export const getUsers = async (): Promise<Record<string, User>> => {
  try {
    const response = await fetch(`${API_Base}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error('getUsers error:', error);
    return {};
  }
};

export const getUser = async (id: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_Base}/users/${id}`);
    if (!response.ok) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error('getUser error:', error);
    return null;
  }
};

export const loginUser = async (id: string, password: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_Base}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password })
    });
    if (!response.ok) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error('loginUser error:', error);
    return null;
  }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  try {
    const response = await fetch(`${API_Base}/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update user');
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error('updateUser error:', error);
    return null;
  }
};
