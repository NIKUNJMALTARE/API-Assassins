
import { useEffect } from 'react';
import { useFeedbackStore } from '@/store/feedbackStore';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AttendeeFeedback = () => {
  const { fetchFeedbackData } = useFeedbackStore();
  
  // Load feedback data on component mount
  useEffect(() => {
    fetchFeedbackData('hackathon-2023');
  }, [fetchFeedbackData]);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 container px-4 md:px-6">
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" asChild>
            <Link to="/" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>
        
        <section className="mb-16 text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Share Your Hackathon Experience
          </h1>
          <p className="text-muted-foreground">
            Your feedback helps us create better hackathons. Tell us about your experience and help us improve future events.
          </p>
        </section>
        
        <section className="max-w-4xl mx-auto">
          <FeedbackForm eventId="hackathon-2023" />
        </section>
      </main>
      
      <footer className="py-6 border-t">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            Thank you for participating in the hackathon!
          </p>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link to="/teams" className="text-sm text-muted-foreground hover:text-foreground">
              Teams
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AttendeeFeedback;
