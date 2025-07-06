-- Remove Student Performance Analysis report completely
DELETE FROM public.generated_reports WHERE category_id = 7;
DELETE FROM public.report_categories WHERE id = 7;

-- Update report descriptions to reflect latest month analysis only
UPDATE public.report_categories 
SET description = 'In-depth analysis of student feedback patterns and trends from the latest month, providing actionable insights for immediate improvement.'
WHERE title = 'Comprehensive Feedback Analysis';

UPDATE public.report_categories 
SET description = 'Current month departmental performance overview with efficiency metrics and key performance indicators.'
WHERE title = 'Department Performance Overview';

UPDATE public.report_categories 
SET description = 'Latest month evaluation of lecturer teaching effectiveness, student engagement, and performance metrics.'
WHERE title = 'Overall Lecturer Performance Report';

UPDATE public.report_categories 
SET description = 'Current month sentiment analysis of feedback data with trending patterns and immediate actionable insights.'
WHERE title = 'Sentiment Trends Report & Interpretation';

UPDATE public.report_categories 
SET description = 'Latest month analysis of student satisfaction levels across courses, based on recent feedback metrics.'
WHERE title = 'Student Satisfaction Analysis Report';

UPDATE public.report_categories 
SET description = 'Current month assessment of teaching methodologies, course delivery effectiveness, and educational outcomes.'
WHERE title = 'Teaching Quality Assessment';