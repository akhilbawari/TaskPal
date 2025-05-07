import axios from 'axios';
import BACKEND_URL from '../baseUrl';

const API_URL = BACKEND_URL;

// Create axios instance with common configuration
const taskApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
taskApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Task API endpoints
export const fetchTasks = async () => {
  try {
    const response = await taskApi.get('api/tasks');
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const fetchTaskById = async (taskId) => {
  try {
    const response = await taskApi.get(`api/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    throw error;
  }
};
  
export const createTaskApi = async (taskData) => {
  try {
    const response = await taskApi.post('api/tasks', taskData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTaskApi = async (taskId, taskData) => {
  try {
    const response = await taskApi.put(`api/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    throw error;
  }
};

export const deleteTaskApi = async (taskId) => {
  try {
    const response = await taskApi.delete(`api/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    throw error;
  }
};

export const toggleTaskCompletionApi = async (taskId, isCompleted) => {
  try {
    const response = await taskApi.patch(`api/tasks/${taskId}/complete`, { completed: isCompleted });
    return response.data;
  } catch (error) {
    console.error(`Error toggling task completion for ${taskId}:`, error);
    throw error;
  }
};

export const reorderTasksApi = async (reorderData) => {
  try {
    const response = await taskApi.post('api/tasks/reorder', reorderData);
    return response.data;
  } catch (error) {
    console.error('Error reordering tasks:', error);
    throw error;
  }
};

export default taskApi;
