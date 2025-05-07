import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useTaskContext } from '@/contexts/TaskContext.jsx';
import { format, isSameDay, isToday, isTomorrow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const TaskCalendar = () => {
  const { tasks, calculatePriorityScore, toggleTaskCompletion } = useTaskContext();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [calendarView, setCalendarView] = useState('month'); // 'month' or 'week'
  const [hoveredTask, setHoveredTask] = useState(null);
  
  // Ensure initial selectedDate is valid
  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate.getTime())) {
      setSelectedDate(new Date());
    }
  }, []);
  
  // Group tasks by due date
  const tasksByDate = tasks.reduce((acc, task) => {
    try {
      const dueDate = new Date(task.dueDate);
      if (isNaN(dueDate.getTime())) return acc;
      
      const dateKey = format(dueDate, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push({
        ...task,
        priorityScore: calculatePriorityScore(task)
      });
    } catch (error) {
      console.error('Error processing task date:', error);
    }
    return acc;
  }, {});
  // Get tasks for the selected date
  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const tasksForSelectedDate = tasksByDate[selectedDateKey] || [];
  
  // Sort tasks by priority score
  const sortedTasks = [...tasksForSelectedDate].sort((a, b) => b.priorityScore - a.priorityScore);
  
  // Get upcoming tasks (next 7 days)
  const getUpcomingTasks = () => {
    const today = new Date();
    const upcoming = [];
    
    // Look through the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (tasksByDate[dateKey]) {
        upcoming.push({
          date,
          tasks: tasksByDate[dateKey]
        });
      }
    }
    
    return upcoming;
  };
  
  // Handle task completion toggle
  const handleToggleCompletion = (taskId,isCompleted) => {
    toggleTaskCompletion(taskId,isCompleted);
  };
  
  // Render tasks list for selected date
  const renderTaskList = () => {
    if (sortedTasks.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
          <p>No tasks due on {format(selectedDate, 'MMMM d, yyyy')}</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {sortedTasks.map(task => (
          <div 
            key={task.id} 
            className={cn(
              "p-3 rounded-md border transition-all duration-200",
              task.completed ? 'bg-slate-50 border-slate-200' : 'bg-white hover:border-blue-300 hover:shadow-sm',
              hoveredTask === task.id ? 'border-blue-400 shadow-sm' : ''
            )}
            onMouseEnter={() => setHoveredTask(task.id)}
            onMouseLeave={() => setHoveredTask(null)}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-start gap-2">
                <div 
                  className="mt-1 cursor-pointer"
                  onClick={(e) => handleToggleCompletion(task.id, !task.completed)}
                >
                  
                  <div className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center",
                    task.completed ? 'bg-green-100 border-green-400' : 'border-gray-300'
                  )}>
                    {task.completed && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </div>
                </div>
                <div className={task.completed ? 'line-through text-muted-foreground' : ''}>
                  <div className="font-medium">{task.title}</div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground truncate max-w-[300px]">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge 
                  variant={task.priorityScore >= 70 ? 'destructive' : 
                         task.priorityScore >= 40 ? 'warning' : 'secondary'}
                  className="whitespace-nowrap"
                >
                  Priority: {task.weight}
                </Badge>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                  Score: {Math.round(task.priorityScore)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render upcoming tasks section
  const renderUpcomingTasks = () => {
    const upcoming = getUpcomingTasks();
    
    if (upcoming.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          No upcoming tasks in the next 7 days
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {upcoming.map(({ date, tasks }) => (
          <div key={format(date, 'yyyy-MM-dd')} className="border-b pb-2 last:border-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className={cn(
                "font-medium text-sm",
                isToday(date) ? 'text-blue-600' : 
                isTomorrow(date) ? 'text-purple-600' : ''
              )}>
                {isToday(date) ? 'Today' : 
                 isTomorrow(date) ? 'Tomorrow' : 
                 format(date, 'EEEE, MMM d')}
              </h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedDate(date)}
                className="h-7 text-xs"
              >
                View
              </Button>
            </div>
            <div className="space-y-1">
              {tasks.slice(0, 3).map(task => (
                <div 
                  key={task.id} 
                  className={cn(
                    "text-sm p-2 rounded border-l-2",
                    task.completed ? 'bg-slate-50 border-l-green-400' : 
                    task.priorityScore >= 70 ? 'border-l-red-500' :
                    task.priorityScore >= 40 ? 'border-l-orange-400' :
                    'border-l-blue-400'
                  )}
                >
                  <div className="flex justify-between">
                    <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                      {task.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Weight: {task.weight}
                    </span>
                  </div>
                </div>
              ))}
              {tasks.length > 3 && (
                <div className="text-xs text-right text-muted-foreground">
                  +{tasks.length - 3} more tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Custom day render function to show task count
  const renderDay = (day, selectedDay, dayProps) => {
    // Make sure day is a valid Date object before formatting
    if (!day || !(day instanceof Date) || isNaN(day.getTime())) {
      // Return the original children without modification
      return dayProps.children;
    }
    
    try {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayTasks = tasksByDate[dateKey] || [];
      const hasHighPriorityTask = dayTasks.some(task => 
        calculatePriorityScore(task) >= 70 && !task.completed
      );
      const hasCompletedTasks = dayTasks.some(task => task.completed);
      const hasIncompleteTasks = dayTasks.some(task => !task.completed);
      const isCurrentDay = isSameDay(day, selectedDate);
      
      // We need to modify the content of the cell, not replace the cell itself
      const className = cn(
        dayProps.className,
        isCurrentDay ? 'bg-blue-100 text-blue-900 font-semibold rounded-md' : '',
        hasHighPriorityTask ? 'font-bold' : ''
      );
      
      // Create a custom content for the day cell
      const customContent = (
        <>
          <span className="relative inline-flex items-center justify-center w-full h-full">
            {day.getDate()}
            {dayTasks.length > 0 && (
              <span className="absolute bottom-1 flex items-center justify-center space-x-0.5">
                {hasIncompleteTasks && (
                  <span 
                    className={cn(
                      "inline-block w-1.5 h-1.5 rounded-full",
                      hasHighPriorityTask ? 'bg-red-500' : 'bg-blue-500'
                    )}
                    aria-label={`${dayTasks.filter(t => !t.completed).length} incomplete tasks`}
                  />
                )}
                {hasCompletedTasks && (
                  <span 
                    className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" 
                    aria-label={`${dayTasks.filter(t => t.completed).length} completed tasks`}
                  />
                )}
              </span>
            )}
          </span>
        </>
      );
      
      // Clone the original element with updated props
      return React.cloneElement(dayProps.children, {
        className,
        children: customContent
      });
    } catch (error) {
      console.error('Error rendering day:', error);
      return dayProps.children;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Task Calendar</CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            variant={calendarView === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setCalendarView('month')}
            className="h-8"
          >
            Month
          </Button>
          <Button 
            variant={calendarView === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setCalendarView('week')}
            className="h-8"
          >
            Week
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Calendar - Takes 5 columns on medium screens */}
          <div className="md:col-span-5 space-y-4">
            <div className="border rounded-md p-4 bg-white">
              <Calendar
                mode="single"
                selected={selectedDate}
                // value={selectedDate}
                onSelect={setSelectedDate}
                // className="mx-auto"
                // components={{
                //   Day: ({ day, selectedDay, ...dayProps }) => 
                //     renderDay(day, selectedDay, dayProps)
                // }}
              />
            </div>
            
            {/* Upcoming tasks section */}
            <div className="border rounded-md p-4 bg-white">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
                Upcoming Tasks
              </h3>
              {renderUpcomingTasks()}
            </div>
          </div>
          
          {/* Task details - Takes 7 columns on medium screens */}
          <div className="md:col-span-7">
            <div className="border rounded-md p-4 bg-white h-full">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                <span className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Tasks for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </span>
                {isToday(selectedDate) && (
                  <Badge variant="primary">Today</Badge>
                )}
                {isTomorrow(selectedDate) && (
                  <Badge variant="secondary">Tomorrow</Badge>
                )}
              </h3>
              {renderTaskList()}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button 
          variant="outline" 
          onClick={() => setSelectedDate(new Date())}
        >
          Today
        </Button>
        <div className="text-sm text-muted-foreground">
          {tasks.length} total tasks • {tasks.filter(t => t.completed).length} completed
        </div>
      </CardFooter>
    </Card>
  );
};

export default TaskCalendar;
