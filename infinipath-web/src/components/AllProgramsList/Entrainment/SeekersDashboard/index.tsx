// Updated ParentComponent
import { EntrainmentData } from '../Data';
import DynamicDataDashboard from '../../SeekerDashboardHdb';

const ParentComponent = () => {
  const handleRowClick = (id: string) => {
  };

  return (
    <DynamicDataDashboard
      data={EntrainmentData}
      loading={false}
      onRowClick={handleRowClick}
    />
  );
};

export default ParentComponent;