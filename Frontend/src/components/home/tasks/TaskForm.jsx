import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { taskSchema } from '@/schemas/taskValidation';
import { useTaskContext } from '@/contexts/TaskContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {showToast} from '@/utils/toast';
import moment from 'moment';


const TaskForm = ({ task, parentTaskId = null, onSuccess, onCancel }) => {
  const { createTask, updateTask, createSubtask, getTopLevelTasks } = useTaskContext();
  const isEditMode = !!task;
  const [isLoading, setIsLoading] = useState(false);
  
  // Format date for the form input (YYYY-MM-DD format)
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    // Adjust for timezone to prevent off-by-one errors
    const localDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return localDate.toISOString().split('T')[0];
  };

  const defaultValues = {
    title: task?.title || '',
    description: task?.description || '',
    dueDate: formatDateForInput(task?.dueDate || new Date()),
    weight: task?.weight || 3,
    parentTaskId: task?.parentTaskId || parentTaskId
  };

  const { register, handleSubmit, formState: { errors }, setValue,watch } = useForm({
    resolver: yupResolver(taskSchema),
    defaultValues
  });

    const topLevelTasks = getTopLevelTasks();

  const onSubmit = async (data) => {
    try {
        setIsLoading(true);
      const formattedData = {
        ...data,
        dueDate:moment(data.dueDate).format("YYYY-MM-DD")
      };
   
      if (isEditMode) {
        await updateTask(task.id, formattedData);
      } else if (parentTaskId) {
        await createSubtask(parentTaskId, formattedData);
      } else {
        await createTask(formattedData);
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error in form submission:', error);
        showToast.error(error.message || 'An error occurred while saving the task');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleDateChange = (date) => {
  //   console.log(date,'qqqqqqqqq')
  //   setValue('dueDate', date);
  // };

  const handleWeightChange = (value) => {
    setValue('weight', Number(value));
  };

  const handleParentChange = (value) => {
    setValue('parentTaskId', value === 'none' ? null : value);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Task' : parentTaskId ? 'Create Subtask' : 'Create Task'}</CardTitle>
        <CardDescription>
          {isEditMode 
            ? 'Update your task details' 
            : parentTaskId 
              ? 'Add a new subtask' 
              : 'Add a new task to your list'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Task title"
              {...register('title')}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Task description"
              {...register('description')}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
           
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
              defaultValue={defaultValues.dueDate}
              className={errors.dueDate ? 'border-red-500' : ''}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Priority Weight (1-5)</Label>
            <Select
              defaultValue={String(defaultValues.weight)}
              onValueChange={handleWeightChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority weight" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Very Low</SelectItem>
                <SelectItem value="2">2 - Low</SelectItem>
                <SelectItem value="3">3 - Medium</SelectItem>
                <SelectItem value="4">4 - High</SelectItem>
                <SelectItem value="5">5 - Critical</SelectItem>
              </SelectContent>
            </Select>
            {errors.weight && (
              <p className="text-red-500 text-sm">{errors.weight.message}</p>
            )}
          </div>

          {/* Parent task selection - only show for new tasks and not for subtasks */}
          {!isEditMode && !parentTaskId && topLevelTasks.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="parentTaskId">Parent Task (optional)</Label>
              <Select
                defaultValue={defaultValues.parentTaskId || 'none'}
                onValueChange={handleParentChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select parent task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top Level Task)</SelectItem>
                  {topLevelTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button loading={isLoading} type="submit">
            {isEditMode ? 'Update Task' : 'Create Task'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TaskForm;
