import { createContext, useContext, useState } from 'react';

const HDBDashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(HDBDashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a HDBDashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [filters, setFilters] = useState(null);

  const updateFilters = (filters) => {
    setFilters(filters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const value = {
    filters,
    updateFilters,
    clearFilters,
  };

  return (
    <HDBDashboardContext.Provider value={value}>
      {children}
    </HDBDashboardContext.Provider>
  );
};