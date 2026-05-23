
import { Card } from '../Common/Card';
import './index.css';

interface ProgramCardProps {
  title: string;
  description: string;
  dateRange: string;
  status: 'On Going' | 'Yet to start';
  icon?: string;
}

const ProgramCard = ({ title, description, dateRange, status }: ProgramCardProps) => {
  const statusClass = status === 'On Going' ? 'on-going' : 'yet-to-start';

  return (
    <Card className="program-card">
      <div className="program-card-header">
        <div className="program-card-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <span className={`program-card-status ${statusClass}`}>
          {status}
        </span>
      </div>
      
      <h3 className="program-card-title">{title}</h3>
      
      <p className="program-card-description">
        {description}
      </p>
      
      <p className="program-card-date">{dateRange}</p>
    </Card>
  );
};

export default ProgramCard;
