import React, { useState } from 'react';
import { useTaskContext } from '@/contexts/TaskContext.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskItem from './TaskItem';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import TaskForm from './TaskForm';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const TaskList = () => {
  const { buildTaskTree, reorderTasks, getSortedTasks } = useTaskContext();
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  // Get tasks and apply sorting by priority
  const sortedTaskTree = buildTaskTree().map(task => ({
    ...task,
    priorityScore: task.priorityScore || 0
  })).sort((a, b) => b.priority - a.priority);

  // Filter completed tasks if needed
  const filteredTasks = showCompletedTasks 
    ? sortedTaskTree 
    : sortedTaskTree.filter(task => !task.completed);
  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end event
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const activeId = active.id;
      const overId = over.id;
      
      // Find the tasks
      const activeTask = findTaskById(filteredTasks, activeId);
      const overTask = findTaskById(filteredTasks, overId);
      
      // Only allow reordering within the same level
      if (activeTask && overTask && activeTask.parentTaskId === overTask.parentTaskId) {
        reorderTasks(activeId, overId, activeTask.parentTaskId);
      }
    }
  };

  // Helper to find a task by ID in the nested structure
  const findTaskById = (tasks, id) => {
    for (const task of tasks) {
      if (task.id === id) {
        return task;
      }
      
      if (task.children && task.children.length > 0) {
        const found = findTaskById(task.children, id);
        if (found) return found;
      }
    }
    
    return null;
  };

  // Get all task IDs for sortable context
  const getAllTaskIds = (tasks) => {
    return tasks.reduce((ids, task) => {
      const childIds = task.children ? getAllTaskIds(task.children) : [];
      return [...ids, task.id, ...childIds];
    }, []);
  };

  // Extract all task IDs for the sortable context
  const taskIds = getAllTaskIds(filteredTasks);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Task List</CardTitle>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="show-completed" 
              checked={showCompletedTasks}
              onCheckedChange={setShowCompletedTasks}
            />
            <Label htmlFor="show-completed" className="text-sm font-medium">
              Show completed tasks
            </Label>
          </div>
          <Button 
            size="sm" 
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showTaskForm && (
          <div className="mb-6">
            <TaskForm 
              onSuccess={() => setShowTaskForm(false)}
              onCancel={() => setShowTaskForm(false)}
            />
          </div>
        )}
        
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks found. Create your first task to get started!</p>
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={taskIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {filteredTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    level={0} 
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList;
