// Task API endpoints
export const TASK_ENDPOINTS = {
  GET_ALL_TASKS: 'api/tasks',
  GET_TASK_BY_ID: (id) => `api/tasks/${id}`,
  CREATE_TASK: 'api/tasks',
  UPDATE_TASK: (id) => `api/tasks/${id}`,
  DELETE_TASK: (id) => `api/tasks/${id}`,
  TOGGLE_TASK_COMPLETION: (id,complete=true) => `api/tasks/${id}/${complete}`,
  REORDER_TASKS: (sourceId,destinationId,parentTaskId = null) => `api/tasks/reorder?sourceId=${sourceId}&destinationId=${destinationId}`
};

// Export all endpoints in a single object
export const API_ENDPOINTS = {
  ...TASK_ENDPOINTS
};
