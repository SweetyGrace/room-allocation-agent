export interface StatCardProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  highlighted?: boolean;
}

export interface PieChartProps {
  cityData: Record<string, number>;
  agePercentagesData: Record<string, number>;
}

export interface BarChartProps {
  labels: string[];
  data: number[];
  title?: string;
}

