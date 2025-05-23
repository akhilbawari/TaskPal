import React, { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense } from "../components/ui/suspense";
import Topbar from "../components/home/Topbar";
import NavigationBar from "../components/home/NavigationBar";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { TaskProvider } from "../contexts/TaskContext.jsx";
import TaskCalendar from "@/components/home/tasks/TaskCalendar";

const Dashboard = lazy(() => import("../components/home/dashboard/dashboard"));
const Tasks = lazy(() => import("../components/home/tasks/Tasks"));
function HomeRoutes() {
  return (
    <ProtectedRoute>
      <TaskProvider>
        <Suspense>
          <div className="min-h-screen bg-background">
            <NavigationBar />
            <div className="lg:pl-72">
              <Topbar />
              <main className="container mx-auto py-6 px-4 lg:px-6">
                <Routes>
                  <Route path="" element={<Dashboard />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="calendar" element={<TaskCalendar />} />
                  <Route path="*" element={<Navigate replace to="/404" />} />
                </Routes>
              </main>
            </div>
          </div>
        </Suspense>
      </TaskProvider>
    </ProtectedRoute>
  );
}

export default HomeRoutes;
