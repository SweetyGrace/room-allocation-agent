import { SvgIconComponent } from "@mui/icons-material";

export interface StatisticsCardProps {
  title: string;
  value: number | string;
  icon?: SvgIconComponent;
  backgroundColor?: string;
}
