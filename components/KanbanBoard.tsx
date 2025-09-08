import React, { useState } from 'react';
import { Todo, TodoStatus, SubTask } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
    todos: Todo[];
    onUpdateTaskStatus: (todoId: number, newStatus: TodoStatus) => void;
    onUpdateTodo: (id: number, updates: Partial<Todo>) => void;
    onUpdateSubTask: (todoId: number, subTaskId: number, updates: Partial<SubTask>) => void;
    canManageTasks: boolean;
}

interface KanbanColumnProps {
    title: string;
    status: TodoStatus;
    todos: Todo[];
    onUpdateTaskStatus: (todoId: number, newStatus: TodoStatus) => void;
    onUpdateTodo: (id: number, updates: Partial<Todo>) => void;
    onUpdateSubTask: (todoId: number, subTaskId: number, updates: Partial<SubTask>) => void;
    canManageTasks: boolean;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, status, todos, onUpdateTaskStatus, onUpdateTodo, onUpdateSubTask, canManageTasks }) => {
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
        if (todoId) {
            onUpdateTaskStatus(todoId, status);
        }
    };

    return (
        <div 
            className={`bg-slate-100 rounded-xl p-3 w-80 flex-shrink-0 transition-colors duration-300 ${isOver ? 'bg-sky-100' : ''}`}
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
                        onUpdateTodo={onUpdateTodo}
                        onUpdateSubTask={onUpdateSubTask}
                        canManageTasks={canManageTasks}
                    />
                ))}
            </div>
        </div>
    );
};


export const KanbanBoard: React.FC<KanbanBoardProps> = ({ todos, onUpdateTaskStatus, onUpdateTodo, onUpdateSubTask, canManageTasks }) => {
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
                    onUpdateTaskStatus={onUpdateTaskStatus}
                    onUpdateTodo={onUpdateTodo}
                    onUpdateSubTask={onUpdateSubTask}
                    canManageTasks={canManageTasks}
                />
            ))}
        </div>
    );
};