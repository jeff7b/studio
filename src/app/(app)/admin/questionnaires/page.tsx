"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2, Eye, FileText, Users, X, GripVertical } from 'lucide-react';
import type { Questionnaire, Question } from '@/types';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock Data
const mockQuestionnaires: Questionnaire[] = [
  { 
    id: 'qnn1', name: 'Standard Self-Review Q3', type: 'self', isActive: true,
    questions: [
      { id: 'sq1', text: 'What were your major accomplishments?', order: 1 },
      { id: 'sq2', text: 'What challenges did you face?', order: 2 },
    ],
    description: 'Quarterly self-assessment for all employees.',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  { 
    id: 'qnn2', name: 'Engineering Peer Feedback', type: 'peer', isActive: true,
    questions: [
      { id: 'pq1', text: 'How well did this peer collaborate?', order: 1 },
      { id: 'pq2', text: 'Comment on their technical contributions.', order: 2 },
    ],
    description: 'Peer feedback specific to engineering roles.',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  { 
    id: 'qnn3', name: 'Leadership Self-Assessment (Draft)', type: 'self', isActive: false,
    questions: [],
    description: 'Self-assessment for team leads and managers.',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

const emptyQuestionnaire: Omit<Questionnaire, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
  type: 'self',
  questions: [{ id: Date.now().toString(), text: '', order: 1 }],
  isActive: true,
};

const QuestionnaireForm = ({ questionnaire, onSave, onCancel }: { questionnaire?: Questionnaire, onSave: (q: Questionnaire) => void, onCancel: () => void }) => {
  const [formData, setFormData] = useState<Omit<Questionnaire, 'id' | 'createdAt' | 'updatedAt'>>(
    questionnaire ? { ...questionnaire } : { ...emptyQuestionnaire }
  );

  const handleInputChange = (field: keyof Omit<Questionnaire, 'id' | 'createdAt' | 'updatedAt' | 'questions' | 'type' | 'isActive'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (index: number, text: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[index].text = text;
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { id: Date.now().toString(), text: '', order: prev.questions.length + 1 }]
    }));
  };

  const removeQuestion = (index: number) => {
    if (formData.questions.length <= 1) return; // Keep at least one question
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    // Re-order
    newQuestions.forEach((q, i) => q.order = i + 1);
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };
  
  const handleSave = () => {
    const finalData: Questionnaire = questionnaire 
      ? { ...formData, id: questionnaire.id, createdAt: questionnaire.createdAt, updatedAt: new Date().toISOString() }
      : { ...formData, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    onSave(finalData);
  };

  return (
    <DialogContent className="sm:max-w-[625px] max-h-[90vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>{questionnaire ? 'Edit' : 'Create New'} Questionnaire</DialogTitle>
        <DialogDescription>
          {questionnaire ? 'Modify the details of this questionnaire.' : 'Define a new set of questions for reviews.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4 flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Name</Label>
          <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">Description</Label>
          <Textarea id="description" value={formData.description || ''} onChange={(e) => handleInputChange('description', e.target.value)} className="col-span-3" rows={2} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right">Type</Label>
          <select 
            id="type" 
            value={formData.type} 
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'self' | 'peer' }))} 
            className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="self">Self-Review</option>
            <option value="peer">Peer-Review</option>
          </select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="isActive" className="text-right">Active</Label>
          <Switch 
            id="isActive" 
            checked={formData.isActive} 
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))} 
            className="col-span-3" 
          />
        </div>
        <div className="col-span-4 space-y-3 mt-2">
          <Label className="text-base font-medium">Questions</Label>
          {formData.questions.map((q, index) => (
            <div key={q.id || index} className="flex items-start gap-2">
              <Button variant="ghost" size="icon" className="mt-1 cursor-grab" disabled><GripVertical className="h-4 w-4 text-muted-foreground" /></Button>
              <Textarea
                placeholder={`Question ${index + 1}`}
                value={q.text}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button variant="ghost" size="icon" onClick={() => removeQuestion(index)} disabled={formData.questions.length <= 1}>
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addQuestion} size="sm" className="mt-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save Questionnaire</Button>
      </DialogFooter>
    </DialogContent>
  );
};


export default function AdminQuestionnairesPage() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(mockQuestionnaires);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<Questionnaire | undefined>(undefined);

  const handleSaveQuestionnaire = (q: Questionnaire) => {
    if (editingQuestionnaire) {
      setQuestionnaires(prev => prev.map(item => item.id === q.id ? q : item));
    } else {
      setQuestionnaires(prev => [...prev, { ...q, id: Date.now().toString() }]);
    }
    setIsFormOpen(false);
    setEditingQuestionnaire(undefined);
  };
  
  const handleAddNew = () => {
    setEditingQuestionnaire(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (q: Questionnaire) => {
    setEditingQuestionnaire(q);
    setIsFormOpen(true);
  };
  
  const handleDelete = (id: string) => {
    // Add confirmation dialog here
    setQuestionnaires(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Questionnaires</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-5 w-5" /> Create New Questionnaire
            </Button>
          </DialogTrigger>
          {isFormOpen && ( /* Conditionally render form to reset state */
            <QuestionnaireForm 
              questionnaire={editingQuestionnaire} 
              onSave={handleSaveQuestionnaire} 
              onCancel={() => { setIsFormOpen(false); setEditingQuestionnaire(undefined); }} 
            />
          )}
        </Dialog>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Questionnaire Templates</CardTitle>
          <CardDescription>Define and manage the sets of questions used for self and peer reviews.</CardDescription>
        </CardHeader>
        <CardContent>
          {questionnaires.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Questions</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionnaires.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.name}</TableCell>
                    <TableCell>
                      <Badge variant={q.type === 'self' ? 'default' : 'secondary'} className="capitalize">
                        {q.type === 'self' ? <FileText className="mr-1 h-3 w-3" /> : <Users className="mr-1 h-3 w-3" />}
                        {q.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{q.questions.length}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={q.isActive ? 'default' : 'outline'} className={q.isActive ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
                        {q.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(q)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No questionnaires created yet.</p>
              <Button className="mt-4" onClick={handleAddNew}>
                Create Your First Questionnaire
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
