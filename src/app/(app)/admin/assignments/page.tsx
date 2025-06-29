
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Edit, Trash2, UserCheck, CalendarIcon, ChevronsUpDown, Loader2 } from 'lucide-react';
import type { User, PeerReviewAssignment, Questionnaire } from '@/types';
import { format } from 'date-fns';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { getActiveQuestionnairesAction } from '../questionnaires/actions';
import { useToast } from '@/hooks/use-toast';
import { getUsersAction } from '../staff/actions';


const UserCombobox = ({ users, selectedUser, onSelectUser, placeholder }: { users: User[], selectedUser?: User, onSelectUser: (user?: User) => void, placeholder: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-muted-foreground hover:text-foreground"
        >
          {selectedUser ? (
            <div className="flex items-center">
              <Avatar className="h-5 w-5 mr-2">
                <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.name} data-ai-hint="user avatar small" />
                <AvatarFallback>{selectedUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              {selectedUser.name}
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search user..." />
          <CommandList>
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.name}
                  onSelect={() => {
                    onSelectUser(user);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedUser?.id === user.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex items-center">
                     <Avatar className="h-5 w-5 mr-2">
                        <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar small" />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {user.name}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};


const AssignmentForm = ({ assignment, users, questionnaires, onSave, onCancel }: { assignment?: PeerReviewAssignment, users: User[], questionnaires: Questionnaire[], onSave: (data: Omit<PeerReviewAssignment, 'id'>) => void, onCancel: () => void }) => {
  const [reviewee, setReviewee] = useState<User | undefined>(assignment?.reviewee);
  const [reviewer, setReviewer] = useState<User | undefined>(assignment?.reviewer);
  const [questionnaireId, setQuestionnaireId] = useState<string | undefined>(assignment?.questionnaireId);
  const [dueDate, setDueDate] = useState<Date | undefined>(assignment ? new Date(assignment.dueDate) : undefined);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!reviewee || !reviewer || !questionnaireId || !dueDate) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all fields to create an assignment.",
      });
      return;
    }
    if (reviewee.id === reviewer.id) {
        toast({
            variant: "destructive",
            title: "Invalid Assignment",
            description: "A user cannot be assigned to review themselves.",
        });
        return;
    }
    onSave({
      reviewCycleId: assignment?.reviewCycleId || 'cycle_current', // Default or select cycle
      reviewee,
      reviewer,
      questionnaireId,
      status: assignment?.status || 'pending',
      dueDate: format(dueDate, 'yyyy-MM-dd'),
    });
  };
  
  const availableReviewers = useMemo(() => users.filter(u => u.id !== reviewee?.id), [users, reviewee]);

  useEffect(() => {
    // When reviewee is selected, if the currently selected reviewer is the same person, clear it.
    if (reviewee && reviewer && reviewee.id === reviewer.id) {
      setReviewer(undefined);
    }
  }, [reviewee, reviewer]);

  return (
     <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
            <CardTitle>{assignment ? 'Edit' : 'Create New'} Peer Review Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label>Reviewee (Person to be reviewed)</Label>
                <UserCombobox users={users} selectedUser={reviewee} onSelectUser={setReviewee} placeholder="Select reviewee..." />
            </div>
            <div>
                <Label>Reviewer (Person to give feedback)</Label>
                <UserCombobox users={availableReviewers} selectedUser={reviewer} onSelectUser={setReviewer} placeholder="Select reviewer..." />
            </div>
             <div>
                <Label htmlFor="questionnaire">Questionnaire</Label>
                <Select value={questionnaireId} onValueChange={setQuestionnaireId}>
                    <SelectTrigger id="questionnaire">
                        <SelectValue placeholder="Select questionnaire..." />
                    </SelectTrigger>
                    <SelectContent>
                        {questionnaires.map(q => (
                            <SelectItem key={q.id} value={q.id}>{q.name} (v{q.version})</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="dueDate"
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                    </PopoverContent>
                </Popover>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleSubmit}>Save Assignment</Button>
        </CardFooter>
     </Card>
  );
};


export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<PeerReviewAssignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeQuestionnaires, setActiveQuestionnaires] = useState<Questionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<PeerReviewAssignment | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [peerQuestionnaires, dbUsers] = await Promise.all([
            getActiveQuestionnairesAction('peer'),
            getUsersAction()
        ]);
        setActiveQuestionnaires(peerQuestionnaires);
        setUsers(dbUsers);
      } catch (error) {
        console.error("Failed to fetch page data", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load required data for assignments."
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);
  

  const handleSaveAssignment = (data: Omit<PeerReviewAssignment, 'id'>) => {
    // In a real app, this would be a server action to save to Firestore
    if (editingAssignment) {
      setAssignments(prev => prev.map(item => item.id === editingAssignment.id ? { ...item, ...data } as PeerReviewAssignment : item));
    } else {
      setAssignments(prev => [...prev, { ...data, id: `assign_${Date.now()}` }]);
    }
    toast({ title: "Success", description: "Assignment saved. (Client-side only for now)" });
    setIsFormOpen(false);
    setEditingAssignment(undefined);
  };
  
  const handleAddNew = () => {
    setEditingAssignment(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (assignment: PeerReviewAssignment) => {
    setEditingAssignment(assignment);
    setIsFormOpen(true);
  };
  
  const handleDelete = (id: string) => {
    // Add confirmation dialog here
    setAssignments(prev => prev.filter(item => item.id !== id));
    toast({ title: "Assignment Deleted", description: "Assignment removed. (Client-side only for now)" });
  };

  const filteredAssignments = assignments.filter(a => 
    a.reviewee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.reviewer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: PeerReviewAssignment['status']): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'outline'; // 'success' like styling needed
      case 'declined': return 'destructive';
      default: return 'default';
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Peer Review Assignments</h1>
         <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Assignment
        </Button>
      </div>

      {isFormOpen ? (
         <AssignmentForm 
            assignment={editingAssignment}
            users={users}
            questionnaires={activeQuestionnaires}
            onSave={handleSaveAssignment} 
            onCancel={() => { setIsFormOpen(false); setEditingAssignment(undefined); }}
        />
      ) : (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Current Assignments</CardTitle>
                <CardDescription>Oversee and manage all peer review pairings for the current review cycle. Note: Assignment data is not yet saved to the database.</CardDescription>
                 <Input 
                    placeholder="Search by reviewee or reviewer name..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm mt-2"
                />
            </CardHeader>
            <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredAssignments.length > 0 ? (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Reviewee</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Questionnaire</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredAssignments.map((a) => (
                    <TableRow key={a.id}>
                        <TableCell className="font-medium flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={a.reviewee.avatarUrl} alt={a.reviewee.name} />
                                <AvatarFallback>{a.reviewee.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            {a.reviewee.name}
                        </TableCell>
                        <TableCell className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={a.reviewer.avatarUrl} alt={a.reviewer.name} />
                                <AvatarFallback>{a.reviewer.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            {a.reviewer.name}
                        </TableCell>
                        <TableCell>{activeQuestionnaires.find(q => q.id === a.questionnaireId)?.name || a.questionnaireId}</TableCell>
                        <TableCell>{format(new Date(a.dueDate), "MMM dd, yyyy")}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={getStatusBadgeVariant(a.status)} className={cn("capitalize", a.status === 'completed' ? 'bg-green-100 text-green-700 border-green-300' : '')}>
                                {a.status.replace('_', ' ')}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(a)} title="Edit">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} title="Delete">
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            ) : (
                <div className="text-center py-10">
                <UserCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No assignments created yet.</p>
                 <Button className="mt-4" onClick={handleAddNew}>Create First Assignment</Button>
                </div>
            )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
