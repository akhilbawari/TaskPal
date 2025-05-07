import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import TaskList from './TaskList';
import TaskCalendar from './TaskCalendar';
import { useTaskContext } from '@/contexts/TaskContext.jsx';

const Tasks = () => {
  const { getUrgentTasks, calculatePriorityScore } = useTaskContext();
  const [activeTab, setActiveTab] = useState('list');
  
  // Get top 5 urgent tasks
  const urgentTasks = getUrgentTasks();
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">Task Manager</h1>
        <p className="text-muted-foreground">
          Organize your tasks, set priorities, and track your progress
        </p>
      </div>
      
      {/* Urgent Tasks Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Tasks</CardTitle>
          <CardDescription>Your 5 most urgent tasks based on due date and weight</CardDescription>
        </CardHeader>
        <CardContent>
          {urgentTasks.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              No urgent tasks at the moment. Great job!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {urgentTasks.map(task => (
                <Card key={task.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className={task.completed ? 'line-through text-muted-foreground' : ''}>
                        <div className="font-medium">{task.title}</div>
                        <p className="text-sm text-muted-foreground">
                          Score: {Math.round(calculatePriorityScore(task))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Main Task Views */}
      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-6">
          <TaskList />
        </TabsContent>
        <TabsContent value="calendar" className="mt-6">
          <TaskCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
