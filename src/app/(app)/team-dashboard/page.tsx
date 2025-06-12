"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { BarChart3, MessageSquare, ThumbsUp, ThumbsDown, AlertTriangle, Eye, Users, ArrowRight } from 'lucide-react';
import type { TeamMemberFeedback } from '@/types';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock Data
const mockTeamMembers: TeamMemberFeedback[] = [
  {
    id: 'tm1', name: 'Alice Wonderland', avatarUrl: 'https://placehold.co/100x100.png?text=AW',
    selfReviewStatus: 'submitted', peerReviewsAssignedCount: 5, peerReviewsCompletedCount: 4,
    feedbackSummary: 'Alice consistently delivers high-quality work and is a great team player. Could focus more on strategic thinking.',
    sentiment: 'positive', keyImprovementAreas: ['Strategic Thinking', 'Public Speaking']
  },
  {
    id: 'tm2', name: 'Bob The Builder', avatarUrl: 'https://placehold.co/100x100.png?text=BB',
    selfReviewStatus: 'draft', peerReviewsAssignedCount: 4, peerReviewsCompletedCount: 1,
    feedbackSummary: 'Bob shows strong technical skills but needs to improve communication with non-technical team members.',
    sentiment: 'mixed', keyImprovementAreas: ['Communication', 'Time Management']
  },
  {
    id: 'tm3', name: 'Charlie Brown', avatarUrl: 'https://placehold.co/100x100.png?text=CB',
    selfReviewStatus: 'not_started', peerReviewsAssignedCount: 3, peerReviewsCompletedCount: 0,
    sentiment: undefined, // No AI data yet
  },
  {
    id: 'tm4', name: 'Diana Prince', avatarUrl: 'https://placehold.co/100x100.png?text=DP',
    selfReviewStatus: 'submitted', peerReviewsAssignedCount: 5, peerReviewsCompletedCount: 5,
    feedbackSummary: 'Diana is an exceptional leader and consistently exceeds expectations. No major areas for improvement noted.',
    sentiment: 'positive', keyImprovementAreas: []
  },
];

const SentimentDisplay = ({ sentiment }: { sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed' }) => {
  if (!sentiment) return <span className="text-xs text-muted-foreground">N/A</span>;
  const sentimentConfig = {
    positive: { icon: <ThumbsUp className="h-4 w-4 text-green-500" />, label: 'Positive', color: 'text-green-500' },
    neutral: { icon: <MessageSquare className="h-4 w-4 text-yellow-500" />, label: 'Neutral', color: 'text-yellow-500' },
    negative: { icon: <ThumbsDown className="h-4 w-4 text-red-500" />, label: 'Negative', color: 'text-red-500' },
    mixed: { icon: <BarChart3 className="h-4 w-4 text-blue-500" />, label: 'Mixed', color: 'text-blue-500' },
  };
  const config = sentimentConfig[sentiment];
  return <div className={`flex items-center space-x-1 text-xs font-medium ${config.color}`}>{config.icon} <span>{config.label}</span></div>;
};

const TeamMemberCard = ({ member }: { member: TeamMemberFeedback }) => {
  const peerReviewProgress = member.peerReviewsAssignedCount > 0 ? (member.peerReviewsCompletedCount / member.peerReviewsAssignedCount) * 100 : 0;
  const isAtRisk = member.selfReviewStatus === 'not_started' || peerReviewProgress < 50;

  return (
    <Card className={`shadow-md hover:shadow-lg transition-shadow ${isAtRisk && member.selfReviewStatus !== 'submitted' ? 'border-destructive' : ''}`}>
      <CardHeader className="flex flex-row items-start justify-between space-x-4 pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="employee avatar" />
            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg font-semibold font-headline">{member.name}</CardTitle>
            <CardDescription className="text-xs">
              Self-Review: <span className={`font-medium ${member.selfReviewStatus === 'submitted' ? 'text-green-600' : member.selfReviewStatus === 'draft' ? 'text-yellow-600' : 'text-red-600'}`}>{member.selfReviewStatus.replace('_', ' ')}</span>
            </CardDescription>
          </div>
        </div>
        {isAtRisk && member.selfReviewStatus !== 'submitted' && <AlertTriangle className="h-5 w-5 text-destructive" />}
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Peer Reviews</span>
            <span className="font-medium">{member.peerReviewsCompletedCount} / {member.peerReviewsAssignedCount}</span>
          </div>
          <Progress value={peerReviewProgress} aria-label={`${peerReviewProgress}% peer reviews completed`} className="h-2" />
        </div>
        {member.feedbackSummary && (
          <div className="space-y-1 border-t pt-2 mt-2">
            <h4 className="text-xs font-semibold text-muted-foreground">AI Feedback Summary:</h4>
            <p className="text-xs text-foreground line-clamp-2">{member.feedbackSummary}</p>
            <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">Overall Sentiment:</span>
                <SentimentDisplay sentiment={member.sentiment} />
            </div>
          </div>
        )}
        {member.keyImprovementAreas && member.keyImprovementAreas.length > 0 && (
          <div className="space-y-1 border-t pt-2 mt-2">
            <h4 className="text-xs font-semibold text-muted-foreground">Key Improvement Areas:</h4>
            <ul className="list-disc list-inside space-y-0.5">
              {member.keyImprovementAreas.slice(0,2).map(area => <li key={area} className="text-xs text-foreground">{area}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/team-dashboard/member/${member.id}`}>
            <Eye className="mr-2 h-4 w-4" /> View Detailed Feedback
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};


export default function TeamDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredMembers = mockTeamMembers.filter(member => {
    const nameMatch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === 'all' || 
                        (filterStatus === 'at_risk' && (member.selfReviewStatus === 'not_started' || (member.peerReviewsAssignedCount > 0 && (member.peerReviewsCompletedCount / member.peerReviewsAssignedCount) < 0.5))) ||
                        (filterStatus === 'submitted' && member.selfReviewStatus === 'submitted') ||
                        (filterStatus === 'pending' && (member.selfReviewStatus === 'draft' || member.selfReviewStatus === 'not_started'));
    return nameMatch && statusMatch;
  });
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Team Dashboard</h1>
        <Button>
            <Users className="mr-2 h-5 w-5" /> Manage Team Reviews
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Team Overview</CardTitle>
            <CardDescription>Track review progress and insights for your team members.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input 
                    placeholder="Search team member..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="at_risk">At Risk</SelectItem>
                        <SelectItem value="submitted">Submitted Self-Review</SelectItem>
                        <SelectItem value="pending">Pending Self-Review</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {filteredMembers.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredMembers.map((member) => (
                    <TeamMemberCard key={member.id} member={member} />
                ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No team members match your current filters.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
