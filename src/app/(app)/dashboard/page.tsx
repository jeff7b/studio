"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Edit3, Eye, FileText, Users, PlusCircle, AlertTriangle } from 'lucide-react';
import type { Review } from '@/types';

// Mock data
const mockSelfReviews: Review[] = [
  { id: 'sr1', title: 'Q3 2024 Self-Review', type: 'self', status: 'submitted', dueDate: '2024-09-15', questions: [], answers: [], questionnaireId: 'q1', createdAt: '', updatedAt: '' },
  { id: 'sr2', title: 'Mid-Year Self-Review 2024', type: 'self', status: 'draft', dueDate: '2024-07-30', questions: [], answers: [], questionnaireId: 'q2', createdAt: '', updatedAt: '' },
];

const mockPeerReviewsAssigned: Review[] = [
  { id: 'pr1', title: 'Peer Review for Alice Smith', type: 'peer', status: 'pending_submission', dueDate: '2024-09-20', reviewee: { id: 'u1', name: 'Alice Smith', email:'', role:'employee' }, questions: [], answers: [], questionnaireId: 'q3', createdAt: '', updatedAt: '' },
  { id: 'pr2', title: 'Peer Review for Bob Johnson', type: 'peer', status: 'completed', dueDate: '2024-08-10', reviewee: { id: 'u2', name: 'Bob Johnson', email:'', role:'employee' }, questions: [], answers: [], questionnaireId: 'q3', createdAt: '', updatedAt: '' },
  { id: 'pr3', title: 'Peer Review for Carol White (Overdue)', type: 'peer', status: 'pending_submission', dueDate: '2024-07-01', reviewee: { id: 'u3', name: 'Carol White', email:'', role:'employee' }, questions: [], answers: [], questionnaireId: 'q3', createdAt: '', updatedAt: '' },
];

const ReviewCard = ({ review }: { review: Review }) => {
  const isOverdue = review.dueDate && new Date(review.dueDate) < new Date() && review.status !== 'completed' && review.status !== 'submitted';
  const cardBorderColor = isOverdue ? "border-destructive" : "";

  return (
    <Card className={`shadow-md hover:shadow-lg transition-shadow ${cardBorderColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-xl font-headline">
          {review.title}
          {isOverdue && <AlertTriangle className="h-5 w-5 text-destructive" />}
        </CardTitle>
        <CardDescription>
          {review.type === 'self' ? 'Self Assessment' : `For: ${review.reviewee?.name}`} <br />
          Due: {review.dueDate ? new Date(review.dueDate).toLocaleDateString() : 'N/A'} | Status: <span className={`font-semibold ${isOverdue ? 'text-destructive' : ''}`}>{review.status.replace('_', ' ')}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Potentially show a snippet or progress */}
        <p className="text-sm text-muted-foreground">
          {review.status === 'draft' ? 'Continue working on your draft.' : 
           review.status === 'pending_submission' ? 'Awaiting your feedback.' :
           review.status === 'submitted' || review.status === 'completed' ? 'Review has been submitted.' :
           'Complete your review.'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {(review.status === 'draft' || review.status === 'pending_submission') && (
          <Button asChild variant="default" size="sm">
            <Link href={review.type === 'self' ? `/reviews/self/${review.id}/edit` : `/reviews/peer/${review.id}`}>
              {review.status === 'draft' ? <Edit3 className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
              {review.status === 'draft' ? 'Edit Review' : 'Start/Edit Review'}
            </Link>
          </Button>
        )}
        {(review.status === 'submitted' || review.status === 'completed') && (
          <Button variant="outline" size="sm" disabled>
            <CheckCircle className="mr-2 h-4 w-4" />
            Submitted
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight font-headline">My Dashboard</h1>
        <Button asChild>
          <Link href="/reviews/self/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Start New Self-Review
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="self-reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 max-w-md">
          <TabsTrigger value="self-reviews" className="py-2.5">
            <FileText className="mr-2 h-5 w-5" /> My Self-Reviews
          </TabsTrigger>
          <TabsTrigger value="peer-reviews" className="py-2.5">
            <Users className="mr-2 h-5 w-5" /> Peer Reviews Assigned to Me
          </TabsTrigger>
        </TabsList>

        <TabsContent value="self-reviews" className="mt-6">
          {mockSelfReviews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockSelfReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-10">
              <CardContent>
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You have no self-reviews at the moment.</p>
                <Button asChild className="mt-4">
                  <Link href="/reviews/self/new">Start New Self-Review</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="peer-reviews" className="mt-6">
          {mockPeerReviewsAssigned.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockPeerReviewsAssigned.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
             <Card className="text-center py-10">
              <CardContent>
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You have not been assigned any peer reviews yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
