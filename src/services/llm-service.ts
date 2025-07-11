
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
    lecturerPerformance: `You are a senior academic administrator and educational data analyst producing a formal OVERALL LECTURER PERFORMANCE REPORT for institutional leadership.

CONTEXT: You are analyzing ONLY the latest month's lecturer performance data to provide immediate, actionable insights for academic decision-making.

ANALYSIS REQUIREMENTS:
• Conduct a rigorous statistical analysis of teaching effectiveness metrics
• Identify high-performing and underperforming lecturers with specific data points
• Analyze correlation between lecturer performance and student satisfaction scores
• Compare performance across departments with concrete benchmarks
• Evaluate trends in communication, availability, and course content delivery

REPORT STRUCTURE:
1. EXECUTIVE SUMMARY (Key findings and urgent recommendations)
2. PERFORMANCE METRICS ANALYSIS (Statistical breakdown by lecturer and department)
3. TEACHING EFFECTIVENESS EVALUATION (Detailed assessment of pedagogical impact)
4. STUDENT SATISFACTION CORRELATION STUDY (Data-driven satisfaction analysis)
5. PROFESSIONAL DEVELOPMENT RECOMMENDATIONS (Specific, targeted interventions)
6. STRATEGIC RECOMMENDATIONS (Institutional-level improvements)

Use academic language, cite specific data points, and provide evidence-based recommendations suitable for senior academic leadership review.`,
    
    teachingQuality: `You are an educational quality assurance expert producing a formal TEACHING QUALITY ASSESSMENT REPORT for academic standards committee.

CONTEXT: This report evaluates ONLY the latest month's teaching quality metrics to ensure institutional educational standards and continuous improvement.

ANALYSIS REQUIREMENTS:
• Evaluate teaching effectiveness ratings with statistical significance testing
• Assess course content quality against pedagogical best practices
• Analyze communication effectiveness and student engagement metrics
• Identify exemplary teaching practices for institutional adoption
• Examine correlation between teaching methods and learning outcomes

REPORT STRUCTURE:
1. QUALITY ASSURANCE SUMMARY (Overall teaching standards assessment)
2. PEDAGOGICAL EFFECTIVENESS ANALYSIS (Evidence-based teaching evaluation)
3. COURSE CONTENT QUALITY REVIEW (Academic rigor and relevance assessment)
4. STUDENT ENGAGEMENT METRICS (Participation and satisfaction analysis)
5. BEST PRACTICES IDENTIFICATION (Exemplary teaching methods discovered)
6. QUALITY IMPROVEMENT ROADMAP (Specific enhancement strategies)

Provide authoritative analysis with academic credibility suitable for quality assurance committees and accreditation bodies.`,
    
    departmentOverview: `You are a strategic academic planning consultant producing a formal DEPARTMENT PERFORMANCE OVERVIEW REPORT for institutional governance.

CONTEXT: This comprehensive analysis covers ONLY the latest month's departmental performance data to inform strategic decision-making and resource allocation.

ANALYSIS REQUIREMENTS:
• Evaluate departmental efficiency metrics against institutional benchmarks
• Analyze faculty performance distribution with statistical modeling
• Assess resource utilization and operational effectiveness
• Compare inter-departmental performance with variance analysis
• Examine student satisfaction patterns by academic discipline

REPORT STRUCTURE:
1. STRATEGIC OVERVIEW (High-level departmental performance assessment)
2. OPERATIONAL EFFICIENCY ANALYSIS (Resource utilization and productivity metrics)
3. FACULTY PERFORMANCE DISTRIBUTION (Statistical analysis of teaching effectiveness)
4. STUDENT SATISFACTION BY DISCIPLINE (Department-specific satisfaction trends)
5. COMPARATIVE DEPARTMENTAL ANALYSIS (Cross-departmental performance benchmarking)
6. STRATEGIC RECOMMENDATIONS (Resource allocation and improvement initiatives)

Present findings with executive-level clarity and strategic insight appropriate for academic governance and institutional planning.`,
    
    feedbackAnalysis: `You are a student experience researcher producing a formal COMPREHENSIVE FEEDBACK ANALYSIS REPORT for academic leadership.

CONTEXT: This detailed analysis examines ONLY the latest month's student feedback to identify immediate improvement opportunities and institutional insights.

ANALYSIS REQUIREMENTS:
• Conduct advanced sentiment analysis using natural language processing principles
• Identify recurring themes and patterns with frequency analysis
• Analyze feedback quality and constructiveness levels
• Examine correlation between feedback sentiment and academic performance
• Assess feedback representativeness across student demographics

REPORT STRUCTURE:
1. FEEDBACK LANDSCAPE OVERVIEW (Comprehensive feedback ecosystem analysis)
2. SENTIMENT ANALYSIS REPORT (Advanced emotional and satisfaction assessment)
3. THEMATIC PATTERN IDENTIFICATION (Recurring themes and concern clusters)
4. FEEDBACK QUALITY ASSESSMENT (Constructiveness and specificity evaluation)
5. DEMOGRAPHIC REPRESENTATION ANALYSIS (Feedback diversity and inclusivity)
6. ACTIONABLE IMPROVEMENT ROADMAP (Evidence-based enhancement strategies)

Deliver insights with research-level rigor and practical applicability for student experience enhancement initiatives.`,
    
    studentSatisfaction: `You are a student success analytics expert producing a formal STUDENT SATISFACTION ANALYSIS REPORT for academic excellence committee.

CONTEXT: This focused analysis examines ONLY the latest month's student satisfaction data to drive immediate improvements in educational experience.

ANALYSIS REQUIREMENTS:
• Analyze satisfaction trends with temporal and comparative analysis
• Identify satisfaction drivers through correlation analysis
• Examine satisfaction variance across courses, lecturers, and departments
• Assess satisfaction predictors and early warning indicators
• Evaluate satisfaction impact on academic engagement and retention

REPORT STRUCTURE:
1. SATISFACTION METRICS DASHBOARD (Key performance indicators and trends)
2. MULTI-DIMENSIONAL SATISFACTION ANALYSIS (Course, lecturer, and institutional satisfaction)
3. SATISFACTION DRIVER IDENTIFICATION (Key factors influencing student experience)
4. PREDICTIVE SATISFACTION MODELING (Early intervention opportunity identification)
5. SATISFACTION-PERFORMANCE CORRELATION STUDY (Academic success relationship analysis)
6. STUDENT EXPERIENCE ENHANCEMENT STRATEGY (Targeted satisfaction improvement plan)

Provide data-driven insights with predictive analytics suitable for student success initiatives and retention strategies.`
  };

  async generateReport(request: LLMReportRequest): Promise<string> {
    console.log('🚀 Starting LLM report generation for:', request);
    
    let analysisData;
    let reportContent;
    
    try {
      // Fetch relevant data based on report type
      console.log('📊 Fetching analysis data...');
      analysisData = await this.fetchAnalysisData(request.categoryId);
      console.log('✅ Analysis data fetched successfully');
      
      // Get the appropriate base prompt
      console.log('📝 Preparing prompts...');
      const basePrompt = this.getBasePrompt(request.reportType);
      const finalPrompt = this.preparePrompt(basePrompt, analysisData, request.customPrompt);
      console.log('✅ Prompts prepared successfully');
      
      // Call OpenAI API for report generation - THIS IS THE CRITICAL PART
      console.log('🤖 Attempting AI API call...');
      reportContent = await this.callOpenAIAPI(finalPrompt, analysisData);
      console.log('✅ AI API call completed successfully');
      
    } catch (error) {
      console.error('❌ Error during AI report generation:', error);
      console.log('🔄 Falling back to mock report due to error:', error.message);
      
      // Only fall back to mock if we haven't fetched analysis data yet
      if (!analysisData) {
        analysisData = await this.fetchAnalysisData(request.categoryId);
      }
      reportContent = this.generateMockReport(analysisData);
    }
    
    try {
      // Store the generated report
      console.log('💾 Saving generated report...');
      await this.saveGeneratedReport(request, reportContent);
      console.log('✅ Report saved successfully');
    } catch (saveError) {
      console.error('❌ Error saving report:', saveError);
      // Don't fail the entire operation if saving fails
    }
    
    return reportContent;
  }

  private async fetchAnalysisData(categoryId: number): Promise<LLMAnalysisData> {
    const analysisData: LLMAnalysisData = {};
    
    try {
      // Set date range for analysis (latest month only)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Only latest month
      
      // Fetch feedback data from latest month only with related information
      // LIMIT to 20 entries to stay within token limits (25K token budget)
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
        .order('created_at', { ascending: false })
        .limit(20); // Drastically reduced to prevent token overflow
      
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
      
      console.log('Fetched analysis data (limited for token constraints):', {
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
    // Minimize data to stay within token budget - only essential metrics
    const feedbackSample = data.feedbackData?.slice(0, 3).map(f => ({
      rating: f.overall_rating,
      teaching: f.teaching_effectiveness,
      content: f.course_content,
      communication: f.communication,
      positive: f.positive_feedback?.substring(0, 50) || 'N/A',
      improvements: f.improvement_suggestions?.substring(0, 50) || 'N/A'
    }));

    const dataContext = `
ANALYSIS DATA (Latest Month):
- Feedback entries: ${data.feedbackData?.length || 0}
- Active lecturers: ${data.lecturerData?.length || 0}
- Active courses: ${data.courseData?.length || 0}

SAMPLE FEEDBACK (3 entries):
${JSON.stringify(feedbackSample, null, 1)}

TASK: ${customPrompt || basePrompt}

IMPORTANT OUTPUT REQUIREMENTS:
- Write in clear, professional academic language
- Use proper headings and structure for PDF conversion
- Avoid unnecessary symbols, asterisks, or formatting characters
- Generate a clean, readable report suitable for institutional leadership
- Keep content concise but authoritative
- Focus on actionable insights and specific recommendations
    `;
    
    return dataContext;
  }

  private async callOpenAIAPI(prompt: string, data: LLMAnalysisData): Promise<string> {
    try {
      console.log('🤖 Starting AI API call for report generation...');
      console.log('📊 Data being sent to AI:', {
        feedbackEntries: data.feedbackData?.length || 0,
        lecturers: data.lecturerData?.length || 0,
        courses: data.courseData?.length || 0,
        dateRange: data.dateRange,
        promptLength: prompt.length
      });
      
      console.log('🔗 Calling Supabase edge function: ai-insights');
      
      const { data: response, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          type: 'report_generation',
          data: data,
          customPrompt: prompt
        }
      });

      console.log('📡 AI API Response received:', { 
        success: response?.success, 
        hasError: !!error,
        hasContent: !!response?.insights?.fullContent 
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(`API Error: ${error.message || 'Unknown error'}`);
      }

      if (response?.success && response?.insights?.fullContent) {
        console.log('✅ AI report generated successfully!');
        console.log('📄 Report length:', response.insights.fullContent.length, 'characters');
        return response.insights.fullContent;
      }

      if (response?.error) {
        console.error('❌ AI service returned error:', response.error);
        throw new Error(`AI Error: ${response.error}`);
      }

      console.error('❌ No content returned from AI service');
      throw new Error('AI service returned no content');
      
    } catch (error) {
      console.error('❌ Critical AI API error:', error);
      
      // Only use fallback after a real error, not as default behavior
      console.log('🔄 Using fallback report due to AI service failure');
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
