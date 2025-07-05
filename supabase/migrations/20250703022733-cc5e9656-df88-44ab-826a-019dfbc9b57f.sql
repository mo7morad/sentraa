-- Create report_categories table for proper normalization
CREATE TABLE public.report_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50),
    color_scheme VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rename existing reports table to generated_reports
ALTER TABLE public.reports RENAME TO generated_reports;

-- Add category_id foreign key to generated_reports
ALTER TABLE public.generated_reports 
ADD COLUMN category_id INTEGER REFERENCES public.report_categories(id);

-- Insert report categories with proper metadata
INSERT INTO public.report_categories (category_name, description, icon_name, color_scheme) VALUES
('Student Performance', 'Comprehensive analysis of student academic performance and satisfaction', 'Users', 'chart-1'),
('Faculty & Teaching', 'Lecturer performance and teaching quality evaluation metrics', 'Star', 'chart-2'),
('Student Feedback', 'Comprehensive feedback analysis and sentiment insights', 'MessageSquare', 'chart-3'),
('Operational Insights', 'Department-level performance and operational metrics', 'Building2', 'chart-4');

-- Update existing records with proper category_id
UPDATE public.generated_reports 
SET category_id = (
    SELECT id FROM public.report_categories 
    WHERE category_name = generated_reports.report_category
);

-- Make category_id NOT NULL after data migration
ALTER TABLE public.generated_reports 
ALTER COLUMN category_id SET NOT NULL;

-- Remove the old report_category column
ALTER TABLE public.generated_reports 
DROP COLUMN report_category;

-- Insert new report types
INSERT INTO public.generated_reports (report_type, category_id, report_name, status, file_size_bytes, download_count, created_at) VALUES
('student-satisfaction', (SELECT id FROM public.report_categories WHERE category_name = 'Student Performance'), 'Student Satisfaction Analysis Report', 'completed', 1789432, 18, NOW() - INTERVAL '3 days'),
('department-forecasting', (SELECT id FROM public.report_categories WHERE category_name = 'Operational Insights'), 'Department Performance Forecasting Report', 'completed', 2156789, 25, NOW() - INTERVAL '5 days');

-- Create indexes for better performance
CREATE INDEX idx_generated_reports_category_id ON public.generated_reports(category_id);
CREATE INDEX idx_generated_reports_type_status ON public.generated_reports(report_type, status);
CREATE INDEX idx_report_categories_active ON public.report_categories(is_active) WHERE is_active = TRUE;

-- Create trigger for automatic timestamp updates on report_categories
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_report_categories_updated_at
BEFORE UPDATE ON public.report_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update RLS policies for new table names
DROP POLICY IF EXISTS "Users can view all reports" ON public.generated_reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.generated_reports;

CREATE POLICY "Users can view all generated reports" 
ON public.generated_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create generated reports" 
ON public.generated_reports 
FOR INSERT 
WITH CHECK (true);

-- Enable RLS on report_categories
ALTER TABLE public.report_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Report categories are viewable by everyone" 
ON public.report_categories 
FOR SELECT 
USING (true);