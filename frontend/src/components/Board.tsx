import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task, Column as ColumnType, TaskStatus } from '@/types/task';
import { Column } from './Column';
import { fetchTasks, updateTask, deleteTask } from '@/utils/api';
import { CreateTaskModal } from './CreateTaskModal';
import { EditTaskModal } from './EditTaskModal';

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' },
];

export function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await fetchTasks();
      setTasks(fetchedTasks);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    }
  };

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updatedTask = await updateTask(taskId, { status: newStatus });
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
      setError(null);
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      setError(null);
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    setTaskToEdit(null);
  };

  const columns: ColumnType[] = COLUMNS.map(col => ({
    ...col,
    tasks: tasks.filter(task => task.status === col.id),
  }));

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Task
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-6 overflow-x-auto pb-8">
            {columns.map(column => (
              <Column
                key={column.id}
                column={column}
                onTaskMove={handleTaskMove}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>

          {isCreateModalOpen && (
            <CreateTaskModal
              onClose={() => setIsCreateModalOpen(false)}
              onTaskCreated={(newTask) => {
                setTasks([...tasks, newTask]);
                setIsCreateModalOpen(false);
              }}
            />
          )}

          {taskToEdit && (
            <EditTaskModal
              task={taskToEdit}
              onClose={() => setTaskToEdit(null)}
              onTaskUpdated={handleTaskUpdated}
            />
          )}
        </div>
      </div>
    </DndProvider>
  );
} 