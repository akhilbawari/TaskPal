import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';
import useQuery from '@/hooks/useQuery';
import useMutation from '@/hooks/useMutation';
import { TASK_ENDPOINTS } from '@/imports/api/taskEndpoints';

const TaskContext = createContext();

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the useQuery hook to fetch tasks from the API
  const { data: tasksData, loading: tasksLoading, refetch: refetchTasks } = useQuery(TASK_ENDPOINTS.GET_ALL_TASKS);
  console.log(tasksData,'qqqqqqqqq')
  
  // Use the useMutation hook for task operations
  const { mutate } = useMutation();

  // Set tasks from API data when it's loaded
  useEffect(() => {
    if (tasksData?.data?.data) {
      setTasks(tasksData.data.data);
    } 
  }, [tasksData]);
  
  // Update loading state based on API loading
  useEffect(() => {
    setIsLoading(tasksLoading);
  }, [tasksLoading]);

  // Check for tasks that are due today or tomorrow
  useEffect(() => {
    const checkForUpcomingTasks = () => {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayTasks = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate.toDateString() === today.toDateString();
      });
      
      const tomorrowTasks = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate.toDateString() === tomorrow.toDateString();
      });
      
      if (todayTasks.length > 0) {
        toast.info(`You have ${todayTasks.length} tasks due today!`);
      }
      
      if (tomorrowTasks.length > 0) {
        toast.info(`You have ${tomorrowTasks.length} tasks due tomorrow!`);
      }
    };
    
    // Check on initial load
    checkForUpcomingTasks();
    
    // Set up a daily check
    const interval = setInterval(checkForUpcomingTasks, 86400000); // 24 hours
    
    return () => clearInterval(interval);
  }, [tasks]);

  // Calculate priority score based on weight and days until due
  const calculatePriorityScore = useCallback((task) => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const daysUntilDue = differenceInDays(dueDate, today);
    
    // Formula: Weight * (10 / (daysUntilDue + 1))
    // This gives higher scores to tasks with high weight and close due dates
    // Adding 1 to daysUntilDue prevents division by zero for tasks due today
    const baseScore = task.weight * (10 / (daysUntilDue + 1));
    
    // Cap the score at 100 and ensure it's at least 0
    return Math.min(Math.max(baseScore, 0), 100);
  }, []);

  // Get all tasks sorted by priority
  const getSortedTasks = useCallback(() => {
    return [...tasks]
      .map(task => ({
        ...task,
        priorityScore: calculatePriorityScore(task)
      }))
      .sort((a, b) => b.priority - a.priority);
  }, [tasks, calculatePriorityScore]);

  // Get the top 5 urgent tasks
  const getUrgentTasks = useCallback(() => {
    return getSortedTasks().slice(0, 5);
  }, [getSortedTasks]);

  // Create a new task using API
  const createTask = useCallback(async (taskData) => {
    try {
      // Calculate priority based on the current task list length
      let priority = 0;
      
      if (taskData.parentTaskId) {
        // For subtasks, calculate priority based on the number of existing subtasks
        const existingSubtasks = tasks.filter(task => task.parentTaskId === taskData.parentTaskId);
        priority = existingSubtasks.length;
      } else {
        // For top-level tasks, calculate priority based on the number of existing top-level tasks
        const topLevelTasks = tasks.filter(task => !task.parentTaskId);
        priority = topLevelTasks.length;
      }
      
      const response = await mutate({
        url: TASK_ENDPOINTS.CREATE_TASK,
        method: 'POST',
        data: {
          ...taskData,
          completed: false,
          priority: priority
        }
      });
      
      if (response.success) {
        // Refresh the task list
        refetchTasks();
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }, [mutate, refetchTasks, tasks]);

  // Update an existing task using API
  const updateTask = useCallback(async (id, taskData) => {
    try {
      // Get the current task
      const currentTask = tasks.find(task => task.id === id);
      if (!currentTask) {
        throw new Error('Task not found');
      }
      
      // Check if parent task ID is changing
      const isParentChanging = taskData.parentTaskId !== undefined && 
                              taskData.parentTaskId !== currentTask.parentTaskId;
      
      // Calculate new priority if parent is changing
      let priority = currentTask.priority;
      
      if (isParentChanging) {
        // If parent is changing, calculate new priority based on siblings count
        if (taskData.parentTaskId) {
          // Moving to be a child of another task
          const newSiblings = tasks.filter(task => task.parentTaskId === taskData.parentTaskId);
          priority = newSiblings.length;
        } else {
          // Moving to be a top-level task
          const topLevelTasks = tasks.filter(task => !task.parentTaskId);
          priority = topLevelTasks.length;
        }
      }
      
      const response = await mutate({
        url: TASK_ENDPOINTS.UPDATE_TASK(id),
        method: 'PUT',
        data: {
          ...taskData,
          priority: priority
        }
      });
      
      if (response.success) {
        // Refresh the task list
        refetchTasks();
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }, [mutate, refetchTasks, tasks]);

  // Delete a task using API
  const deleteTask = useCallback(async (id) => {
    try {
      const response = await mutate({
        url: TASK_ENDPOINTS.DELETE_TASK(id),
        method: 'DELETE'
      });
      
      if (response.success) {
        // Refresh the task list
        refetchTasks();
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }, [mutate, refetchTasks]);

  // Get a task by ID
  const getTaskById = useCallback((id) => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  // Get subtasks of a task
  const getSubtasks = useCallback((parentTaskId) => {
    return tasks.filter(task => task.parentTaskId === parentTaskId);
  }, [tasks]);

  // Get all tasks without a parent (top-level tasks)
  const getTopLevelTasks = useCallback(() => {
    return tasks.filter(task => !task.parentTaskId);
  }, [tasks]);

  // Toggle task completion status using API
  const toggleTaskCompletion = useCallback(async (id,complete=true) => {
    try {
      // Find the current task to get its completion status
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      
      const response = await mutate({
        url: TASK_ENDPOINTS.TOGGLE_TASK_COMPLETION(id,complete),
        method: 'PATCH',
        // data: { completed: !task.completed }
      });
      
      if (response.success) {
        // Refresh the task list
        refetchTasks();
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to toggle task completion');
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  }, [mutate, refetchTasks, tasks]);

  // Reorder tasks (for drag and drop) using API
  const reorderTasks = useCallback(async (sourceId, destinationId, parentTaskId = null) => {
    try {
      // Get the source task
      const sourceTask = tasks.find(task => task.id === sourceId);
      if (!sourceTask) {
        throw new Error('Source task not found');
      }
      
      // Check if we're moving to a new parent
      const isParentChanging = parentTaskId !== sourceTask.parentTaskId;
      
      // Calculate new priority based on destination
      let newPriority;
      
      if (destinationId) {
        // If there's a destination task, get its priority
        const destinationTask = tasks.find(task => task.id === destinationId);
        if (destinationTask) {
          newPriority = destinationTask.priority;
        }
      } else {
        // If no destination task, place at the end of the list
        const siblingTasks = tasks.filter(task => 
          task.parentTaskId === parentTaskId && task.id !== sourceId
        );
        newPriority = siblingTasks.length > 0 ? 
          Math.max(...siblingTasks.map(t => t.priority || 0)) + 1 : 0;
      }
      
      // Include priority in the reorder request
      const response = await mutate({
        url: TASK_ENDPOINTS.REORDER_TASKS(sourceId, destinationId, parentTaskId),
        method: 'PATCH',
        data: {
          sourceId,
          destinationId,
          parentTaskId,
          priority: newPriority !== undefined ? newPriority : 0
        }
      });
      
      if (response.success) {
        // Refresh the task list
        refetchTasks();
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to reorder tasks');
      }
    } catch (error) {
      console.error('Error reordering tasks:', error);
      throw error;
    }
  }, [mutate, refetchTasks, tasks]);

  // Create a subtask
  const createSubtask = useCallback((parentTaskId, taskData) => {
    if (!getTaskById(parentTaskId)) {
      toast.error('Parent task not found');
      return;
    }
    
    return createTask({
      ...taskData,
      parentTaskId
    });
  }, [createTask, getTaskById]);

  // Recursively build a hierarchical task tree
  const buildTaskTree = useCallback(() => {
    // Get top level tasks and sort them by priority in descending order (highest priority first)
    const topLevelTasks = getTopLevelTasks()
      .sort((a, b) => b.priority - a.priority);
    
    const buildTree = (parentTaskId) => {
      // Get children and sort them by priority in ascending order (lowest priority first)
      const children = tasks
        .filter(task => task.parentTaskId === parentTaskId)
        .sort((a, b) => a.priority - b.priority);
      
      if (children.length === 0) return [];
      
      return children.map(child => ({
        ...child,
        priorityScore: calculatePriorityScore(child),
        children: buildTree(child.id)
      }));
    };
    
    return topLevelTasks.map(task => ({
      ...task,
      priorityScore: calculatePriorityScore(task),
      children: buildTree(task.id)
    }));
  }, [tasks, getTopLevelTasks, calculatePriorityScore]);

  const value = {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
    getSubtasks,
    getTopLevelTasks,
    toggleTaskCompletion,
    reorderTasks,
    getSortedTasks,
    getUrgentTasks,
    calculatePriorityScore,
    createSubtask,
    buildTaskTree,
    refetchTasks
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};