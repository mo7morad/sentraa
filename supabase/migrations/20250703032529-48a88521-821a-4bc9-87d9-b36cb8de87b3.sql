
-- Simply add the category_id foreign key to generated_reports table
ALTER TABLE public.generated_reports 
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES public.report_categories(id);

-- Update existing generated_reports to map to the correct categories based on report names
UPDATE public.generated_reports 
SET category_id = (
    CASE 
        WHEN report_name ILIKE '%student%performance%' THEN 7
        WHEN report_name ILIKE '%student%satisfaction%' THEN 8
        WHEN report_name ILIKE '%lecturer%performance%' THEN 1
        WHEN report_name ILIKE '%teaching%quality%' THEN 2
        WHEN report_name ILIKE '%feedback%analysis%' THEN 5
        WHEN report_name ILIKE '%sentiment%' THEN 6
        WHEN report_name ILIKE '%department%overview%' THEN 3
        WHEN report_name ILIKE '%department%forecasting%' THEN 4
        ELSE 1
    END
)
WHERE category_id IS NULL;

-- Make category_id NOT NULL
ALTER TABLE public.generated_reports 
ALTER COLUMN category_id SET NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_generated_reports_category_id ON public.generated_reports(category_id);
