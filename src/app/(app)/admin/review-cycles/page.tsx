
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, CalendarIcon, Loader2, Users, X, ChevronsUpDown, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { ReviewCycle, User } from '@/types';
import { cn } from '@/lib/utils';
import { getReviewCyclesAction, saveReviewCycleAction } from './actions';
import { getUsersAction } from '../staff/actions';
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// --- Reusable Multi User Select Component ---
const UserMultiSelect = ({ allUsers, selectedUserIds, onChange, disabled = false }: { allUsers: User[], selectedUserIds: string[], onChange: (ids: string[]) => void, disabled?: boolean }) => {
    const [open, setOpen] = useState(false);
    const selectedUsersMap = useMemo(() => new Map(allUsers.filter(u => selectedUserIds.includes(u.id)).map(u => [u.id, u])), [allUsers, selectedUserIds]);

    const handleSelect = (userId: string) => {
        onChange([...selectedUserIds, userId]);
        setOpen(false);
    };

    const handleDeselect = (userId: string) => {
        onChange(selectedUserIds.filter(id => id !== userId));
    };

    const availableUsers = allUsers.filter(u => !selectedUserIds.includes(u.id));

    return (
        <div>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                {Array.from(selectedUsersMap.values()).map(user => (
                    <Badge key={user.id} variant="secondary" className="pl-2">
                        <Avatar className="h-4 w-4 mr-1">
                           <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar small" />
                           <AvatarFallback>{user.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        {user.name}
                        {!disabled && <button type="button" onClick={() => handleDeselect(user.id)} className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"><X className="h-3 w-3" /></button>}
                    </Badge>
                ))}
                {selectedUserIds.length === 0 && <span className="text-sm text-muted-foreground p-1.5">No participants selected.</span>}
            </div>
             <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-2" disabled={disabled}>
                       <PlusCircle className="mr-2 h-4 w-4" /> Add Participant
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search user..." />
                        <CommandList>
                            <CommandEmpty>No users found.</CommandEmpty>
                            <CommandGroup>
                                {availableUsers.map((user) => (
                                <CommandItem key={user.id} value={user.name} onSelect={() => handleSelect(user.id)}>
                                    <div className="flex items-center">
                                        <Avatar className="h-5 w-5 mr-2">
                                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                                            <AvatarFallback>{user.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
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
        </div>
    );
};


const ReviewCycleForm = ({ cycle, users, onSave, onCancel, isSaving }: { cycle?: Partial<ReviewCycle>, users: User[], onSave: (data: any) => void, onCancel: () => void, isSaving: boolean }) => {
  const [name, setName] = useState(cycle?.name || '');
  const [status, setStatus] = useState<ReviewCycle['status']>(cycle?.status || 'draft');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
      from: cycle?.startDate ? parseISO(cycle.startDate) : undefined,
      to: cycle?.endDate ? parseISO(cycle.endDate) : undefined,
  });
  const [participantIds, setParticipantIds] = useState<string[]>(cycle?.participantIds || []);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!name || !dateRange?.from || !dateRange?.to || participantIds.length === 0) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please fill out all fields to save the cycle." });
      return;
    }
    onSave({
        id: cycle?.id,
        name,
        status,
        startDate: dateRange.from,
        endDate: dateRange.to,
        participantIds
    });
  };

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{cycle?.id ? 'Edit' : 'Create New'} Review Cycle</DialogTitle>
        <DialogDescription>Define the timeline, participants, and status for a review period.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-6 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Cycle Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right">Date Range</Label>
          <div className="col-span-3">
             <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
          </div>
        </div>
         <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="text-right">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as ReviewCycle['status'])}>
              <SelectTrigger id="status" className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Participants</Label>
            <div className="col-span-3">
                <UserMultiSelect allUsers={users} selectedUserIds={participantIds} onChange={setParticipantIds} />
            </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Cycle
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default function AdminReviewCyclesPage() {
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCycle, setEditingCycle] = useState<Partial<ReviewCycle> | undefined>(undefined);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [cyclesData, usersData] = await Promise.all([
        getReviewCyclesAction(),
        getUsersAction()
      ]);
      setCycles(cyclesData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load required page data." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveCycle = async (data: any) => {
    try {
      setIsSaving(true);
      await saveReviewCycleAction(data);
      toast({ title: "Success", description: "Review cycle saved successfully." });
      closeForm();
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to save review cycle:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not save review cycle." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNew = () => {
    setEditingCycle(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (cycle: ReviewCycle) => {
    setEditingCycle(cycle);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCycle(undefined);
  };
  
  const getStatusBadgeVariant = (status: ReviewCycle['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Review Cycles</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-5 w-5" /> Create New Cycle</Button>
          </DialogTrigger>
          {isFormOpen && (
            <ReviewCycleForm
                cycle={editingCycle}
                users={users}
                onSave={handleSaveCycle}
                onCancel={closeForm}
                isSaving={isSaving}
            />
          )}
        </Dialog>
      </div>

       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Review Cycles</CardTitle>
          <CardDescription>Oversee all past, present, and future review periods.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : cycles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead className="text-center">Participants</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{format(parseISO(c.startDate), "MMM dd, yyyy")} - {format(parseISO(c.endDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-center">{c.participantIds.length}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant={getStatusBadgeVariant(c.status)} className={cn("capitalize", c.status === 'active' ? 'bg-green-100 text-green-700 border-green-300' : '')}>
                           {c.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} title="Edit">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-10">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No review cycles created yet.</p>
                 <Button className="mt-4" onClick={handleAddNew}>Create First Cycle</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
