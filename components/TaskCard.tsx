import React, { useState, useRef, useEffect } from 'react';
import { Todo, SubTask, TodoPriority, TodoStatus } from '../types';
import { PriorityDisplay } from './ui/PriorityDisplay';

interface TaskCardProps {
    todo: Todo;
    onUpdateTodo: (id: number, updates: Partial<Todo>) => void;
    onUpdateSubTask: (todoId: number, subTaskId: number, updates: Partial<SubTask>) => void;
    canManageTasks: boolean;
}

const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    // Adjust for timezone offset to get the correct local date
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

export const TaskCard: React.FC<TaskCardProps> = ({ todo, onUpdateTodo, onUpdateSubTask, canManageTasks }) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editText, setEditText] = useState(todo.text);
    const titleInputRef = useRef<HTMLInputElement>(null);
    
    const [isEditingDueDate, setIsEditingDueDate] = useState(false);
    const dueDateInputRef = useRef<HTMLInputElement>(null);
    
    const [isEditingPriority, setIsEditingPriority] = useState(false);
    const prioritySelectRef = useRef<HTMLSelectElement>(null);

    const completedSubtasks = todo.subTasks?.filter(st => st.completed).length ?? 0;
    const totalSubtasks = todo.subTasks?.length ?? 0;
    
    useEffect(() => {
        if (isEditingTitle) {
            titleInputRef.current?.focus();
            titleInputRef.current?.select();
        }
    }, [isEditingTitle]);

    useEffect(() => {
        if (isEditingDueDate) {
            dueDateInputRef.current?.focus();
        }
    }, [isEditingDueDate]);
    
    useEffect(() => {
        if (isEditingPriority) {
            prioritySelectRef.current?.focus();
        }
    }, [isEditingPriority]);

    const handleSaveTitle = () => {
        if (editText.trim() && editText !== todo.text) {
            onUpdateTodo(todo.id, { text: editText });
        }
        setIsEditingTitle(false);
    };
    
    const handleSaveDueDate = (e: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
        const newDateValue = (e.target as HTMLInputElement).value;
        // The input gives a string "YYYY-MM-DD". Creating a Date from this can have timezone issues.
        // new Date('YYYY-MM-DD') creates a date at UTC midnight. We add 'T00:00:00' to parse it in the local timezone.
        const newDate = newDateValue ? new Date(newDateValue + 'T00:00:00') : undefined;
        
        const oldDateStr = todo.dueDate ? formatDateForInput(todo.dueDate) : '';

        if (newDateValue !== oldDateStr) {
            onUpdateTodo(todo.id, { dueDate: newDate });
        }
        setIsEditingDueDate(false);
    };
    
    const handleSavePriority = (e: React.FocusEvent<HTMLSelectElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const newPriority = (e.target as HTMLSelectElement).value as TodoPriority;
        if (newPriority !== todo.priority) {
            onUpdateTodo(todo.id, { priority: newPriority });
        }
        setIsEditingPriority(false);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (!canManageTasks) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('todoId', todo.id.toString());
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
    };

    const handleTitleClick = () => {
        if (canManageTasks) {
            setIsEditingTitle(true);
        }
    }

    const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date(new Date().setHours(0, 0, 0, 0)) && todo.status !== TodoStatus.DONE;
    
    return (
        <div
            draggable={canManageTasks}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`bg-white p-3 rounded-lg border shadow-sm transition-all duration-200 ${canManageTasks ? 'hover:shadow-md cursor-grab active:cursor-grabbing' : ''} ${isOverdue ? 'border-red-400/80' : 'border-gray-200'}`}
        >
            {isEditingTitle ? (
                 <input 
                    ref={titleInputRef}
                    type="text"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={e => { if(e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setIsEditingTitle(false); }}
                    className="w-full p-1 border rounded-md text-sm font-medium"
                />
            ) : (
                <p onClick={handleTitleClick} className={`font-medium text-slate-800 mb-2 break-words ${canManageTasks ? 'cursor-pointer' : ''}`}>{todo.text}</p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
                {isEditingDueDate ? (
                    <input
                        ref={dueDateInputRef}
                        type="date"
                        defaultValue={formatDateForInput(todo.dueDate)}
                        onBlur={handleSaveDueDate}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveDueDate(e); if (e.key === 'Escape') setIsEditingDueDate(false); }}
                        className="p-0.5 border rounded-md text-xs"
                    />
                ) : (
                    <div onClick={() => canManageTasks && setIsEditingDueDate(true)} className={`min-h-[22px] ${canManageTasks ? 'cursor-pointer' : ''}`}>
                    {todo.dueDate ? (
                        <div className={`flex items-center gap-1.5 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-slate-100'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
                        </div>
                    ) : (
                        canManageTasks ? <span className="text-slate-400 hover:text-slate-600 px-2 py-0.5">Set Date</span> : <span/>
                    )}
                    </div>
                )}
                
                {isEditingPriority ? (
                    <select
                        ref={prioritySelectRef}
                        defaultValue={todo.priority}
                        onBlur={handleSavePriority}
                        onChange={handleSavePriority}
                        onKeyDown={e => { if (e.key === 'Escape') setIsEditingPriority(false); }}
                        className="p-0.5 border rounded-md text-xs text-slate-700 bg-white"
                    >
                        {Object.values(TodoPriority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                ) : (
                    <div onClick={() => canManageTasks && setIsEditingPriority(true)} className={`px-2 py-0.5 rounded-md ${canManageTasks ? 'cursor-pointer hover:bg-slate-100' : ''}`}>
                        <PriorityDisplay priority={todo.priority} />
                    </div>
                )}
            </div>
            
            {(todo.subTasks && totalSubtasks > 0) && (
                <div className="mt-3 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <div className="flex items-center gap-1.5 font-semibold">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                           <span>Sub-tasks</span>
                        </div>
                        <span className="font-bold text-slate-600">{completedSubtasks}/{totalSubtasks}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                        <div className="bg-sky-600 h-1.5 rounded-full transition-all" style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}></div>
                    </div>
                     <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {todo.subTasks.map(st => (
                            <div key={st.id} className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={st.completed}
                                    onChange={() => onUpdateSubTask(todo.id, st.id, { completed: !st.completed })}
                                    disabled={!canManageTasks}
                                    className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                                    id={`subtask-${st.id}`}
                                />
                                <label htmlFor={`subtask-${st.id}`} className={`flex-grow ${st.completed ? 'line-through text-slate-500' : ''}`}>{st.text}</label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};