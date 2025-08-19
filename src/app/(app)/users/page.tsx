
'use client';

import { useUsers } from "@/hooks/use-users";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { UserForm } from "./user-form";
import type { User } from "@/types/domain";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UsersPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { users, addUser, updateUser, deleteUser } = useUsers();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [user, router]);


    const handleAddUser = () => {
        setSelectedUser(undefined);
        setIsFormOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsFormOpen(true);
    };

    const handleDeleteUser = (userId: string) => {
        deleteUser(userId);
    };

    const handleFormSubmit = (values: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash'> & { password?: string }) => {
        if (selectedUser) {
            updateUser(selectedUser.id, values);
        } else {
            // The register function from useUsers handles new user creation
            addUser({
                ...values,
                role: values.role || 'therapist', // default role
                password: values.password || 'password123' // default password
            });
        }
        setIsFormOpen(false);
    };
    
    if (user?.role !== 'admin') {
        return <p>Access Denied.</p>
    }

    // Filter out the current admin and patients
    const displayUsers = users.filter(u => u.role !== 'admin' && u.id !== user?.id);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <Button onClick={handleAddUser}>
                    <PlusCircle />
                    Add New User
                </Button>
            </div>
            
            <DataTable 
                columns={columns({ onEdit: handleEditUser, onDelete: handleDeleteUser })} 
                data={displayUsers} 
            />

            <UserForm 
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={handleFormSubmit}
                user={selectedUser}
            />
        </div>
    );
}
