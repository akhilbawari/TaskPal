import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { useTaskContext } from '@/contexts/TaskContext.jsx'
import { Button } from '@/components/ui/button'
import { ListTodo, Calendar, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

function Dashboard() {
  const { getUrgentTasks, tasks } = useTaskContext()
  const navigate = useNavigate()
  
  // Get today's tasks
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate)
    return format(taskDate, 'yyyy-MM-dd') === todayStr && !task.completed
  })
  
  // Get urgent tasks
  const urgentTasks = getUrgentTasks()
  
  // Get count of completed tasks
  const completedTasksCount = tasks.filter(task => task.completed).length
  const totalTasksCount = tasks.length
  const completionRate = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your task management dashboard
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasksCount}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasksCount} tasks completed ({completionRate}%)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayTasks.length > 0 ? 'Tasks need your attention' : 'No tasks due today'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Urgent Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              High priority tasks based on due date and weight
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Task Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Urgent Tasks Widget */}
        <Card>
          <CardHeader>
            <CardTitle>Urgent Tasks</CardTitle>
            <CardDescription>Your highest priority tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {urgentTasks.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                No urgent tasks at the moment
              </p>
            ) : (
              <div className="space-y-2">
                {urgentTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center p-2 border rounded-md">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-3" />
                    <div className="flex-grow">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/home/tasks')} className="w-full">
              View All Tasks
            </Button>
          </CardFooter>
        </Card>
        
        {/* Task Views Widget */}
        <Card>
          <CardHeader>
            <CardTitle>Task Views</CardTitle>
            <CardDescription>Different ways to manage your tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/home/tasks')} 
                className="h-24 flex flex-col items-center justify-center space-y-2"
              >
                <ListTodo className="h-6 w-6" />
                <span>List View</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/home/calendar')} 
                className="h-24 flex flex-col items-center justify-center space-y-2"
              >
                <Calendar className="h-6 w-6" />
                <span>Calendar View</span>
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/home/tasks')} className="w-full">
              Open Task Manager
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard