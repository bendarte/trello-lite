import { Column as ColumnType, Task } from '@/types/task';
import { TaskCard } from './TaskCard';
import { useDrop } from 'react-dnd';
import { useRef } from 'react';

interface ColumnProps {
  column: ColumnType;
  onTaskMove: (taskId: string, newStatus: Task['status']) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export function Column({ column, onTaskMove, onEditTask, onDeleteTask }: ColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item: Task) => {
      if (item.status !== column.id) {
        onTaskMove(item.id, column.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drop(ref);

  return (
    <div
      ref={ref}
      className={`flex-1 min-w-[300px] bg-gray-50 rounded-lg p-4
        ${isOver ? 'bg-gray-100' : ''}`}
    >
      <h2 className="text-xl font-bold mb-4 text-gray-700">{column.title}</h2>
      <div className="space-y-2">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
} 