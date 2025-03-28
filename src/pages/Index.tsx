
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUNDS } from '@/utils/teamData';
import { fetchTeams } from '@/utils/api';
import Navbar from '@/components/Navbar';
import RoundTabs from '@/components/RoundTabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy, MessageSquare, BarChart } from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

const Index = () => {
  const [activeRound, setActiveRound] = useState(ROUNDS[0]);
  const { toast } = useToast();
  
  // Get cumulative score up to current round
  const getCumulativeScore = (team, currentRound) => {
    const roundIndex = ROUNDS.indexOf(currentRound);
    let totalScore = 0;
    
    for (let i = 0; i <= roundIndex; i++) {
      const roundName = ROUNDS[i];
      const roundScores = team.scores.filter(score => score.round === roundName);
      if (roundScores.length > 0) {
        const roundAverage = Math.round(
          roundScores.reduce((sum, score) => sum + score.totalScore, 0) / roundScores.length
        );
        totalScore += roundAverage;
      }
    }
    
    return totalScore;
  };
  
  // Fetch teams data using React Query
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      try {
        return await fetchTeams();
      } catch (error) {
        console.error('Failed to fetch teams:', error);
        toast({
          title: 'Error',
          description: 'Failed to load teams data. Using fallback data.',
          variant: 'destructive',
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Sort teams by score to get the leaderboard
  const getLeaderboard = () => {
    return [...teams].sort((a, b) => {
      const aScore = getCumulativeScore(a, activeRound);
      const bScore = getCumulativeScore(b, activeRound);
      return bScore - aScore;
    });
  };
  
  const leaderboard = getLeaderboard();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 container px-4 md:px-6">
        {/* Hero section */}
        <section className="mb-16 text-center space-y-4 animate-fade-up">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Hackathon LeaderBoard
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track team progress, judge scores, and feedback across all rounds to ensure
            a fair and transparent hackathon experience.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button asChild>
              <Link to="/teams">
                View All Teams <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/judge-panel">
                Judge Panel
              </Link>
            </Button>
          </div>
        </section>
        
        {/* Quick Actions */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/attendee-feedback">
              <div className="border rounded-lg p-6 hover:border-primary hover:bg-secondary/20 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium">Submit Feedback</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share your experience and help us improve future hackathons.
                </p>
              </div>
            </Link>
            
            <Link to="/admin-dashboard">
              <div className="border rounded-lg p-6 hover:border-primary hover:bg-secondary/20 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <BarChart className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium">Analytics Dashboard</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  View feedback analytics and insights from all participants.
                </p>
              </div>
            </Link>
            
            <Link to="/teams">
              <div className="border rounded-lg p-6 hover:border-primary hover:bg-secondary/20 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium">Team Scores</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Browse all teams and see detailed scoring breakdowns.
                </p>
              </div>
            </Link>
          </div>
        </section>
        
        {/* Rounds and Leaderboard */}
        <section className="mb-16">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Leaderboard</h2>
              </div>
              <RoundTabs activeRound={activeRound} onRoundChange={setActiveRound} />
            </div>
            
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left font-medium py-3 px-4 w-12">Rank</th>
                      <th className="text-left font-medium py-3 px-4">Team</th>
                      <th className="text-center font-medium py-3 px-4">Feasibility</th>
                      <th className="text-center font-medium py-3 px-4">Originality</th>
                      <th className="text-center font-medium py-3 px-4">Completeness</th>
                      <th className="text-center font-medium py-3 px-4">Functionality</th>
                      <th className="text-center font-medium py-3 px-4">Presentation</th>
                      <th className="text-center font-medium py-3 px-4">Round Score</th>
                      <th className="text-center font-medium py-3 px-4">Total Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      // Loading state
                      Array(5).fill(0).map((_, index) => (
                        <tr key={`loading-${index}`} className="animate-pulse">
                          <td className="py-3 px-4"><div className="h-6 bg-muted rounded"></div></td>
                          <td className="py-3 px-4"><div className="h-6 bg-muted rounded"></div></td>
                          <td className="py-3 px-4"><div className="h-6 bg-muted rounded"></div></td>
                          <td className="py-3 px-4"><div className="h-6 bg-muted rounded"></div></td>
                          <td className="py-3 px-4"><div className="h-6 bg-muted rounded"></div></td>
                          <td className="py-3 px-4"><div className="h-6 bg-muted rounded"></div></td>
                          <td className="py-3 px-4"><div className="h-6 bg-muted rounded"></div></td>
                          <td className="py-3 px-4"><div className="h-6 bg-muted rounded"></div></td>
                          <td className="py-3 px-4"><div className="h-6 bg-muted rounded"></div></td>
                        </tr>
                      ))
                    ) : leaderboard.length > 0 ? (
                      leaderboard.map((team, index) => {
                        const roundScores = team.scores.filter(score => score.round === activeRound);
                        const hasScoreForRound = roundScores.length > 0;
                        
                        // Calculate average scores for each category
                        const categoryScores = hasScoreForRound
                          ? team.scores[0].categories.map(cat => {
                              const scores = roundScores.map(score => 
                                score.categories.find(c => c.name === cat.name)?.score || 0
                              );
                              return {
                                name: cat.name,
                                average: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
                              };
                            })
                          : [];
                          
                        // Calculate total average score for this round
                        const roundScore = hasScoreForRound
                          ? Math.round(roundScores.reduce((sum, score) => sum + score.totalScore, 0) / roundScores.length)
                          : 0;
                        
                        // Calculate cumulative score up to this round
                        const cumulativeScore = getCumulativeScore(team, activeRound);
                        
                        // Calculate max possible score based on rounds completed
                        const roundIndex = ROUNDS.indexOf(activeRound);
                        const maxPossibleScore = (roundIndex + 1) * 100;
                        
                        const rowClass = index % 2 === 0 ? 'bg-background' : 'bg-muted/20';
                        const rankClass = index < 3 ? 'font-bold' : '';
                        
                        return (
                          <tr key={team.id} className={`${rowClass} hover:bg-muted/30 transition-colors`}>
                            <td className={`py-3 px-4 ${rankClass}`}>
                              {index < 3 ? (
                                <div className="flex items-center justify-center rounded-full w-6 h-6 text-xs bg-primary/10 text-primary">
                                  {index + 1}
                                </div>
                              ) : (
                                <span>{index + 1}</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <Link to={`/teams/${team.id}`} className="hover:underline">
                                <div>
                                  <div className="font-medium">{team.name}</div>
                                  <div className="text-xs text-muted-foreground">{team.projectName}</div>
                                </div>
                              </Link>
                            </td>
                            {hasScoreForRound ? (
                              categoryScores.map(cat => (
                                <td key={cat.name} className="py-3 px-4 text-center">
                                  <AnimatedNumber value={cat.average} className="font-medium" />
                                </td>
                              ))
                            ) : (
                              <>
                                <td className="py-3 px-4 text-center text-muted-foreground">-</td>
                                <td className="py-3 px-4 text-center text-muted-foreground">-</td>
                                <td className="py-3 px-4 text-center text-muted-foreground">-</td>
                                <td className="py-3 px-4 text-center text-muted-foreground">-</td>
                                <td className="py-3 px-4 text-center text-muted-foreground">-</td>
                              </>
                            )}
                            <td className="py-3 px-4 text-center">
                              {hasScoreForRound ? (
                                <div className="font-medium">
                                  <AnimatedNumber value={roundScore} />
                                  <span className="text-xs text-muted-foreground">/100</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {cumulativeScore > 0 ? (
                                <div className="font-bold">
                                  <AnimatedNumber value={cumulativeScore} />
                                  <span className="text-xs text-muted-foreground font-normal">/{maxPossibleScore}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-6 text-muted-foreground">
                          No teams data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
        
        {/* How it works */}
        <section className="py-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Judging Rounds</h3>
              <p className="text-sm text-muted-foreground">
                Teams are evaluated across multiple rounds by different judges.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-primary">2</span>
              </div>
              <h3 className="text-lg font-medium m-2">Attendee Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Participants share their experience to help improve future events.
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-primary">3</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Insights & Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Organizers analyze feedback and scores to make data-driven decisions.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-6 border-t">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            © 2023 HackJudge. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link to="/teams" className="text-sm text-muted-foreground hover:text-foreground">
              Teams
            </Link>
            <Link to="/attendee-feedback" className="text-sm text-muted-foreground hover:text-foreground">
              Submit Feedback
            </Link>
            <Link to="/admin-dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
