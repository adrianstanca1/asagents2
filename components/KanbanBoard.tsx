import React, { useState } from 'react';
import { Todo, TodoStatus, SubTask, User } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
    todos: Todo[];
    onUpdateTaskStatus: (todoId: number, newStatus: TodoStatus) => void;
    onUpdateTodo: (id: number, updates: Partial<Todo>) => void;
    onUpdateSubTask: (todoId: number, subTaskId: number, updates: Partial<SubTask>) => void;
    onAddSubTask: (todoId: number) => void;
    onDeleteSubTask: (todoId: number, subTaskId: number) => void;
    canManageTasks: boolean;
    user: User;
    addToast: (message: string, type: 'success' | 'error') => void;
    onRefreshData: () => void;
    newSubTaskText: Record<number, string>;
    setNewSubTaskText: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    editingSubTask: { todoId: number; subTaskId: number; } | null;
    setEditingSubTask: React.Dispatch<React.SetStateAction<{ todoId: number; subTaskId: number; } | null>>;
    editingSubTaskText: string;
    setEditingSubTaskText: React.Dispatch<React.SetStateAction<string>>;
}

interface KanbanColumnProps extends Omit<KanbanBoardProps, 'todos'> {
    title: string;
    status: TodoStatus;
    todos: Todo[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = (props) => {
    const { title, status, todos, onUpdateTaskStatus, canManageTasks } = props;
    const [isOver, setIsOver] = useState(false);
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Allow drop
        if (canManageTasks) {
            setIsOver(true);
        }
    };

    const handleDragLeave = () => {
        setIsOver(false);
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!canManageTasks) return;
        setIsOver(false);
        const todoId = parseInt(e.dataTransfer.getData('todoId'), 10);
        const sourceStatus = e.dataTransfer.getData('sourceStatus');
        if (todoId && sourceStatus !== status) {
            onUpdateTaskStatus(todoId, status);
        }
    };

    return (
        <div 
            className={`bg-slate-100 rounded-xl p-3 w-80 md:w-96 flex-shrink-0 transition-colors duration-300 ${isOver ? 'bg-sky-100' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <h3 className="font-semibold text-slate-700 mb-4 px-2">{title} <span className="text-sm font-normal text-slate-500">{todos.length}</span></h3>
            <div className="space-y-3 min-h-[50vh] flex flex-col">
                {todos.map(todo => (
                    <TaskCard 
                        key={todo.id} 
                        todo={todo}
                        {...props}
                    />
                ))}
            </div>
        </div>
    );
};


export const KanbanBoard: React.FC<KanbanBoardProps> = (props) => {
    const { todos } = props;
    const columns: { title: string, status: TodoStatus }[] = [
        { title: 'To Do', status: TodoStatus.TODO },
        { title: 'In Progress', status: TodoStatus.IN_PROGRESS },
        { title: 'Done', status: TodoStatus.DONE },
    ];

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map(col => (
                <KanbanColumn
                    key={col.status}
                    title={col.title}
                    status={col.status}
                    todos={todos.filter(t => t.status === col.status)}
                    {...props}
                />
            ))}
        </div>
    );
};
