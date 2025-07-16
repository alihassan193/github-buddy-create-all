
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useClubSession } from "@/context/ClubSessionContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ClubSessionDialog from "./ClubSessionDialog";
import ClubSessionHistoryDialog from "./ClubSessionHistoryDialog";
import { Clock, DollarSign, History } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isSessionActive } = useClubSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionDialogType, setSessionDialogType] = useState<'open' | 'close'>('open');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSessionAction = (type: 'open' | 'close') => {
    setSessionDialogType(type);
    setSessionDialogOpen(true);
  };

  // Show session controls for managers and admins
  const canManageSession = user && (user.role === 'manager' || user.role === 'sub_admin' || user.role === 'super_admin');

  return (
    <>
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                Snooker Club
              </Link>
              {user && (
                <nav className="hidden md:flex space-x-8">
                  <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link to="/tables" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Tables
                  </Link>
                  <Link to="/sessions" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Sessions
                  </Link>
                  <Link to="/invoices" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Invoices
                  </Link>
                  <Link to="/canteen" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Canteen
                  </Link>
                  {(user.role === 'super_admin' || user.role === 'sub_admin' || user.role === 'manager') && (
                    <Link to="/reports" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Reports
                    </Link>
                  )}
                  {(user.role === 'super_admin' || user.role === 'sub_admin') && (
                    <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                      Admin
                    </Link>
                  )}
                </nav>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Club Session Controls */}
              {canManageSession && (
                <div className="flex items-center gap-2">
                  {/* Session History Button */}
                  <ClubSessionHistoryDialog 
                    trigger={
                      <Button variant="ghost" size="sm">
                        <History className="h-4 w-4" />
                      </Button>
                    }
                  />

                  {isSessionActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSessionAction('close')}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Close Session
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSessionAction('open')}
                      className="border-green-200 text-green-600 hover:bg-green-50"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Open Session
                    </Button>
                  )}
                  
                  {/* Session Status Indicator */}
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isSessionActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isSessionActive ? 'Session Active' : 'Session Closed'}
                  </div>
                </div>
              )}

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://github.com/shadcn.png" alt={user.username} />
                        <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.username}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button>Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <ClubSessionDialog
        open={sessionDialogOpen}
        onOpenChange={setSessionDialogOpen}
        type={sessionDialogType}
      />
    </>
  );
};

export default Navbar;
