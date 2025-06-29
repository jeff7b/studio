
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'employee' | 'team_leader' | 'admin';
}

export interface Question {
  id: string;
  text: string;
  order: number;
}

export interface Answer {
  questionId: string;
  answerText: string;
}

export interface Review {
  id: string;
  title: string;
  type: 'self' | 'peer';
  status: 'draft' | 'pending_submission' | 'submitted' | 'completed'; // pending_submission for peer reviews assigned but not started
  dueDate?: string;
  reviewee?: User; // Person being reviewed
  reviewer?: User; // Person writing the review (relevant for peer reviews)
  questionnaireId: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberFeedback {
  id: string; // user id
  name: string;
  avatarUrl?: string;
  selfReviewStatus: 'not_started' | 'draft' | 'submitted';
  peerReviewsAssignedCount: number;
  peerReviewsCompletedCount: number;
  // AI Insights
  feedbackSummary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
  keyImprovementAreas?: string[];
}

export interface Questionnaire {
  id: string; // Unique ID for this specific version
  templateId: string; // Groups all versions of a questionnaire
  version: number;
  name: string;
  description?: string;
  type: 'self' | 'peer';
  questions: Question[];
  isActive: boolean; // True if this is the latest, assignable version
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
}

export interface PeerReviewAssignment {
  id: string;
  reviewCycleId: string;
  revieweeId: string;
  revieweeName: string;
  revieweeAvatarUrl?: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatarUrl?: string;
  questionnaireId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'declined';
  dueDate: string; // ISO string format
  reviewId?: string; // Link to the actual review once submitted
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
}

export interface ReviewCycle {
  id: string;
  name: string;
  startDate: string; // ISO string format
  endDate: string; // ISO string format
  participantIds: string[]; // Array of user IDs
  status: 'draft' | 'active' | 'closed';
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
}
