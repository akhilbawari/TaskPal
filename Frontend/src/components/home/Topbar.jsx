import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "@/redux/features/user/userSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import useMutation from "@/hooks/useMutation";
import { OAUTH_GOOGLE_AUTHORIZE,API_USER_ME } from "@/imports/api";
import useQuery from "@/hooks/useQuery";
import { Calendar, CalendarCheck } from "lucide-react";
function Topbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [isGoogleCalendarSubscribed,setIsGoogleCalendarSubscribed]=useState(false)
  const {data:meData}=useQuery(API_USER_ME)

  useEffect(()=>{
    if(meData){
      if(meData.data.data.google){
        setIsGoogleCalendarSubscribed(true)
      }
      console.log(meData,"meData")
    }
  },[meData])
  const {mutate}=useMutation()
  const handleSubscribeGoogleCalendar = async() => {
    const response=await mutate({
      url:OAUTH_GOOGLE_AUTHORIZE,
      method:"GET",
    })
    console.log(response)
    if(response.success){
    
      window.open(response.data,"_blank")
    }
    
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  return (
    <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Space for mobile menu button */}
        <div className="w-8 lg:hidden" />
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-4">
          </div>
          <div className="flex items-center space-x-4">
          {isGoogleCalendarSubscribed ? (
        <button 
          onClick={handleSubscribeGoogleCalendar}
          className="flex items-center px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-full font-medium transition-all duration-200 border border-green-300 shadow-sm"
        >
          <CalendarCheck className="mr-2 h-5 w-5" /> 
          <span>Subscribed</span>
        </button>
      ) : (
        <button 
          onClick={handleSubscribeGoogleCalendar}
          className="flex items-center px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 rounded-full font-medium transition-all duration-200 border border-gray-300 shadow-sm"
        >
          <Calendar className="mr-2 h-5 w-5 text-blue-500" /> 
          <span>Subscribe to Google Calendar</span>
        </button>
      )}   
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback>
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem
                  // onClick={() => navigate("/home/profile")}
                  className="flex-col items-start"
                >
                  <div className="text-sm font-medium text-foreground">
                    {user?.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user?.email}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={handleLogout}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="pl-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
