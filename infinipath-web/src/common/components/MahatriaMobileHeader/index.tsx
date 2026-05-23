import React from 'react';
import styles from './index.module.scss';

interface MahatriaMobileHeaderProps {
    seekersCount: number;
    onSearch: (query: string) => void;
    onFilter: () => void;
}

const MahatriaMobileHeader: React.FC<MahatriaMobileHeaderProps> = ({
    seekersCount,
    onSearch,
    onFilter,
}) => {
    const [search, setSearch] = React.useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <div className={styles.header}>
            <div className={styles.seekersCount}>
                Seekers: {seekersCount}
            </div>
            <div className={styles.actions}>
                <input
                    className={styles.searchInput}
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={handleSearchChange}
                />
                <button className={styles.filterButton} onClick={onFilter}>
                    Filters
                </button>
            </div>
        </div>
    );
};

export default MahatriaMobileHeader;