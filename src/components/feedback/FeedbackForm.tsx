
import { useState } from 'react';
import { AttendeeFeedback, FEEDBACK_CATEGORIES, FeedbackRating, FeedbackReaction } from '@/utils/feedbackData';
import { useFeedbackStore } from '@/store/feedbackStore';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Smile, ThumbsUp, Frown, Meh, Angry } from 'lucide-react';

interface FeedbackFormProps {
  eventId: string;
  teamId?: string;
  onSuccess?: () => void;
}

const FeedbackForm = ({ eventId, teamId, onSuccess }: FeedbackFormProps) => {
  const { submitNewFeedback, isLoading } = useFeedbackStore();
  
  const [ratings, setRatings] = useState<FeedbackRating[]>(
    FEEDBACK_CATEGORIES.map(cat => ({
      category: cat.id,
      score: 3,
      maxScore: 5
    }))
  );
  
  const [reaction, setReaction] = useState<FeedbackReaction>('neutral');
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const updateRating = (categoryId: string, value: number) => {
    setRatings(prev => 
      prev.map(rating => 
        rating.category === categoryId ? { ...rating, score: value } : rating
      )
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!isAnonymous && (!name || !email)) {
      toast.error('Please provide your name and email, or submit anonymously');
      return;
    }
    
    const feedbackData: Omit<AttendeeFeedback, 'id' | 'timestamp'> = {
      eventId,
      teamId,
      ratings,
      reaction,
      comment,
      isAnonymous,
      ...(isAnonymous ? {} : { attendeeName: name, attendeeEmail: email })
    };
    
    try {
      await submitNewFeedback(feedbackData);
      toast.success('Thank you for your feedback!');
      
      // Reset form
      setRatings(FEEDBACK_CATEGORIES.map(cat => ({
        category: cat.id,
        score: 3,
        maxScore: 5
      })));
      setReaction('neutral');
      setComment('');
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
      console.error('Feedback submission error:', error);
    }
  };
  
  const reactionIcons = {
    excited: { icon: <ThumbsUp className="w-10 h-10" />, label: 'Excited' },
    happy: { icon: <Smile className="w-10 h-10" />, label: 'Happy' },
    neutral: { icon: <Meh className="w-10 h-10" />, label: 'Neutral' },
    disappointed: { icon: <Frown className="w-10 h-10" />, label: 'Disappointed' },
    frustrated: { icon: <Angry className="w-10 h-10" />, label: 'Frustrated' }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Share Your Feedback</CardTitle>
        <CardDescription>
          Help us improve future hackathons by sharing your experience
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Reaction Selection */}
          <div className="space-y-2">
            <Label>How would you rate your overall experience?</Label>
            <div className="flex justify-between items-center mt-2">
              {(Object.entries(reactionIcons) as [FeedbackReaction, { icon: JSX.Element, label: string }][]).map(([key, { icon, label }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setReaction(key as FeedbackReaction)}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                    reaction === key 
                      ? 'bg-primary text-primary-foreground scale-110' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {icon}
                  <span className="text-xs mt-1">{label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Category Ratings */}
          <div className="space-y-6">
            <Label className="text-base font-medium">Category Ratings</Label>
            {FEEDBACK_CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor={category.id}>{category.name}</Label>
                  <span className="font-semibold">
                    {ratings.find(r => r.category === category.id)?.score || 0}/5
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Poor</span>
                  <Slider
                    id={category.id}
                    min={1}
                    max={5}
                    step={1}
                    value={[ratings.find(r => r.category === category.id)?.score || 3]}
                    onValueChange={(values) => updateRating(category.id, values[0])}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">Excellent</span>
                </div>
                <p className="text-xs text-muted-foreground">{category.description}</p>
              </div>
            ))}
          </div>
          
          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comment">Additional Comments (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share any additional thoughts, suggestions or concerns..."
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          
          {/* Personal Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="anonymous" 
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked === true)}
              />
              <Label htmlFor="anonymous" className="font-normal">
                Submit anonymously
              </Label>
            </div>
            
            {!isAnonymous && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FeedbackForm;
