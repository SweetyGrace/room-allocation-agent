import React, { useState } from 'react';
import { Send } from 'lucide-react';
import styles from './index.module.scss';
import GrayLine from '../../../../../common/components/GrayLine';

interface QuerySectionProps {
  onSendQuery?: (query: string, selectedUser: string) => void;
}

const QuerySection: React.FC<QuerySectionProps> = ({ onSendQuery }) => {
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('Praveen Kumar');

  const handleSendQuery = () => {
    if (query.trim() && onSendQuery) {
      onSendQuery(query, selectedUser);
      setQuery('');
    }
  };

  return (
    <div className={styles.querySection}>
      <div className={styles.queryHeader}>
      <h3>Send a query</h3>
      <GrayLine />
      </div>
      <div className={styles.queryForm}>
        <div className={styles.queryInputSection}>
          <label>Ask question</label>
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            className={styles.userSelect}
          >
            <option>Praveen Kumar</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default QuerySection;
