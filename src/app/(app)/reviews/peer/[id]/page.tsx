"use client";

import { ReviewForm } from '@/components/reviews/review-form';
import type { Question, Answer, User } from '@/types'; // Assuming User type is defined
import { useRouter, useParams } from 'next/navigation'; // Corrected import

// Mock data - in a real app, this would be fetched based on the review ID or assignment
const mockPeerReviewQuestions: Question[] = [
  { id: 'pq1', text: 'How has this peer contributed to team goals?', order: 1 },
  { id: 'pq2', text: 'Describe a situation where this peer demonstrated strong collaboration skills.', order: 2 },
  { id: 'pq3', text: 'What are this peer\'s key strengths from your perspective?', order: 3 },
  { id: 'pq4', text: 'In what areas could this peer potentially improve or develop further?', order: 4 },
  { id: 'pq5', text: 'Provide any additional feedback you think would be helpful.', order: 5 },
];

// Mock reviewee data - this would be fetched based on `params.id`
const mockReviewee: User = {
  id: 'user123',
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  role: 'employee',
  avatarUrl: 'https://placehold.co/100x100.png',
};

export default function SubmitPeerReviewPage() {
  const router = useRouter();
  const params = useParams();
  const reviewId = params.id as string; // Or assignment ID

  // In a real app, fetch review details, questions, and reviewee info using reviewId

  const handleSubmitPeerReview = (answers: Answer[]) => {
    console.log(`Peer review for ${mockReviewee.name} (ID: ${reviewId}) submitted:`, answers);
    // Send data to backend
    router.push('/dashboard');
     // Add toast notification for success
  };
  
  const handleSaveDraft = (answers: Answer[]) => {
    console.log(`Peer review draft for ${mockReviewee.name} (ID: ${reviewId}) saved:`, answers);
    // Implement draft saving logic
    // Add toast notification for draft saved
  };

  return (
    <div className="space-y-6">
      <ReviewForm
        reviewType="peer"
        questions={mockPeerReviewQuestions}
        revieweeName={mockReviewee.name}
        onSubmit={handleSubmitPeerReview}
        onSaveDraft={handleSaveDraft}
        formTitle={`Peer Review for ${mockReviewee.name}`}
        formDescription={`Please provide constructive and specific feedback for ${mockReviewee.name}. Your insights are valuable for their development.`}
      />
    </div>
  );
}
