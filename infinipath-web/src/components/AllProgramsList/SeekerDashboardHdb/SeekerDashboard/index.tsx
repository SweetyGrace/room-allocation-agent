import React, { useState, useEffect } from 'react';
import { UserListItem, UserDetails } from '../../../../types/details';
import { fetchUsers, fetchUserDetails } from '../../../../services/seekerDetails';
import UserList from '../index';
import UserDetailsComponent from '../SeekerDetails';
import styles from './index.module.scss';
import { getUserDetailsById } from '../../../../types/mockData';

const SeekerDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [view, setView] = useState<'list' | 'details'>('list');

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleUserClick = async (userId: number) => {
    setSelectedUser(userId ? getUserDetailsById(userId) : null);
    setView('details');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedUser(null);
  };
  return (
    <div className={styles.dashboard}>
      {view === 'list' ? (
        <div>
          <UserList
            data={users}
            onRowClick={handleUserClick}
            loading={loading}
          />
        </div>
      ) : (
        <UserDetailsComponent
          userDetails={selectedUser}
          onBack={handleBackToList}
          loading={detailsLoading}
          role='admin'
        />
      )}
    </div>
  );
};

export default SeekerDashboard;