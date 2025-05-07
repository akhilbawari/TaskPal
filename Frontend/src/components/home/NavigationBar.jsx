import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";
import { LayoutDashboard, Menu, X, ThermometerSnowflake, Calendar, CheckCircle, CircleCheckBig } from "lucide-react";
import { Button } from "../ui/button";

const navigation = [
  { name: "Dashboard", href: "/home", icon: LayoutDashboard },
  { name: "Tasks", href: "/home/tasks", icon: CircleCheckBig },
  { name: "Calendar", href: "/home/calendar", icon: Calendar },
];

function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu when screen size becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navigation Menu */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r bg-card transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:fixed",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col gap-2">
          <div className="border-b">
          <div className="flex h-16 items-center gap-3 px-6 bg-gradient-to-r from-primary to-accent text-white shadow-md">
      <CheckCircle size={28} strokeWidth={2.5} />
      <div className="flex flex-col">
        <span className="text-2xl font-bold tracking-tight">TaskPal</span>
        <span className="text-xs font-medium text-primary-foreground">Your tasks, simplified</span>
      </div>
    </div>
          </div>

          <div className="flex-1 space-y-1 p-4">
            <nav className="flex flex-1 flex-col gap-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-primary hover:text-primary-foreground",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    )
                  }
                  end
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}

export default NavigationBar;
