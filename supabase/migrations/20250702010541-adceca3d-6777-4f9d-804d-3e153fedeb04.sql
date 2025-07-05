-- Create reports table for tracking generated reports
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(100) NOT NULL,
    report_category VARCHAR(100) NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_size_bytes INTEGER,
    download_count INTEGER DEFAULT 0,
    generated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_reports_created_at ON public.reports(created_at);
CREATE INDEX idx_reports_type_category ON public.reports(report_type, report_category);
CREATE INDEX idx_reports_status ON public.reports(status);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing reports (can be adjusted based on user roles later)
CREATE POLICY "Users can view all reports" 
ON public.reports 
FOR SELECT 
USING (true);

-- Create policy for creating reports (can be adjusted based on user roles later)
CREATE POLICY "Users can create reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data for demonstration
INSERT INTO public.reports (report_type, report_category, report_name, status, file_size_bytes, download_count, created_at) VALUES
('student-performance', 'Student Performance', 'Student Performance Analysis - Fall 2024', 'completed', 1887436, 23, NOW() - INTERVAL '2 days'),
('lecturer-performance', 'Faculty & Teaching', 'Overall Lecturer Performance Report', 'completed', 1572864, 15, NOW() - INTERVAL '4 days'),
('feedback-analysis', 'Student Feedback', 'Comprehensive Feedback Analysis', 'processing', NULL, 0, NOW() - INTERVAL '1 day'),
('department-performance', 'Operational Insights', 'Department Performance Overview', 'completed', 2097152, 31, NOW() - INTERVAL '8 days'),
('teaching-quality', 'Faculty & Teaching', 'Teaching Quality Assessment', 'completed', 2204425, 12, NOW() - INTERVAL '6 days'),
('sentiment-trends', 'Student Feedback', 'Sentiment Trends Report & Interpretation', 'completed', 2306867, 8, NOW() - INTERVAL '10 days'),
('student-performance', 'Student Performance', 'Student Performance Analysis - Summer 2024', 'completed', 1654789, 45, NOW() - INTERVAL '25 days'),
('lecturer-performance', 'Faculty & Teaching', 'Overall Lecturer Performance Report - Q3', 'completed', 1698745, 28, NOW() - INTERVAL '18 days');