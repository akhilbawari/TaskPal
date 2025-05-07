import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskContext } from '@/contexts/TaskContext.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Grip, ChevronDown, ChevronRight, Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import TaskForm from './TaskForm';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TaskItem = ({ task, level = 0 }) => {
  const { toggleTaskCompletion, deleteTask, calculatePriorityScore } = useTaskContext();
  const [isExpanded, setIsExpanded] = useState(level < 1); // Auto-expand first level
  const [showNewSubtaskForm, setShowNewSubtaskForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Calculate priority score
  const priorityScore = calculatePriorityScore(task);
  
  // Setup sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ 
    id: task.id,
    disabled: showNewSubtaskForm || showEditForm
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${level * 1.5}rem`
  };

  // Handle toggle completion
  const handleToggleCompletion = (e) => {
    console.log(e,'eeeeeeee')
    e?.preventDefault?.();
    toggleTaskCompletion(task.id,e);
  };

  // Get badge color based on priority score
  const getBadgeVariant = (score) => {
    if (score >= 80) return 'destructive';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'primary';
    if (score >= 20) return 'secondary';
    return 'outline';
  };

  // Get due date formatting and color
  const getDueDateDisplay = () => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let textColor = 'text-muted-foreground';
    if (diffDays <= 0) textColor = 'text-red-500';
    else if (diffDays <= 2) textColor = 'text-orange-500';
    
    return (
      <span className={`flex items-center gap-1 text-sm ${textColor}`}>
        <Calendar className="h-3 w-3" />
        {format(dueDate, 'MMM d, yyyy')}
      </span>
    );
  };

  return (
    <>
      {/* Task Card */}
      <Card className={cn(
        "border shadow-sm transition-colors",
        task.completed ? "bg-slate-50 border-slate-200" : "bg-white",
        priorityScore >= 80 ? "border-l-4 border-l-red-500" : ""
      )}>
        <CardContent className="p-3">
          <div className="flex items-center">
            {/* Drag Handle */}
            <div 
              ref={setNodeRef} 
              {...attributes} 
              {...listeners}
              className="cursor-grab mr-1"
              style={style}
            >
              <Grip className="h-4 w-4 text-muted-foreground" />
            </div>
            
            {/* Expand/Collapse (if has children) */}
            {task.children?.length > 0 && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="mr-1"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            )}
            
            {/* Completion Checkbox */}
            <div className="mr-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={handleToggleCompletion}
                className="h-4 w-4"
              />
            </div>
            
            <div className="flex-grow">
              {/* Task Title and Description */}
              <div className="flex justify-between items-start">
                <div className={`${task.completed ? 'text-muted-foreground line-through' : ''}`}>
                  <div className="font-medium">{task.title}</div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground truncate max-w-md">
                      {task.description}
                    </p>
                  )}
                </div>
                
                {/* Task Weight and Actions */}
                <div className="flex items-center gap-2">
                  {/* Priority Badge */}
                  <Badge variant={getBadgeVariant(priorityScore)}>
                    Score: {Math.round(priorityScore)}
                  </Badge>
                  
                  {/* Due Date */}
                  {getDueDateDisplay()}
                  
                  {/* Weight */}
                  <span className="text-sm bg-slate-100 px-2 py-0.5 rounded">
                    Weight: {task.weight}
                  </span>
                  
                  {/* Actions */}
                  <div className="flex items-center">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setShowNewSubtaskForm(!showNewSubtaskForm)}
                      className="h-7 w-7"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setShowEditForm(!showEditForm)}
                      className="h-7 w-7"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => deleteTask(task.id)}
                      className="h-7 w-7 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Edit Form */}
          {showEditForm && (
            <div className="mt-4">
              <TaskForm 
                task={task} 
                onSuccess={() => setShowEditForm(false)}
                onCancel={() => setShowEditForm(false)}
              />
            </div>
          )}
          
          {/* New Subtask Form */}
          {showNewSubtaskForm && (
            <div className="mt-4">
              <TaskForm 
                parentTaskId={task.id} 
                onSuccess={() => setShowNewSubtaskForm(false)}
                onCancel={() => setShowNewSubtaskForm(false)}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Render Children if Expanded */}
      {isExpanded && task.children && task.children.length > 0 && (
        <div className="pl-4 space-y-3 mt-1">
          {task.children.map((childTask) => (
            <TaskItem 
              key={childTask.id} 
              task={childTask} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </>
  );
};

export default TaskItem;
