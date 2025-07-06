import React, { useState, useMemo } from "react";
import { MessageSquare, Filter, Calendar, User, BookOpen, Star, AlertTriangle, CheckCircle, Clock, Brain, Minus } from "lucide-react";
import { ChartContainer } from "@/components/ChartContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useFeedback, useFeedbackCategories } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";

const FeedbackManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
  } | null>(null);
  
  const { data: feedbackData, isLoading: feedbackLoading } = useFeedback();
  const { data: categories } = useFeedbackCategories();
  
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  // Process feedback data for analysis
  const processedFeedback = useMemo(() => {
    if (!feedbackData) return [];
    
    return feedbackData.map(feedback => {
      const rating = feedback.overall_rating || 0;
      let sentiment = "neutral";
      let urgency = "low";
      
      if (rating >= 4) {
        sentiment = "positive";
        urgency = "low";
      } else if (rating <= 2) {
        sentiment = "negative";
        urgency = rating === 1 ? "high" : "medium";
      }
      
      // Generate AI-like analysis keywords from feedback text
      const generateKeywords = (text: string) => {
        if (!text) return [];
        const words = text.toLowerCase().split(/\s+/);
        const positiveWords = ['excellent', 'great', 'good', 'clear', 'helpful', 'amazing', 'outstanding'];
        const negativeWords = ['poor', 'bad', 'unclear', 'difficult', 'confusing', 'terrible', 'awful'];
        
        const keywords = words.filter(word => 
          positiveWords.includes(word) || negativeWords.includes(word)
        ).slice(0, 4);
        
        return keywords.length > 0 ? keywords : ['feedback', 'course', 'instructor'];
      };
      
      const allFeedbackText = [
        feedback.positive_feedback,
        feedback.improvement_suggestions,
        feedback.additional_comments
      ].filter(Boolean).join(' ');
      
      return {
        ...feedback,
        sentiment,
        urgency,
        keywords: generateKeywords(allFeedbackText),
        displayText: feedback.positive_feedback || feedback.improvement_suggestions || feedback.additional_comments || 'No detailed feedback provided'
      };
    });
  }, [feedbackData]);

  // Filter feedback based on search and filters
  const filteredFeedback = useMemo(() => {
    if (!processedFeedback) return [];
    
    return processedFeedback.filter(feedback => {
      const matchesSearch = searchTerm === "" || 
        feedback.displayText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.course_offerings?.courses?.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${feedback.course_offerings?.lecturers?.first_name} ${feedback.course_offerings?.lecturers?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || feedback.category_id.toString() === categoryFilter;
      
      const matchesRating = ratingFilter === "all" || 
        (ratingFilter === "high" && feedback.overall_rating >= 4) ||
        (ratingFilter === "medium" && feedback.overall_rating === 3) ||
        (ratingFilter === "low" && feedback.overall_rating <= 2);
      
      return matchesSearch && matchesCategory && matchesRating;
    });
  }, [processedFeedback, searchTerm, categoryFilter, ratingFilter]);

  // Calculate statistics - using actual count from database
  const stats = useMemo(() => {
    if (!processedFeedback || processedFeedback.length === 0) {
      return {
        total: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        avgRating: 0,
        sentimentStats: { positive: 0, neutral: 0, negative: 0 }
      };
    }

    // Use the actual feedback data length for accurate count - this should show the real number from database
    const total = processedFeedback.length;
    const positiveCount = processedFeedback.filter(f => f.sentiment === "positive").length;
    const negativeCount = processedFeedback.filter(f => f.sentiment === "negative").length;
    const neutralCount = total - positiveCount - negativeCount;
    
    const avgRating = processedFeedback.reduce((sum, f) => sum + (f.overall_rating || 0), 0) / total;
    
    return {
      total,
      positive: Math.round((positiveCount / total) * 100),
      neutral: Math.round((neutralCount / total) * 100),
      negative: Math.round((negativeCount / total) * 100),
      avgRating: Math.round(avgRating * 10) / 10,
      sentimentStats: {
        positive: Math.round((positiveCount / total) * 100),
        neutral: Math.round((neutralCount / total) * 100),
        negative: Math.round((negativeCount / total) * 100)
      }
    };
  }, [processedFeedback]);

  // Category statistics
  const categoryStats = useMemo(() => {
    if (!processedFeedback || !categories) return [];
    
    return categories.map(category => {
      const categoryFeedback = processedFeedback.filter(f => f.category_id === category.id);
      const count = categoryFeedback.length;
      const percentage = processedFeedback.length > 0 ? Math.round((count / processedFeedback.length) * 100) : 0;
      
      return {
        name: category.category_name,
        count,
        percentage
      };
    }).filter(stat => stat.count > 0).sort((a, b) => b.count - a.count);
  }, [processedFeedback, categories]);

  // Generate AI Insights function using OpenAI API
  const generateAIInsights = async () => {
    setIsGeneratingInsights(true);
    
    try {
      console.log('Generating insights for selected feedback item');
      
      // Use only the selected feedback item for focused analysis
      if (!selectedFeedback) {
        throw new Error('No feedback item selected for analysis');
      }
      
      const relevantFeedback = [selectedFeedback];

      // Call the Supabase Edge Function for AI insights
      const { data: response, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          type: 'feedback_analysis',
          data: relevantFeedback.map(fb => ({
            overall_rating: fb.overall_rating,
            teaching_effectiveness: fb.teaching_effectiveness,
            course_content: fb.course_content,
            communication: fb.communication,
            availability: fb.availability,
            positive_feedback: fb.positive_feedback,
            improvement_suggestions: fb.improvement_suggestions,
            additional_comments: fb.additional_comments,
            sentiment: fb.sentiment,
            urgency: fb.urgency,
            course_name: fb.course_offerings?.courses?.course_name,
            lecturer_name: fb.course_offerings?.lecturers ? 
              `${fb.course_offerings.lecturers.first_name} ${fb.course_offerings.lecturers.last_name}` : null,
            category: fb.category_id
          })),
          customPrompt: `Analyze this specific feedback item from a student. Provide focused, actionable insights for this particular case.`
        }
      });

      if (error) {
        console.error('Error calling AI insights function:', error);
        throw new Error('Failed to generate AI insights');
      }

      console.log('AI insights response:', response);

      if (response?.success && response?.insights) {
        setAiInsights({
          strengths: response.insights.strengths || [],
          weaknesses: response.insights.weaknesses || [],
          improvements: response.insights.improvements || []
        });
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      
      // Show error message instead of fallback
      setAiInsights({
        strengths: ['Error generating insights - please try again'],
        weaknesses: ['AI service temporarily unavailable'],
        improvements: ['Check console for error details']
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  React.useEffect(() => {
    if (filteredFeedback.length > 0 && !selectedFeedback) {
      setSelectedFeedback(filteredFeedback[0]);
    }
  }, [filteredFeedback, selectedFeedback]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-success/10 text-success border-success/20";
      case "negative":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (rating: number) => {
    if (rating >= 4) return <CheckCircle className="w-4 h-4 text-success" />;
    if (rating <= 2) return <AlertTriangle className="w-4 h-4 text-destructive" />;
    return <Clock className="w-4 h-4 text-warning" />;
  };

  if (feedbackLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-3xl font-bold text-foreground mb-2">Feedback Management</h2>
        <p className="text-muted-foreground">
          Analysis and management of {stats.total} student feedback submissions
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-slide-up">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Positive</p>
                <p className="text-2xl font-bold text-success">{stats.positive}%</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Neutral</p>
                <p className="text-2xl font-bold text-muted-foreground">{stats.neutral}%</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center">
                <Minus className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Attention</p>
                <p className="text-2xl font-bold text-destructive">{stats.negative}%</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-foreground">{stats.avgRating}/5</p>
              </div>
              <Star className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters and Feedback List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="high">High (4-5)</SelectItem>
                    <SelectItem value="medium">Medium (3)</SelectItem>
                    <SelectItem value="low">Low (1-2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Feedback List */}
          <ChartContainer title={`Feedback Submissions (${filteredFeedback.length})`}>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredFeedback.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No feedback found matching your criteria.
                </div>
              ) : (
                filteredFeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedFeedback?.id === feedback.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedFeedback(feedback)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">
                            {feedback.course_offerings?.courses?.course_name || 'Unknown Course'}
                          </h4>
                          {getStatusIcon(feedback.overall_rating || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {feedback.course_offerings?.lecturers ? 
                            `${feedback.course_offerings.lecturers.first_name} ${feedback.course_offerings.lecturers.last_name}` : 
                            'Unknown Lecturer'
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < (feedback.overall_rating || 0)
                                  ? "text-warning fill-warning"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <Badge className={getSentimentColor(feedback.sentiment)}>
                          {feedback.sentiment}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-foreground line-clamp-2 mb-2">
                      {feedback.displayText}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {feedback.keywords.slice(0, 3).map((keyword: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      <Badge className={getUrgencyColor(feedback.urgency)}>
                        {feedback.urgency} priority
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ChartContainer>
        </div>

        {/* AI Analysis Panel */}
        <div className="space-y-4">
          <ChartContainer title="Analysis & Insights">
            <Tabs defaultValue="feedback" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="feedback" className="space-y-4 mt-4">
                {selectedFeedback ? (
                  <>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Selected Feedback</h4>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {selectedFeedback.is_anonymous ? 'Anonymous Student' : 'Student'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {selectedFeedback.course_offerings?.courses?.course_name || 'Unknown Course'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(selectedFeedback.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">
                          {selectedFeedback.displayText}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Analysis</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Category</p>
                          <Badge variant="outline" className="text-xs">
                            {categories?.find(c => c.id === selectedFeedback.category_id)?.category_name || 'Unknown'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Rating Breakdown</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>Teaching: {selectedFeedback.teaching_effectiveness || 'N/A'}/5</div>
                            <div>Content: {selectedFeedback.course_content || 'N/A'}/5</div>
                            <div>Communication: {selectedFeedback.communication || 'N/A'}/5</div>
                            <div>Availability: {selectedFeedback.availability || 'N/A'}/5</div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Priority Level</p>
                          <Badge className={getUrgencyColor(selectedFeedback.urgency)}>
                            {selectedFeedback.urgency} priority
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a feedback item to view analysis
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="insights" className="space-y-4 mt-4">
                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <h4 className="font-semibold text-foreground">AI-Generated Insights</h4>
                       <Button 
                         onClick={generateAIInsights}
                         disabled={isGeneratingInsights}
                         size="sm"
                         className="gap-2"
                       >
                         <Brain className="w-4 h-4" />
                         {isGeneratingInsights ? 'Analyzing...' : 'Generate'}
                       </Button>
                     </div>
                     
                     {/* Loading Animation */}
                     {isGeneratingInsights && (
                       <div className="flex flex-col items-center justify-center py-12 space-y-4">
                         <div className="relative">
                           <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                           <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-primary/40 rounded-full animate-spin animation-delay-150"></div>
                         </div>
                         <div className="text-center space-y-2">
                           <p className="text-sm font-medium text-foreground">Generating AI Insights...</p>
                           <p className="text-xs text-muted-foreground">Analyzing selected feedback item</p>
                         </div>
                       </div>
                     )}
                     
                     {aiInsights && !isGeneratingInsights ? (
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-success mb-2">Strengths</h5>
                        <div className="space-y-1">
                           {aiInsights.strengths.map((strength, idx) => (
                             <div key={idx} className="flex items-start gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                               <p className="text-sm text-foreground">{typeof strength === 'string' ? strength : JSON.stringify(strength)}</p>
                             </div>
                           ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-destructive mb-2">Weaknesses</h5>
                        <div className="space-y-1">
                           {aiInsights.weaknesses.map((weakness, idx) => (
                             <div key={idx} className="flex items-start gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                               <p className="text-sm text-foreground">{typeof weakness === 'string' ? weakness : JSON.stringify(weakness)}</p>
                             </div>
                           ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-primary mb-2">Areas for Improvement</h5>
                        <div className="space-y-1">
                           {aiInsights.improvements.map((improvement, idx) => (
                             <div key={idx} className="flex items-start gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                               <p className="text-sm text-foreground">{typeof improvement === 'string' ? improvement : JSON.stringify(improvement)}</p>
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>
                     ) : !isGeneratingInsights ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-2">No insights generated yet</p>
                      <p className="text-xs">Click "Generate" to analyze feedback with AI</p>
                    </div>
                     ) : null}
                </div>
              </TabsContent>
            </Tabs>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement;
