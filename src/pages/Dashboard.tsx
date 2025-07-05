
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Star,
  TrendingUp,
  Calendar,
  Award,
  BarChart3
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { useStudents, useLecturers, useCourses, useCourseOfferings, useFeedback, useDepartments } from "@/hooks/useData";

// Clean color palette for charts
const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981', 
  warning: '#f59e0b',
  danger: '#ef4444',
  secondary: '#6366f1',
  accent: '#8b5cf6',
  muted: '#64748b'
};

const Dashboard = () => {
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: lecturers, isLoading: lecturersLoading } = useLecturers();
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: courseOfferings } = useCourseOfferings();
  const { data: feedback, isLoading: feedbackLoading } = useFeedback();
  const { data: departments } = useDepartments();

  // Debug logging to verify data
  console.log('Dashboard Data Check:', {
    studentsCount: students?.length || 0,
    lecturersCount: lecturers?.length || 0,
    coursesCount: courses?.length || 0,
    courseOfferingsCount: courseOfferings?.length || 0,
    feedbackCount: feedback?.length || 0,
    departmentsCount: departments?.length || 0
  });

  // Key metrics for top cards
  const keyMetrics = useMemo(() => {
    const totalStudents = students?.length || 0;
    const activeStudents = students?.filter(s => s.is_active === true)?.length || 0;
    const totalLecturers = lecturers?.length || 0;
    const activeCourses = courseOfferings?.filter(co => co.is_active)?.length || 0;
    
    // Current satisfaction rating - get latest month's average rating
    const validFeedback = feedback?.filter(f => f.overall_rating && f.overall_rating > 0) || [];
    
    // Get the latest month's feedback
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const latestMonthFeedback = validFeedback.filter(f => {
      if (!f.created_at) return false;
      const feedbackDate = new Date(f.created_at);
      return feedbackDate.getMonth() === currentMonth && feedbackDate.getFullYear() === currentYear;
    });
    
    // If no feedback for current month, get the most recent month with feedback
    let recentFeedback = latestMonthFeedback;
    if (recentFeedback.length === 0) {
      const feedbackByMonth = new Map();
      validFeedback.forEach(f => {
        const date = new Date(f.created_at);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!feedbackByMonth.has(monthKey)) {
          feedbackByMonth.set(monthKey, []);
        }
        feedbackByMonth.get(monthKey).push(f);
      });
      
      const sortedMonths = Array.from(feedbackByMonth.keys()).sort().reverse();
      if (sortedMonths.length > 0) {
        recentFeedback = feedbackByMonth.get(sortedMonths[0]) || [];
      }
    }
    
    const avgCourseRating = recentFeedback.length > 0 ? 
      recentFeedback.reduce((sum, f) => sum + (f.overall_rating || 0), 0) / recentFeedback.length : 
      validFeedback.length > 0 ? 
        validFeedback.reduce((sum, f) => sum + (f.overall_rating || 0), 0) / validFeedback.length : 0;

    console.log('Key Metrics Calculation:', {
      totalStudents,
      activeStudents,
      totalLecturers,
      activeCourses,
      recentFeedbackCount: recentFeedback.length,
      avgCourseRating: Math.round(avgCourseRating * 10) / 10
    });

    return {
      totalStudents,
      activeStudents,
      totalLecturers, 
      activeCourses,
      avgCourseRating: Math.round(avgCourseRating * 10) / 10
    };
  }, [students, lecturers, courseOfferings, feedback]);

  // Student distribution by department using live data
  const studentsByDepartment = useMemo(() => {
    if (!students || !departments) return [];
    
    const deptCounts = departments.map(dept => {
      const studentCount = students.filter(student => student.department_id === dept.id).length;
      return {
        id: dept.id,
        name: dept.department_name,
        students: studentCount
      };
    });

    console.log('Students by Department:', deptCounts);
    return deptCounts.sort((a, b) => a.id - b.id);
  }, [students, departments]);

  // FIXED: Lecturer Performance Distribution using the exact SQL query logic
  const lecturerPerformanceData = React.useMemo(() => {
    if (!lecturers || !feedback || !courseOfferings) return [];
    
    // Implement the SQL query logic: lecturers INNER JOIN course_offerings LEFT JOIN feedback
    const lecturerStats = lecturers.map(lecturer => {
      // Get course offerings for this lecturer
      const lecturerCourseOfferings = courseOfferings.filter(
        co => co.lecturer_id === lecturer.id
      );
      
      // Get feedback for all course offerings of this lecturer
      const lecturerFeedback = feedback.filter(fb => 
        lecturerCourseOfferings.some(co => co.id === fb.course_offering_id)
      );
      
      const avgOverallRating = lecturerFeedback.length > 0
        ? lecturerFeedback.reduce((sum, fb) => sum + (fb.overall_rating || 0), 0) / lecturerFeedback.length
        : 0;

      return {
        lecturer_id: lecturer.id,
        lecturer_full_name: `${lecturer.first_name} ${lecturer.last_name}`,
        total_feedback_received: lecturerFeedback.length,
        average_overall_rating: Math.round(avgOverallRating * 100) / 100
      };
    });

    // Sort by average_overall_rating DESC NULLS LAST, then by total_feedback_received DESC
    const sortedStats = lecturerStats.sort((a, b) => {
      if (a.average_overall_rating === 0 && b.average_overall_rating === 0) {
        return b.total_feedback_received - a.total_feedback_received;
      }
      if (a.average_overall_rating === 0) return 1; // NULLS LAST
      if (b.average_overall_rating === 0) return -1; // NULLS LAST
      if (a.average_overall_rating !== b.average_overall_rating) {
        return b.average_overall_rating - a.average_overall_rating; // DESC
      }
      return b.total_feedback_received - a.total_feedback_received; // DESC
    });

    // Group by rating ranges for the chart
    const ratingRanges = [
      { range: "0-1", min: 0, max: 1, count: 0, color: CHART_COLORS.danger },
      { range: "1-2", min: 1, max: 2, count: 0, color: '#fb923c' },
      { range: "2-3", min: 2, max: 3, count: 0, color: CHART_COLORS.warning },
      { range: "3-4", min: 3, max: 4, count: 0, color: '#84cc16' },
      { range: "4-5", min: 4, max: 5, count: 0, color: CHART_COLORS.success }
    ];

    // Only count lecturers who have received feedback
    const lecturersWithFeedback = sortedStats.filter(lecturer => lecturer.total_feedback_received > 0);

    lecturersWithFeedback.forEach(lecturer => {
      const rating = lecturer.average_overall_rating;
      if (rating === 0) return; // Skip lecturers with no rating
      
      const range = ratingRanges.find(r => rating >= r.min && (rating < r.max || (r.max === 5 && rating <= r.max)));
      if (range) range.count++;
    });

    console.log('Lecturer Performance Distribution (Fixed):', {
      totalLecturers: lecturers.length,
      lecturersWithFeedback: lecturersWithFeedback.length,
      ratingRanges,
      sampleLecturers: lecturersWithFeedback.slice(0, 5) // Show top 5 for debugging
    });

    return ratingRanges;
  }, [lecturers, feedback, courseOfferings]);

  // Courses satisfaction trend over last 6 months
  const coursesSatisfactionTrend = useMemo(() => {
    if (!feedback) return [];

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = new Map();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyData.set(monthKey, { month: monthName, avgRating: 0, count: 0 });
    }

    // Process feedback data
    feedback.forEach(f => {
      if (!f.overall_rating || !f.created_at) return;
      
      const feedbackDate = new Date(f.created_at);
      if (feedbackDate < sixMonthsAgo) return;
      
      const monthKey = feedbackDate.toISOString().slice(0, 7);
      const monthData = monthlyData.get(monthKey);
      
      if (monthData) {
        monthData.avgRating = ((monthData.avgRating * monthData.count) + f.overall_rating) / (monthData.count + 1);
        monthData.count++;
      }
    });

    return Array.from(monthlyData.values())
      .map(data => ({
        ...data,
        avgRating: Math.round(data.avgRating * 10) / 10
      }));
  }, [feedback]);

  // Feedback sentiment over time with live data
  const feedbackSentimentOverTime = useMemo(() => {
    if (!feedback) return [];

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = new Map();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyData.set(monthKey, { 
        month: monthName, 
        Positive: 0, 
        Neutral: 0, 
        Negative: 0,
        total: 0
      });
    }

    // Process feedback data and categorize by sentiment
    feedback.forEach(f => {
      if (!f.overall_rating || !f.created_at) return;
      
      const feedbackDate = new Date(f.created_at);
      if (feedbackDate < sixMonthsAgo) return;
      
      const monthKey = feedbackDate.toISOString().slice(0, 7);
      const monthData = monthlyData.get(monthKey);
      
      if (monthData) {
        monthData.total++;
        
        // Categorize sentiment based on rating
        if (f.overall_rating >= 4) {
          monthData.Positive++;
        } else if (f.overall_rating === 3) {
          monthData.Neutral++;
        } else {
          monthData.Negative++;
        }
      }
    });

    // Convert counts to percentages
    return Array.from(monthlyData.values()).map(data => {
      const total = data.total || 1;
      const positive = Math.round((data.Positive / total) * 100);
      const neutral = Math.round((data.Neutral / total) * 100);
      const negative = Math.round((data.Negative / total) * 100);
      
      // Ensure percentages don't exceed 100% due to rounding
      const sum = positive + neutral + negative;
      if (sum > 100) {
        const max = Math.max(positive, neutral, negative);
        if (positive === max) {
          return { month: data.month, Positive: positive - (sum - 100), Neutral: neutral, Negative: negative };
        } else if (neutral === max) {
          return { month: data.month, Positive: positive, Neutral: neutral - (sum - 100), Negative: negative };
        } else {
          return { month: data.month, Positive: positive, Neutral: neutral, Negative: negative - (sum - 100) };
        }
      }
      
      return {
        month: data.month,
        Positive: positive,
        Neutral: neutral,
        Negative: negative
      };
    });
  }, [feedback]);

  const isLoading = studentsLoading || lecturersLoading || coursesLoading || feedbackLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          University Dashboard
        </h1>
        <p className="text-muted-foreground">
          Comprehensive overview of academic performance and system health
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Students</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{keyMetrics.totalStudents}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">{keyMetrics.activeStudents} active</p>
              </div>
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Lecturers</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{keyMetrics.totalLecturers}</p>
                <p className="text-xs text-green-600 dark:text-green-400">faculty members</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Active Courses</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{keyMetrics.activeCourses}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">this semester</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Current Satisfaction Rating</p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{keyMetrics.avgCourseRating}/5</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">latest month feedback</p>
              </div>
              <Star className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Student Distribution by Department */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Student Distribution by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={studentsByDepartment}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                maxBarSize={50}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                  formatter={(value: any) => [value, 'Students']}
                />
                <Bar 
                  dataKey="students" 
                  fill={CHART_COLORS.primary} 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* FIXED: Lecturer Performance Distribution */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Lecturer Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={lecturerPerformanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                maxBarSize={50}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                <XAxis 
                  dataKey="range" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                  formatter={(value: any) => [`${value} lecturers`, 'Count']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {lecturerPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Courses Satisfaction Trend */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Courses Satisfaction Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={coursesSatisfactionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  domain={[0, 5]}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                  formatter={(value: any) => [`${value}/5`, 'Avg Rating']}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgRating" 
                  stroke={CHART_COLORS.secondary}
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: CHART_COLORS.secondary, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feedback Sentiment Overview */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Feedback Sentiment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={feedbackSentimentOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  domain={[0, 100]}
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                  formatter={(value: any, name: string) => [`${value}%`, name]}
                />
                <Area 
                  type="monotone" 
                  dataKey="Positive" 
                  stackId="1" 
                  stroke={CHART_COLORS.success} 
                  fill={CHART_COLORS.success}
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="Neutral" 
                  stackId="1" 
                  stroke={CHART_COLORS.warning} 
                  fill={CHART_COLORS.warning}
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="Negative" 
                  stackId="1" 
                  stroke={CHART_COLORS.danger} 
                  fill={CHART_COLORS.danger}
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
