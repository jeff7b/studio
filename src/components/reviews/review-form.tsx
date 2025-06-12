"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Question, Answer, Review } from '@/types';
import { Save, Send, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ReviewFormProps {
  reviewType: 'self' | 'peer';
  questions: Question[];
  initialAnswers?: Answer[];
  revieweeName?: string; // For peer reviews
  onSubmit: (answers: Answer[]) => void;
  onSaveDraft?: (answers: Answer[]) => void;
  formTitle: string;
  formDescription?: string;
}

export function ReviewForm({
  reviewType,
  questions,
  initialAnswers = [],
  revieweeName,
  onSubmit,
  onSaveDraft,
  formTitle,
  formDescription,
}: ReviewFormProps) {
  const [answers, setAnswers] = useState<Answer[]>(
    questions.map(q => {
      const existingAnswer = initialAnswers.find(a => a.questionId === q.id);
      return { questionId: q.id, answerText: existingAnswer?.answerText || '' };
    })
  );
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleAnswerChange = (questionId: string, text: string) => {
    setAnswers(prevAnswers =>
      prevAnswers.map(ans =>
        ans.questionId === questionId ? { ...ans, answerText: text } : ans
      )
    );
    if (showConfirmation) setShowConfirmation(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation: check if all questions have some answer
    const allAnswered = answers.every(ans => ans.answerText.trim() !== '');
    if (!allAnswered) {
      setShowConfirmation(true); // Or show specific error messages
      return;
    }
    onSubmit(answers);
  };
  
  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(answers);
      // Add toast notification for draft saved
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold font-headline">{formTitle}</CardTitle>
        {formDescription && <CardDescription>{formDescription}</CardDescription>}
        {reviewType === 'peer' && revieweeName && (
          <p className="text-sm text-muted-foreground">Providing feedback for: <strong>{revieweeName}</strong></p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.sort((a,b) => a.order - b.order).map((question, index) => (
            <div key={question.id} className="space-y-2">
              <Label htmlFor={`question-${question.id}`} className="text-base font-medium">
                {index + 1}. {question.text}
              </Label>
              <Textarea
                id={`question-${question.id}`}
                value={answers.find(ans => ans.questionId === question.id)?.answerText || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder="Your response..."
                rows={5}
                className="resize-none"
              />
            </div>
          ))}
          
          {showConfirmation && (
             <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Incomplete Review</AlertTitle>
              <AlertDescription>
                Please answer all questions before submitting. You can save as draft if you are not ready.
              </AlertDescription>
            </Alert>
          )}

          <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 px-0">
            {onSaveDraft && (
              <Button type="button" variant="outline" onClick={handleSaveDraft} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" /> Save Draft
              </Button>
            )}
            <Button type="submit" className="w-full sm:w-auto">
              <Send className="mr-2 h-4 w-4" /> Submit Review
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
