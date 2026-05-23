import { useMemo } from 'react';

import { TatData } from './Data';
import DynamicDataDashboard from '../../SeekerDashboardHdb';

const ParentComponent = () => {
  const handleRowClick = (id: string) => {
  };

  // Prepare session data without the users array
  const sessionDataWithoutUsers = useMemo(() => {
    return TatData.map(({ users, ...session }) => session);
  }, []);

  return (
    <DynamicDataDashboard
      data={sessionDataWithoutUsers} // for table display without users
      fullData={TatData} // optional: original full structure
      loading={false}
      onRowClick={handleRowClick}
    />
  );
};

export default ParentComponent;