-- Check if new report categories need to be inserted (they should already exist from previous migration)
-- Insert any missing categories if needed
INSERT INTO public.report_categories (category_name, description, icon_name, color_scheme) 
SELECT * FROM (VALUES 
    ('Student Performance', 'Comprehensive analysis of student academic performance and satisfaction', 'Users', 'chart-1'),
    ('Faculty & Teaching', 'Lecturer performance and teaching quality evaluation metrics', 'Star', 'chart-2'),
    ('Student Feedback', 'Comprehensive feedback analysis and sentiment insights', 'MessageSquare', 'chart-3'),
    ('Operational Insights', 'Department-level performance and operational metrics', 'Building2', 'chart-4')
) AS new_categories(category_name, description, icon_name, color_scheme)
WHERE NOT EXISTS (
    SELECT 1 FROM public.report_categories 
    WHERE report_categories.category_name = new_categories.category_name
);

-- Remove the report_type column from generated_reports table
ALTER TABLE public.generated_reports 
DROP COLUMN IF EXISTS report_type;

-- Update any indexes that might reference the dropped column
DROP INDEX IF EXISTS idx_generated_reports_type_status;

-- Create new index for category_id and status
CREATE INDEX IF NOT EXISTS idx_generated_reports_category_status ON public.generated_reports(category_id, status);