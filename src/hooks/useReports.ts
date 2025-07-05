
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReportCategory {
  id: number;
  title: string;  // Changed from category_name to title to match DB
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneratedReport {
  id: string;
  category_id: number;
  report_name: string;
  status: string;
  file_size_bytes: number | null;
  download_count: number;
  generated_by: string | null;
  created_at: string;
  updated_at: string;
  report_categories?: ReportCategory;
}

export const useReports = () => {
  return useQuery({
    queryKey: ["generated-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_reports")
        .select(`
          *,
          report_categories (
            id,
            title,
            description,
            is_active
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching generated reports:", error);
        throw error;
      }

      return data as GeneratedReport[];
    },
  });
};

export const useReportCategories = () => {
  return useQuery({
    queryKey: ["report-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_categories")
        .select("*")
        .eq("is_active", true)
        .order("title");

      if (error) {
        console.error("Error fetching report categories:", error);
        throw error;
      }

      return data as ReportCategory[];
    },
  });
};

export const useReportsStats = () => {
  return useQuery({
    queryKey: ["reports-stats"],
    queryFn: async () => {
      const currentMonth = new Date();
      const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const thisMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      // Get this month's reports
      const { data: thisMonthReports, error: thisMonthError } = await supabase
        .from("generated_reports")
        .select("id")
        .gte("created_at", thisMonthStart.toISOString());

      if (thisMonthError) {
        console.error("Error fetching this month's reports:", thisMonthError);
        throw thisMonthError;
      }

      // Get last month's reports
      const { data: lastMonthReports, error: lastMonthError } = await supabase
        .from("generated_reports")
        .select("id")
        .gte("created_at", lastMonth.toISOString())
        .lt("created_at", thisMonthStart.toISOString());

      if (lastMonthError) {
        console.error("Error fetching last month's reports:", lastMonthError);
        throw lastMonthError;
      }

      const thisMonthCount = thisMonthReports?.length || 0;
      const lastMonthCount = lastMonthReports?.length || 0;
      const difference = thisMonthCount - lastMonthCount;

      return {
        thisMonthCount,
        lastMonthCount,
        difference,
        percentageChange: lastMonthCount > 0 ? Math.round((difference / lastMonthCount) * 100) : 0
      };
    },
  });
};
