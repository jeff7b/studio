
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2, UserCog, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUsersAction, saveUserAction, deleteUserAction } from './actions';
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

const UserForm = ({ 
  user, 
  onSave, 
  onCancel,
  isSaving
}: { 
  user?: Partial<User>, 
  onSave: (data: Partial<User>) => void, 
  onCancel: () => void,
  isSaving: boolean
}) => {
  const [formData, setFormData] = useState<Partial<User>>(
    user ? { ...user } : { name: '', email: '', role: 'employee' }
  );

  const handleSave = () => {
    if(!formData.name || formData.name.trim() === '' || !formData.email || formData.email.trim() === '') {
      alert('Name and Email are required.');
      return;
    }
    onSave(formData);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{formData.id ? 'Edit' : 'Add New'} Staff Member</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Name</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">Email</Label>
          <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(p => ({...p, email: e.target.value}))} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">Role</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData(p => ({...p, role: value as User['role']}))}>
            <SelectTrigger id="role" className="col-span-3">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="team_leader">Team Leader</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save User'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default function AdminStaffPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | undefined>(undefined);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsersAction();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        variant: "destructive",
        title: "Error fetching users",
        description: "Could not load data from the server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async (data: Partial<User>) => {
    try {
      setIsSaving(true);
      await saveUserAction(data as any);
      toast({
        title: "Success",
        description: "User saved successfully.",
      });
      closeForm();
      fetchUsers();
    } catch (error: any) {
       console.error("Failed to save user:", error);
       toast({
        variant: "destructive",
        title: "Error saving user",
        description: error.message || "An error occurred while saving.",
      });
    } finally {
       setIsSaving(false);
    }
  };
  
  const handleAddNew = () => {
    setEditingUser(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (userId: string) => {
    try {
      await deleteUserAction(userId);
      toast({
        title: "User Deleted",
        description: "The user has been removed.",
      });
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not delete the user.",
      });
    }
  };
  
  const closeForm = () => {
    setIsFormOpen(false); 
    setEditingUser(undefined);
  };

  const getRoleBadgeVariant = (role: User['role']) => {
    switch(role) {
      case 'admin': return 'destructive';
      case 'team_leader': return 'default';
      case 'employee': return 'secondary';
      default: return 'outline';
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Staff</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Staff
            </Button>
          </DialogTrigger>
          {isFormOpen && (
            <UserForm 
              user={editingUser} 
              onSave={handleSaveUser} 
              onCancel={closeForm} 
              isSaving={isSaving}
            />
          )}
        </Dialog>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Staff List</CardTitle>
          <CardDescription>Add, edit, and remove staff members from the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        {user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">{user.role.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} title="Edit User">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Delete User">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the user and their associated data.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(user.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <UserCog className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No staff members found.</p>
              <Button className="mt-4" onClick={handleAddNew}>
                Add Your First Staff Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
