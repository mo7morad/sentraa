-- Add UPDATE policy for generated_reports table to allow incrementing download counts
CREATE POLICY "Users can update download counts on generated reports" 
ON public.generated_reports 
FOR UPDATE 
USING (true)
WITH CHECK (true);