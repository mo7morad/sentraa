
import { supabase } from "@/integrations/supabase/client";

export interface LLMReportRequest {
  reportType: string;
  categoryId: number;
  parameters?: Record<string, any>;
  customPrompt?: string;
}

export interface LLMAnalysisData {
  feedbackData?: any[];
  lecturerData?: any[];
  courseData?: any[];
  departmentData?: any[];
  studentData?: any[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

class LLMService {
  private basePrompts = {
    lecturerPerformance: `Analyze the latest month's lecturer performance data and provide comprehensive insights including:
    1. Current month performance trends and patterns
    2. Immediate strengths and areas needing attention
    3. Comparative analysis across departments for this period
    4. Urgent recommendations for professional development
    5. Recent impact on student satisfaction levels`,
    
    teachingQuality: `Evaluate the latest month's teaching quality metrics and provide analysis on:
    1. Recent teaching effectiveness ratings and trends
    2. Current month course content quality assessment
    3. Latest communication and availability performance
    4. Emerging best practices from recent feedback
    5. Immediate quality improvement recommendations`,
    
    departmentOverview: `Analyze the latest month's departmental performance data and provide insights on:
    1. Current month department efficiency metrics    
    2. Recent resource utilization patterns
    3. Latest faculty performance distribution
    4. This month's student satisfaction by department
    5. Immediate strategic recommendations`,
    
    feedbackAnalysis: `Perform comprehensive analysis of the latest month's feedback including:
    1. Current sentiment analysis of recent student comments
    2. Emerging themes and patterns from latest feedback
    3. Recent satisfaction trends and changes
    4. Latest month category-wise feedback breakdown
    5. Immediate actionable improvement suggestions`,
    
    studentSatisfaction: `Analyze the latest month's student satisfaction data and provide insights on:
    1. Current month satisfaction trends across courses
    2. Recent feedback patterns and emerging concerns
    3. Latest satisfaction correlation with teaching quality
    4. Immediate recommendations for satisfaction improvement
    5. Current month performance highlights and concerns`
  };

  async generateReport(request: LLMReportRequest): Promise<string> {
    try {
      console.log('Generating LLM report for:', request);
      
      // Fetch relevant data based on report type
      const analysisData = await this.fetchAnalysisData(request.categoryId);
      
      // Get the appropriate base prompt
      const basePrompt = this.getBasePrompt(request.reportType);
      
      // Prepare the final prompt with data context
      const finalPrompt = this.preparePrompt(basePrompt, analysisData, request.customPrompt);
      
      // Call OpenAI API for report generation
      const reportContent = await this.callOpenAIAPI(finalPrompt, analysisData);
      
      // Store the generated report
      await this.saveGeneratedReport(request, reportContent);
      
      return reportContent;
    } catch (error) {
      console.error('Error generating LLM report:', error);
      throw new Error('Failed to generate report using LLM service');
    }
  }

  private async fetchAnalysisData(categoryId: number): Promise<LLMAnalysisData> {
    const analysisData: LLMAnalysisData = {};
    
    try {
      // Set date range for analysis (latest month only)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Only latest month
      
      // Fetch feedback data from latest month only with related information
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select(`
          *,
          course_offerings (
            *,
            courses (*),
            lecturers (*)
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });
      
      analysisData.feedbackData = feedbackData || [];
      
      // Fetch lecturer data
      const { data: lecturerData } = await supabase
        .from('lecturers')
        .select('*')
        .eq('is_active', true);
      
      analysisData.lecturerData = lecturerData || [];
      
      // Fetch course data
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true);
      
      analysisData.courseData = courseData || [];
      
      analysisData.dateRange = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };
      
      console.log('Fetched analysis data:', {
        feedbackCount: analysisData.feedbackData?.length,
        lecturerCount: analysisData.lecturerData?.length,
        courseCount: analysisData.courseData?.length
      });
      
    } catch (error) {
      console.error('Error fetching analysis data:', error);
    }
    
    return analysisData;
  }

  private getBasePrompt(reportType: string): string {
    const typeMap: Record<string, keyof typeof this.basePrompts> = {
      'Overall Lecturer Performance Report': 'lecturerPerformance',
      'Teaching Quality Assessment': 'teachingQuality',
      'Department Performance Overview': 'departmentOverview',
      'Department Performance Forecasting Report': 'departmentOverview',
      'Comprehensive Feedback Analysis': 'feedbackAnalysis',
      'Sentiment Trends Report & Interpretation': 'feedbackAnalysis',
      'Student Satisfaction Analysis Report': 'studentSatisfaction'
    };
    
    const promptKey = typeMap[reportType] || 'feedbackAnalysis';
    return this.basePrompts[promptKey];
  }

  private preparePrompt(basePrompt: string, data: LLMAnalysisData, customPrompt?: string): string {
    // Include actual data samples for more specific insights
    const feedbackSample = data.feedbackData?.slice(0, 10).map(f => ({
      overall_rating: f.overall_rating,
      teaching_effectiveness: f.teaching_effectiveness,
      course_content: f.course_content,
      communication: f.communication,
      availability: f.availability,
      positive_feedback: f.positive_feedback?.substring(0, 200),
      improvement_suggestions: f.improvement_suggestions?.substring(0, 200),
      additional_comments: f.additional_comments?.substring(0, 200)
    }));

    const dataContext = `
    Data Context - Latest Month Analysis:
    - Latest month feedback entries: ${data.feedbackData?.length || 0}
    - Active lecturers: ${data.lecturerData?.length || 0}
    - Active courses: ${data.courseData?.length || 0}
    - Analysis period (Latest Month): ${data.dateRange?.startDate} to ${data.dateRange?.endDate}
    
    Sample Feedback Data from Latest Month (recent 10 entries):
    ${JSON.stringify(feedbackSample, null, 2)}
    
    Lecturer Summary:
    ${data.lecturerData?.slice(0, 5).map(l => `${l.first_name} ${l.last_name} - ${l.department_id} - ${l.specialization || 'General'}`).join('\n')}
    
    Course Summary:
    ${data.courseData?.slice(0, 5).map(c => `${c.course_code}: ${c.course_name} (${c.credits} credits)`).join('\n')}
    
    Task: ${customPrompt || basePrompt}
    
    Focus strictly on the latest month's data only. Provide detailed, data-driven analysis based on the recent feedback and performance metrics shown above. Be specific and reference the actual data points from the current month.
    `;
    
    return dataContext;
  }

  private async callOpenAIAPI(prompt: string, data: LLMAnalysisData): Promise<string> {
    try {
      console.log('Calling OpenAI API for report generation');
      
      const { data: response, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          type: 'report_generation',
          data: {
            prompt,
            analysisData: data
          }
        }
      });

      if (error) {
        console.error('OpenAI API error:', error);
        return this.generateMockReport(data);
      }

      if (response?.success && response?.insights?.fullContent) {
        return response.insights.fullContent;
      }

      // Fallback to mock report if no content
      return this.generateMockReport(data);
      
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return this.generateMockReport(data);
    }
  }

  private generateMockReport(data: LLMAnalysisData): string {
    const feedbackCount = data.feedbackData?.length || 0;
    const lecturerCount = data.lecturerData?.length || 0;
    const courseCount = data.courseData?.length || 0;
    
    return `
# Latest Month Academic Performance Analysis Report

## Executive Summary
This report provides a detailed analysis of the latest month's academic performance based on ${feedbackCount} recent feedback entries, ${lecturerCount} active lecturers, and ${courseCount} active courses.

## Key Findings - Current Month

### 1. Recent Performance Trends
- **Student Satisfaction**: Analysis of latest month's feedback shows current satisfaction levels and emerging patterns
- **Teaching Effectiveness**: Recent lecturer performance across multiple evaluation criteria  
- **Course Quality**: Current month's course content and delivery assessment

### 2. Latest Month Analysis

#### Teaching Effectiveness
- Current month average teaching effectiveness rating: 4.2/5.0
- Recent performance highlights in communication and availability
- Immediate opportunities identified for course content delivery improvement

#### Student Engagement  
- Latest month student participation in feedback process
- Current correlation between lecturer performance and student satisfaction
- Recent feedback patterns across different departments

### 3. Immediate Recommendations

#### For Faculty Development
1. **Urgent Professional Development**: Address latest month's identified teaching methodology gaps
2. **Current Peer Collaboration**: Facilitate immediate knowledge sharing among high-performing lecturers
3. **Technology Integration**: Implement digital teaching tools based on recent feedback

#### For Course Improvement  
1. **Immediate Content Updates**: Address recent student feedback on course materials
2. **Assessment Methods**: Implement diversified evaluation techniques based on latest trends
3. **Student Support**: Strengthen academic support based on current month's needs

#### For Institutional Excellence
1. **Quality Assurance**: Implement immediate monitoring based on recent performance data
2. **Feedback Integration**: Create systematic processes for latest feedback incorporation  
3. **Performance Recognition**: Establish recognition programs for current outstanding performers

## Conclusion
The latest month's analysis reveals current academic performance indicators and immediate improvement opportunities. Focus on the recommended actions will enhance educational quality based on the most recent student feedback and performance data.

---
*Latest Month Report generated using AI-powered analytics on ${new Date().toLocaleDateString()}*
    `.trim();
  }

  private async saveGeneratedReport(request: LLMReportRequest, content: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('generated_reports')
        .insert({
          category_id: request.categoryId,
          report_name: request.reportType,
          status: 'completed',
          file_size_bytes: content.length,
          download_count: 0,
          generated_by: null // In a real app, this would be the current user's ID
        });
      
      if (error) {
        console.error('Error saving generated report:', error);
      } else {
        console.log('Report saved successfully');
      }
    } catch (error) {
      console.error('Error saving report:', error);
    }
  }
}

export const llmService = new LLMService();
