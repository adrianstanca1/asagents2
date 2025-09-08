import React, { useState, useRef, useEffect } from 'react';
import { Todo, SubTask, TodoPriority, TodoStatus, User } from '../types';
import { PriorityDisplay } from './ui/PriorityDisplay';
import { ReminderControl } from './ReminderControl';
import { Button } from './ui/Button';

interface TaskCardProps {
    todo: Todo;
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

const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    // Adjust for timezone offset to get the correct local date
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

export const TaskCard: React.FC<TaskCardProps> = (props) => {
    const { 
        todo, onUpdateTodo, onUpdateSubTask, canManageTasks, user, addToast, onRefreshData,
        onAddSubTask, onDeleteSubTask, newSubTaskText, setNewSubTaskText,
        editingSubTask, setEditingSubTask, editingSubTaskText, setEditingSubTaskText
    } = props;
    
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editText, setEditText] = useState(todo.text);
    const titleInputRef = useRef<HTMLInputElement>(null);
    
    const [isEditingDueDate, setIsEditingDueDate] = useState(false);
    const dueDateInputRef = useRef<HTMLInputElement>(null);
    
    const [isEditingPriority, setIsEditingPriority] = useState(false);
    const prioritySelectRef = useRef<HTMLSelectElement>(null);

    const subtaskInputRef = useRef<HTMLInputElement>(null);
    const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);

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

    useEffect(() => {
        if (editingSubTask) {
            subtaskInputRef.current?.focus();
            subtaskInputRef.current?.select();
        }
    }, [editingSubTask]);

    const handleSaveTitle = () => {
        if (editText.trim() && editText !== todo.text) {
            onUpdateTodo(todo.id, { text: editText });
        }
        setIsEditingTitle(false);
    };
    
    const handleSaveDueDate = (e: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
        const newDateValue = (e.target as HTMLInputElement).value;
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

    const handleSaveSubTaskText = () => {
        if (editingSubTask && editingSubTaskText.trim()) {
            const originalSubTask = todo.subTasks?.find(st => st.id === editingSubTask.subTaskId);
            if (originalSubTask && originalSubTask.text !== editingSubTaskText) {
                onUpdateSubTask(editingSubTask.todoId, editingSubTask.subTaskId, { text: editingSubTaskText });
            }
        }
        setEditingSubTask(null);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (!canManageTasks) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('todoId', todo.id.toString());
        e.dataTransfer.setData('sourceStatus', todo.status);
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
                
                <div className="flex items-center gap-2">
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
                    {canManageTasks && <ReminderControl todo={todo} user={user} onReminderUpdate={onRefreshData} addToast={addToast} />}
                </div>
            </div>
            
            {(todo.subTasks && totalSubtasks > 0) || canManageTasks ? (
                <div className="mt-3 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <div className="flex items-center gap-1.5 font-semibold">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                           <span>Sub-tasks</span>
                        </div>
                        <span className="font-bold text-slate-600">{completedSubtasks}/{totalSubtasks}</span>
                    </div>
                    {totalSubtasks > 0 &&
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                            <div className="bg-sky-600 h-1.5 rounded-full transition-all" style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}></div>
                        </div>
                    }
                     <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                        {todo.subTasks?.map(st => (
                            <div key={st.id} className="group flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 rounded p-1">
                                <input
                                    type="checkbox"
                                    checked={st.completed}
                                    onChange={() => onUpdateSubTask(todo.id, st.id, { completed: !st.completed })}
                                    disabled={!canManageTasks}
                                    className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                                />
                                {editingSubTask?.subTaskId === st.id ? (
                                    <input
                                        ref={subtaskInputRef}
                                        type="text"
                                        value={editingSubTaskText}
                                        onChange={e => setEditingSubTaskText(e.target.value)}
                                        onBlur={handleSaveSubTaskText}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSaveSubTaskText(); if (e.key === 'Escape') setEditingSubTask(null); }}
                                        className="flex-grow p-0.5 border rounded-md text-sm"
                                    />
                                ) : (
                                    <span 
                                      onClick={() => { if (canManageTasks && !st.completed) { setEditingSubTask({ todoId: todo.id, subTaskId: st.id }); setEditingSubTaskText(st.text); }}}
                                      className={`flex-grow transition-colors duration-300 ${st.completed ? 'line-through text-slate-500' : 'text-slate-800'} ${canManageTasks && !st.completed ? 'cursor-pointer' : ''}`}
                                    >
                                        {st.text}
                                    </span>
                                )}
                                {canManageTasks && (
                                    <div className="ml-auto flex items-center pl-1">
                                    {confirmingDelete === st.id ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="text-xs font-semibold text-red-600 hover:underline"
                                                onClick={() => {
                                                    onDeleteSubTask(todo.id, st.id);
                                                    setConfirmingDelete(null);
                                                }}
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                className="text-xs text-slate-500 hover:underline"
                                                onClick={() => setConfirmingDelete(null)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                            <button onClick={() => { setEditingSubTask({ todoId: todo.id, subTaskId: st.id }); setEditingSubTaskText(st.text); }} className="p-1 rounded hover:bg-slate-200" title="Edit sub-task"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>
                                            <button onClick={() => setConfirmingDelete(st.id)} className="p-1 rounded hover:bg-slate-200" title="Delete sub-task"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                        </div>
                                    )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {canManageTasks && (
                        <form onSubmit={(e) => { e.preventDefault(); onAddSubTask(todo.id); }} className="mt-2 flex gap-2">
                            <input
                                type="text"
                                placeholder="Add a new sub-task..."
                                value={newSubTaskText[todo.id] || ''}
                                onChange={e => setNewSubTaskText(prev => ({ ...prev, [todo.id]: e.target.value }))}
                                className="flex-grow px-2 py-1 border rounded-md text-sm"
                            />
                            <Button size="sm" type="submit" variant="secondary" disabled={!(newSubTaskText[todo.id] || '').trim()}>Add</Button>
                        </form>
                    )}
                </div>
            ) : null}
        </div>
    );
};
