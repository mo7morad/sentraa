
import React from "react";
import { TrendingUp, Star, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer } from "@/components/ChartContainer";

interface TopImprovingLecturersProps {
  lecturerData: Array<{
    id: string;
    name: string;
    department: string;
    rating: number;
    totalFeedback: number;
    trend: string;
  }>;
  selectedDepartment?: string;
}

const TopImprovingLecturers: React.FC<TopImprovingLecturersProps> = ({ lecturerData, selectedDepartment }) => {
  // Get top 5 lecturers with positive trends and good ratings, filtered by department
  const topImproving = lecturerData
    .filter(lecturer => {
      const matchesTrend = lecturer.trend === 'positive' && lecturer.totalFeedback >= 3;
      const matchesDepartment = !selectedDepartment || selectedDepartment === 'all' || lecturer.department === selectedDepartment;
      return matchesTrend && matchesDepartment;
    })
    .sort((a, b) => {
      // Sort by rating first, then by feedback count
      if (a.rating !== b.rating) return b.rating - a.rating;
      return b.totalFeedback - a.totalFeedback;
    })
    .slice(0, 5);

  return (
    <ChartContainer
      title="Top Improving Lecturers"
      description="Lecturers showing excellent performance and positive feedback trends"
      className="animate-slide-up"
    >
      <div className="space-y-3">
        {topImproving.length > 0 ? (
          topImproving.map((lecturer, index) => (
            <div
              key={lecturer.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{lecturer.name}</h4>
                  <p className="text-xs text-muted-foreground">{lecturer.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-warning fill-warning" />
                  <span className="font-semibold text-sm">{lecturer.rating}</span>
                </div>
                <Badge variant="outline" className="text-xs gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Improving
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {lecturer.totalFeedback}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No improving lecturers data available</p>
          </div>
        )}
      </div>
    </ChartContainer>
  );
};

export default TopImprovingLecturers;
