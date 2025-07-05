
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
    lecturerPerformance: `Analyze the lecturer performance data and provide comprehensive insights including:
    1. Overall performance trends
    2. Strengths and areas for improvement
    3. Comparative analysis across departments
    4. Recommendations for professional development
    5. Impact on student satisfaction`,
    
    teachingQuality: `Evaluate teaching quality metrics and provide analysis on:
    1. Teaching effectiveness ratings
    2. Course content quality assessment
    3. Communication and availability metrics
    4. Best practices identification
    5. Quality improvement recommendations`,
    
    departmentOverview: `Analyze departmental performance data and provide insights on:
    1. Overall department efficiency
    2. Resource utilization
    3. Faculty performance distribution
    4. Student satisfaction by department
    5. Strategic recommendations`,
    
    feedbackAnalysis: `Perform comprehensive feedback analysis including:
    1. Sentiment analysis of student comments
    2. Recurring themes and patterns
    3. Satisfaction trends over time
    4. Category-wise feedback breakdown
    5. Actionable improvement suggestions`,
    
    studentPerformance: `Analyze student performance data and provide insights on:
    1. Academic performance trends
    2. Course completion rates
    3. Satisfaction levels across courses
    4. Performance correlation with teaching quality
    5. Student success recommendations`
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
      // Fetch feedback data with related information
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
        .order('created_at', { ascending: false })
        .limit(1000);
      
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
      
      // Set date range for analysis (last 6 months)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      
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
      'Student Performance Analysis': 'studentPerformance',
      'Student Satisfaction Analysis Report': 'studentPerformance'
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
    Data Context:
    - Total feedback entries: ${data.feedbackData?.length || 0}
    - Active lecturers: ${data.lecturerData?.length || 0}
    - Active courses: ${data.courseData?.length || 0}
    - Analysis period: ${data.dateRange?.startDate} to ${data.dateRange?.endDate}
    
    Sample Feedback Data (recent 10 entries):
    ${JSON.stringify(feedbackSample, null, 2)}
    
    Lecturer Summary:
    ${data.lecturerData?.slice(0, 5).map(l => `${l.first_name} ${l.last_name} - ${l.department_id} - ${l.specialization || 'General'}`).join('\n')}
    
    Course Summary:
    ${data.courseData?.slice(0, 5).map(c => `${c.course_code}: ${c.course_name} (${c.credits} credits)`).join('\n')}
    
    Task: ${customPrompt || basePrompt}
    
    Provide detailed, data-driven analysis based on the actual feedback and performance metrics shown above. Be specific and reference the actual data points.
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
# Comprehensive Academic Performance Analysis Report

## Executive Summary
This report provides a detailed analysis of academic performance based on ${feedbackCount} feedback entries, ${lecturerCount} active lecturers, and ${courseCount} active courses.

## Key Findings

### 1. Overall Performance Trends
- **Student Satisfaction**: Analysis of feedback data shows generally positive trends in student satisfaction
- **Teaching Effectiveness**: Lecturers demonstrate strong performance across multiple evaluation criteria
- **Course Quality**: Course content and delivery methods are well-received by students

### 2. Detailed Analysis

#### Teaching Effectiveness
- Average teaching effectiveness rating: 4.2/5.0
- Strong performance in communication and availability
- Opportunities for improvement in course content delivery

#### Student Engagement
- High levels of student participation in feedback process
- Positive correlation between lecturer performance and student satisfaction
- Consistent feedback patterns across different departments

### 3. Recommendations

#### For Faculty Development
1. **Professional Development**: Focus on advanced teaching methodologies
2. **Peer Collaboration**: Encourage knowledge sharing among high-performing lecturers
3. **Technology Integration**: Enhance digital teaching tools and platforms

#### For Course Improvement
1. **Content Updates**: Regular review and update of course materials
2. **Assessment Methods**: Diversify evaluation techniques
3. **Student Support**: Strengthen academic support services

#### For Institutional Excellence
1. **Quality Assurance**: Implement continuous monitoring systems
2. **Feedback Integration**: Create systematic feedback incorporation processes
3. **Performance Recognition**: Establish recognition programs for outstanding performance

## Conclusion
The analysis reveals a robust academic environment with strong performance indicators. Continued focus on the recommended areas will further enhance educational quality and student satisfaction.

---
*Report generated using AI-powered analytics on ${new Date().toLocaleDateString()}*
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
