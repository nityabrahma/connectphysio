
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LifeBuoy,
  LogOut,
  Settings,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useUsers } from "@/hooks/use-users";

export function UserNav() {
  const { user, logout } = useAuth();
  const { users } = useUsers();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const handleSwitchUser = (email: string) => {
    logout();
    router.push(`/login?email=${encodeURIComponent(email)}`);
  };

  const getFirstLetters = (name: string) => {
    if (!name) return "";

    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.charAt(0).toUpperCase() || "";
    const last =
      parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : "";

    return first + last;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-gradient-to-br from-primary via-primary/80 to-accent text-primary-foreground font-semibold">
              {getFirstLetters(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <Badge variant="outline" className="capitalize">
              {user.role}
            </Badge>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Users />
              Switch User (Demo)
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {users.map((demoUser) => (
                  <DropdownMenuItem
                    key={demoUser.email}
                    onClick={() => handleSwitchUser(demoUser.email)}
                  >
                    <span>
                      {demoUser.name}{" "}
                      <span className="text-muted-foreground capitalize">
                        ({demoUser.role})
                      </span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
