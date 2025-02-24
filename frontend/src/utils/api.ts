import { Task, TaskCreate, TaskUpdate } from '@/types/task';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ErrorResponse {
  detail: string;
  timestamp?: string;
}

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: ErrorResponse
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorDetails: ErrorResponse;
    try {
      errorDetails = await response.json();
    } catch {
      errorDetails = { detail: await response.text() };
    }
    throw new APIError(
      `API request failed: ${response.statusText}`,
      response.status,
      errorDetails
    );
  }
  return response.json();
}

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_URL}/tasks`);
  return handleResponse<Task[]>(response);
};

export const createTask = async (task: TaskCreate): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  return handleResponse<Task>(response);
};

export const updateTask = async (id: string, task: TaskUpdate): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  return handleResponse<Task>(response);
};

export const deleteTask = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    return handleResponse(response);
  }
}; 