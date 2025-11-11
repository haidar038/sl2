import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Navbar = () => {
    const { user, session, signOut } = useAuth();
    const navigate = useNavigate();

    // Determine authentication state from the auth context
    const isAuthenticated = !!user && !!session;

    const getUserInitials = () => {
        if (user?.user_metadata?.full_name) {
            const names = user.user_metadata.full_name.split(" ");
            if (names.length >= 2) {
                return `${names[0][0]}${names[1][0]}`.toUpperCase();
            }
            return names[0][0].toUpperCase();
        }
        if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return "U";
    };

    const getDisplayName = () => {
        if (user?.user_metadata?.full_name) {
            return user.user_metadata.full_name;
        }
        if (user?.email) {
            return user.email;
        }
        return "User";
    };

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl transition-opacity duration-200 hover:opacity-80">
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <LinkIcon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="bg-gradient-primary bg-clip-text text-transparent">ShortLink</span>
                </Link>

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user?.user_metadata?.avatar_url} alt={getDisplayName()} />
                                        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">{getUserInitials()}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    <span>Dashboard</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive hover:bg-destructive hover:text-white focus:bg-destructive focus:text-white">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Link to="/auth">
                                <Button variant="ghost">Sign In</Button>
                            </Link>
                            <Link to="/auth">
                                <Button>Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};
