import React, { useEffect, useMemo, useState } from 'react';
import styles from "./index.module.scss";
import CommonDropdown from '../SeekerDashboardHdb/ProgramSelect';
import { GridColDef } from '@mui/x-data-grid';
import { EntrainmentData } from "../Entrainment/Data";
import { TatData } from "../Tat/Dashboard/Data"
import DataGridWithPagination from '../../../common/components/DataGridWithPagination';
import { mockUsers } from '../../../types/mockData';
import TabsComponent from '../SeekerDashboardHdb/TabsComponent';
import { fetchUserDetails } from '../../../services/seekerDetails';
import { UserDetails } from '../../../types/details';
import { getUserDetailsById } from '../../../types/mockData'; // Update this path
import SeekerDetails from '../SeekerDashboardHdb/SeekerDetails';
import { getCall } from '../../../services/apiService';
import { endPoints, PORTAL } from '../../../constants/urlConstants';


const DifferPrograms: React.FC = () => {
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
    const [view, setView] = useState<'list' | 'details'>('list');

    useEffect(() => {
        const path = window.location.pathname;

        if (path.includes('/entrainment')) {
            setLoading(true);
            setData(EntrainmentData);
        } else if (path.includes('/tat-online')) {
            setLoading(true);
            setData(TatData);
        } else if (path.includes('/seeker-dashboard')) {
            setLoading(true);
            setData(mockUsers);
        } else {
            setData([]);
        }
        setLoading(false);
    }, [window.location.pathname]);

    
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;

        const searchLower = searchTerm.toLowerCase();

        return data.filter((row: unknown) =>
            Object.values(row).some(val =>
                String(val).toLowerCase().includes(searchLower)
            )
        );
    }, [searchTerm, data]);

    const columns: GridColDef[] = useMemo(() => {
        if (!data || data.length === 0) return [];

        return Object.keys(data[0]).map((key) => ({
            field: key,
            headerName: key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase()),
            width: 200,
            sortable: false,
            renderCell: (params: unknown) => <span>{String(params.value)}</span>,
        }));
    }, [data]);


    // Handle tab change
    const handleTabChange = (count: number, label: string) => {
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleUserClick = async (userId: number) => {
        const path = window.location.pathname;
        
        if (path.includes('/seeker-dashboard')) {
            // For seeker dashboard, use mock data
            setLoading(true);
            const response = getCall(endPoints.adminPrograms, undefined, PORTAL);
            try {
                const userDetails = await response;
                if (userDetails) {
                    setSelectedUser(userDetails);
                    setView('details');
                } else {
                }
            } catch (error) {
                console.error('Error loading user details from mock data:', error);
            } finally {
                setLoading(false);
            }
        } else {
            // For other routes, make API call
            try {
                setLoading(true);
                const userDetails = await fetchUserDetails(userId);
                setSelectedUser(userDetails);
                setView('details');
            } catch (error) {
                console.error('Error loading user details from API:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleRowClick = (row: unknown) => {
        const path = window.location.pathname;
        const id = row.id ?? row.userId ?? row._id;
        
        if (path.includes('/seeker-dashboard')) {
        
          
            handleUserClick(id);
        } else {
            // For other routes, just console the row
        }
    };

    const handleBackToList = () => {
        setView('list');
        setSelectedUser(null);
    };

    const handleSeekersLIst = async() => {
    getCall(endPoints.RegisteredSeekersList, undefined, PORTAL)
    .then((response) => {
        const seekersList = response?.data?.data?.data || [];
        const users = seekersList.map(item => item.user);
        setData(users);
        setLoading(false);
    }
   
    ).catch((error) => {
        console.error("Error fetching registered seekers list:", error);
        setLoading(false);
     } )
    }

    useEffect(() => {
        handleSeekersLIst();
    }, []);
     
    return (
        <div className={styles.container}>
            {view === "list" ?
                <>
                    <div className={styles.dashboardHeader}>
                        <div className={styles.title}>
                            Dashboard
                        </div>
                        <CommonDropdown />
                    </div>
                 
                    <DataGridWithPagination
                        headers={columns}
                        seekersData={filteredData}
                        totalData={filteredData.length}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        loading={loading}
                        height="calc(100vh - 200px)"
                        onRowClick={handleRowClick}
                        withoutStartAt={true}
                        hoverImageClass={styles.hoverImage}
                    />
                </>
                :
                <>
                    <div>
                        <SeekerDetails
                            userDetails={selectedUser}
                            onBack={handleBackToList}
                            loading={loading}
                            role={'admin'}
                        />
                    </div>
                </>
            }
        </div>
    );
};

export default DifferPrograms;