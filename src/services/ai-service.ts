import { supabase } from "@/integrations/supabase/client";

export interface AIInsightResponse {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary?: string;
  sentimentAnalysis?: string;
  fullContent?: string;
}

export type AIInsightType = 'feedback_analysis' | 'course_evaluation' | 'lecturer_performance' | 'report_generation';

class AIService {
  private cache = new Map<string, { data: AIInsightResponse; timestamp: number }>();
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds - very short cache for testing

  private getCacheKey(type: AIInsightType, data: any): string {
    // Create a unique hash based on actual data content for unique insights
    const dataString = JSON.stringify(data);
    const hash = this.simpleHash(dataString);
    return `${type}_${hash}_${Date.now()}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private isValidCacheEntry(entry: { data: AIInsightResponse; timestamp: number }): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }

  async generateInsights(
    type: AIInsightType,
    data: any,
    customPrompt?: string
  ): Promise<AIInsightResponse> {
    const cacheKey = this.getCacheKey(type, data);
    const cached = this.cache.get(cacheKey);

    // Return cached result if valid
    if (cached && this.isValidCacheEntry(cached)) {
      console.log(`Returning cached AI insights for ${type}`);
      return cached.data;
    }

    try {
      console.log(`Generating AI insights for ${type}`, { dataLength: JSON.stringify(data).length });

      const { data: response, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          type,
          data,
          customPrompt
        }
      });

      if (error) {
        console.error('AI insights function error:', error);
        throw new Error(`AI service error: ${error.message}`);
      }

      if (!response?.success) {
        throw new Error('AI service returned unsuccessful response');
      }

      const insights: AIInsightResponse = response.insights;

      // Cache the result
      this.cache.set(cacheKey, {
        data: insights,
        timestamp: Date.now()
      });

      console.log(`AI insights generated successfully for ${type}`);
      return insights;

    } catch (error) {
      console.error(`Error generating AI insights for ${type}:`, error);
      
      // Return fallback insights
      return this.getFallbackInsights(type);
    }
  }

  async generateFeedbackInsights(feedbackData: any[]): Promise<AIInsightResponse> {
    return this.generateInsights('feedback_analysis', feedbackData);
  }

  async generateCourseInsights(courseData: any): Promise<AIInsightResponse> {
    return this.generateInsights('course_evaluation', courseData);
  }

  async generateLecturerInsights(lecturerData: any): Promise<AIInsightResponse> {
    return this.generateInsights('lecturer_performance', lecturerData);
  }

  async generateReportInsights(reportData: any): Promise<AIInsightResponse> {
    return this.generateInsights('report_generation', reportData);
  }

  private getFallbackInsights(type: AIInsightType): AIInsightResponse {
    const fallbacks = {
      feedback_analysis: {
        strengths: ['Students appreciate clear communication', 'Overall positive engagement observed'],
        weaknesses: ['Some areas need attention', 'Response patterns indicate improvement opportunities'],
        improvements: ['Enhance feedback collection methods', 'Focus on identified weak areas'],
        summary: 'AI analysis temporarily unavailable. Fallback insights provided.'
      },
      course_evaluation: {
        strengths: ['Course structure is well-received', 'Teaching methods show effectiveness'],
        weaknesses: ['Content delivery can be enhanced', 'Student engagement varies'],
        improvements: ['Update course materials', 'Implement more interactive elements'],
        summary: 'AI analysis temporarily unavailable. Fallback insights provided.'
      },
      lecturer_performance: {
        strengths: ['Strong teaching foundation', 'Good student interaction'],
        weaknesses: ['Professional development opportunities exist', 'Feedback integration needed'],
        improvements: ['Attend pedagogical training', 'Increase student feedback incorporation'],
        summary: 'AI analysis temporarily unavailable. Fallback insights provided.'
      },
      report_generation: {
        strengths: ['Data collection is comprehensive', 'Metrics show institutional health'],
        weaknesses: ['Analysis depth can be improved', 'Trend identification needs enhancement'],
        improvements: ['Implement advanced analytics', 'Create regular reporting cycles'],
        summary: 'AI analysis temporarily unavailable. Fallback insights provided.'
      }
    };

    return fallbacks[type] || fallbacks.feedback_analysis;
  }

  clearCache(): void {
    this.cache.clear();
    console.log('AI service cache cleared');
  }

  getCacheStats(): { size: number; entries: string[] } {
    const entries = Array.from(this.cache.keys());
    return {
      size: this.cache.size,
      entries
    };
  }
}

export const aiService = new AIService();