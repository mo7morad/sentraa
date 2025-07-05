
import React, { useState } from "react";
import { BookOpen, Star, Filter, Brain, Info, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ChartContainer";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCourses, useDepartments, useFeedback, useCourseOfferings } from "@/hooks/useData";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { supabase } from "@/integrations/supabase/client";

const CourseEvaluation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [starFilter, setStarFilter] = useState("all");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [viewMode, setViewMode] = useState<string>("details");
  const [aiInsights, setAiInsights] = useState<{
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
  } | null>(null);

  const { data: courses } = useCourses();
  const { data: departments } = useDepartments();
  const { data: feedback } = useFeedback();
  const { data: courseOfferings } = useCourseOfferings();

  // Process course data with real feedback
  const courseData = React.useMemo(() => {
    if (!courses || !feedback || !courseOfferings) return [];
    
    return courses.map(course => {
      // Get course offerings for this course
      const courseOfferingsForCourse = courseOfferings.filter(
        co => co.course_id === course.id
      );
      
      // Get feedback for all offerings of this course
      const courseFeedback = feedback.filter(fb => 
        courseOfferingsForCourse.some(co => co.id === fb.course_offering_id)
      );
      
      const avgRating = courseFeedback.length > 0
        ? courseFeedback.reduce((sum, fb) => sum + (fb.overall_rating || 0), 0) / courseFeedback.length
        : 0;

      const avgTeaching = courseFeedback.length > 0
        ? courseFeedback.reduce((sum, fb) => sum + (fb.teaching_effectiveness || 0), 0) / courseFeedback.length
        : 0;

      const avgContent = courseFeedback.length > 0
        ? courseFeedback.reduce((sum, fb) => sum + (fb.course_content || 0), 0) / courseFeedback.length
        : 0;

      // Get unique lecturers for this course from course offerings
      const lecturers = Array.from(new Set(
        courseOfferingsForCourse.map(co => 
          `${co.lecturers?.first_name} ${co.lecturers?.last_name}`
        ).filter(Boolean)
      ));

      const enrollmentCount = courseOfferingsForCourse.length > 0 
        ? Math.max(...courseOfferingsForCourse.map(co => co.enrolled_count || 0))
        : 0;

      return {
        id: course.id,
        code: course.course_code,
        name: course.course_name,
        department: course.departments?.department_name || "Unknown",
        credits: course.credits,
        rating: Number(avgRating.toFixed(2)),
        teachingRating: Number(avgTeaching.toFixed(2)),
        contentRating: Number(avgContent.toFixed(2)),
        responseCount: courseFeedback.length,
        enrollmentCount,
        lecturers: lecturers.slice(0, 2), // Show max 2 lecturers
        trend: avgRating >= 4 ? "positive" : avgRating >= 3 ? "stable" : "negative"
      };
    }).sort((a, b) => {
      // Sort by rating DESC, then by response count DESC
      if (a.rating !== b.rating) {
        return b.rating - a.rating;
      }
      return b.responseCount - a.responseCount;
    });
  }, [courses, feedback, courseOfferings]);

  const filteredCourses = courseData.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || course.department === departmentFilter;
    const matchesStar = starFilter === "all" || 
      (starFilter === "5" && course.rating >= 4) ||
      (starFilter === "4" && course.rating === 3) ||
      (starFilter === "3" && course.rating <= 2);
    return matchesSearch && matchesDepartment && matchesStar;
  });

  // Calculate department performance from real data - sorted descending by rating
  const departmentPerformance = React.useMemo(() => {
    if (!departments || !courseData) return [];
    
    return departments.map(dept => {
      const deptCourses = courseData.filter(course => course.department === dept.department_name);
      const avgRating = deptCourses.length > 0
        ? deptCourses.reduce((sum, course) => sum + course.rating, 0) / deptCourses.length
        : 0;
      
      return {
        name: dept.department_name,
        rating: Number(avgRating.toFixed(2)),
        courses: deptCourses.length,
        responses: deptCourses.reduce((sum, course) => sum + course.responseCount, 0)
      };
    }).filter(dept => dept.courses > 0) // Only show departments with courses
      .sort((a, b) => b.rating - a.rating); // Sort by rating DESC
  }, [departments, courseData]);

  // Set default selected course
  const selectedCourse = selectedCourseId 
    ? courseData.find(c => c.id === selectedCourseId) 
    : courseData[0];

  // Generate AI Insights function using OpenAI API
  const generateCourseInsights = async () => {
    if (!selectedCourse) return;
    
    setIsGeneratingInsights(true);
    
    try {
      console.log('Generating insights for course:', selectedCourse.code);
      
      // Get relevant feedback for the selected course
      const relevantFeedback = feedback?.filter(fb => 
        courseOfferings?.some(co => 
          co.course_id === selectedCourse.id && co.id === fb.course_offering_id
        )
      ) || [];
      
      console.log('Relevant feedback count:', relevantFeedback.length);
      
      // Prepare course data for AI analysis
      const courseData = {
        course: {
          code: selectedCourse.code,
          name: selectedCourse.name,
          department: selectedCourse.department,
          credits: selectedCourse.credits,
          rating: selectedCourse.rating,
          teachingRating: selectedCourse.teachingRating,
          contentRating: selectedCourse.contentRating,
          responseCount: selectedCourse.responseCount,
          enrollmentCount: selectedCourse.enrollmentCount,
          lecturers: selectedCourse.lecturers
        },
        feedback: relevantFeedback.map(fb => ({
          overall_rating: fb.overall_rating,
          teaching_effectiveness: fb.teaching_effectiveness,
          course_content: fb.course_content,
          communication: fb.communication,
          availability: fb.availability,
          positive_feedback: fb.positive_feedback,
          improvement_suggestions: fb.improvement_suggestions,
          additional_comments: fb.additional_comments
        }))
      };
      
      // Call the Supabase Edge Function for AI insights
      const { data: response, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          type: 'course_evaluation',
          data: courseData,
          customPrompt: `Analyze this course evaluation data for ${selectedCourse.code} - ${selectedCourse.name}. Focus on teaching quality, student satisfaction, and actionable improvement recommendations.`
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

  if (!courses || !departments) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Course Evaluation Analysis</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Comprehensive analysis of course performance and student satisfaction
        </p>
      </div>

      {/* Filters */}
      <Card className="animate-slide-up">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.department_name}>
                    {dept.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={starFilter} onValueChange={setStarFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">High (4-5)</SelectItem>
                <SelectItem value="4">Medium (3)</SelectItem>
                <SelectItem value="3">Low (1-2)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Department Performance Chart */}
      <ChartContainer
        title="Department Performance Overview"
        description="Average course ratings by department"
        className="animate-slide-up"
      >
        <div className="w-full h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={departmentPerformance} 
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              maxBarSize={60}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 5]} fontSize={10} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
              />
              <Bar 
                dataKey="rating" 
                fill="hsl(var(--chart-1))" 
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Course List and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Course List - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Course Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedCourse?.id === course.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedCourseId(course.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground text-sm sm:text-base">{course.code}</h4>
                            <Badge variant="outline" className="text-xs">{course.credits} credits</Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1">{course.name}</p>
                          <p className="text-xs text-muted-foreground">{course.department}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            <Star className={`w-3 h-3 sm:w-4 sm:h-4 ${course.rating >= 4.5 ? 'text-warning fill-warning' : 'text-muted-foreground'}`} />
                            <span className="font-semibold text-foreground text-sm sm:text-base">{course.rating}</span>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            course.trend === 'positive' ? 'bg-success' : 
                            course.trend === 'stable' ? 'bg-warning' : 'bg-destructive'
                          }`} />
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {course.lecturers.map((lecturer, idx) => (
                          <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                            {lecturer}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">{course.responseCount} responses</span>
                        <span className="text-muted-foreground">{course.enrollmentCount} enrolled</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No courses found matching your criteria</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Details & Insights - Takes 1/3 of the space */}
        <div className="lg:col-span-1">
          {selectedCourse && (
            <Card className="animate-slide-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-base sm:text-lg">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Course {viewMode === 'details' ? 'Details' : 'Insights'}
                  </CardTitle>
                  <ToggleGroup 
                    type="single" 
                    value={viewMode} 
                    onValueChange={(value) => value && setViewMode(value)}
                    className="gap-1"
                  >
                    <ToggleGroupItem value="details" size="sm" className="gap-1">
                      <Info className="w-3 h-3" />
                      Details
                    </ToggleGroupItem>
                    <ToggleGroupItem value="insights" size="sm" className="gap-1">
                      <Brain className="w-3 h-3" />
                      Insights
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'details' ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{selectedCourse.code}</h3>
                      <p className="text-sm text-muted-foreground">{selectedCourse.name}</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-foreground mb-2 text-sm">Performance Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Overall Rating</span>
                            <span className="font-semibold text-sm">{selectedCourse.rating}/5</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Teaching Quality</span>
                            <span className="font-semibold text-sm">{selectedCourse.teachingRating}/5</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Content Quality</span>
                            <span className="font-semibold text-sm">{selectedCourse.contentRating}/5</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-foreground mb-2 text-sm">Course Information</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Credits</span>
                            <span className="font-semibold text-sm">{selectedCourse.credits}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Department</span>
                            <span className="font-semibold text-sm">{selectedCourse.department}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Enrollment</span>
                            <span className="font-semibold text-sm">{selectedCourse.enrollmentCount}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-foreground mb-2 text-sm">Feedback Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Total Responses</span>
                            <span className="font-semibold text-sm">{selectedCourse.responseCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Response Rate</span>
                            <span className="font-semibold text-sm">
                              {selectedCourse.enrollmentCount > 0 
                                ? Math.round((selectedCourse.responseCount / selectedCourse.enrollmentCount) * 100)
                                : 0}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Trend</span>
                            <Badge variant={selectedCourse.trend === 'positive' ? 'default' : selectedCourse.trend === 'stable' ? 'secondary' : 'destructive'}>
                              {selectedCourse.trend}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-foreground text-sm">AI Analysis</h4>
                      <Button 
                        onClick={generateCourseInsights}
                        disabled={isGeneratingInsights}
                        size="sm"
                        className="gap-2"
                      >
                        <Brain className="w-4 h-4" />
                        {isGeneratingInsights ? 'Analyzing...' : 'Generate'}
                      </Button>
                    </div>
                    
                     {isGeneratingInsights ? (
                       <div className="flex flex-col items-center justify-center py-12 space-y-4">
                         <div className="relative">
                           <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                           <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-accent rounded-full animate-spin" style={{ animationDelay: '150ms' }}></div>
                         </div>
                         <div className="text-center space-y-2">
                           <p className="text-sm font-medium text-foreground">Analyzing Course Data</p>
                           <p className="text-xs text-muted-foreground">AI is processing {selectedCourse.responseCount} feedback responses...</p>
                         </div>
                         <div className="flex space-x-1">
                           <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                           <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                           <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                         </div>
                       </div>
                     ) : aiInsights ? (
                       <div className="space-y-4">
                         <div>
                           <h5 className="font-medium text-success mb-2 text-sm">Strengths</h5>
                           <div className="space-y-1">
                              {aiInsights.strengths.map((strength, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                                  <p className="text-xs text-foreground">{typeof strength === 'string' ? strength : JSON.stringify(strength)}</p>
                                </div>
                              ))}
                           </div>
                         </div>
                         
                         <div>
                           <h5 className="font-medium text-destructive mb-2 text-sm">Weaknesses</h5>
                           <div className="space-y-1">
                              {aiInsights.weaknesses.map((weakness, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                                  <p className="text-xs text-foreground">{typeof weakness === 'string' ? weakness : JSON.stringify(weakness)}</p>
                                </div>
                              ))}
                           </div>
                         </div>
                         
                         <div>
                           <h5 className="font-medium text-primary mb-2 text-sm">Improvements</h5>
                           <div className="space-y-1">
                              {aiInsights.improvements.map((improvement, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                  <p className="text-xs text-foreground">{typeof improvement === 'string' ? improvement : JSON.stringify(improvement)}</p>
                                </div>
                              ))}
                           </div>
                         </div>
                       </div>
                     ) : (
                       <div className="text-center py-8 text-muted-foreground">
                         <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                         <p className="mb-2 text-sm">No insights generated yet</p>
                         <p className="text-xs">Click "Generate" to analyze course with AI</p>
                       </div>
                     )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseEvaluation;
