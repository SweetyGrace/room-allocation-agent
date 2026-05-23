/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import styles from "./index.module.scss";

interface SearchComponentProps {
  searchText: string;
  setSearchText: (text: string) => void;
  handleSearch: () => void;
  seekersData: any[];
  handleSeekerClick: (seeker: any) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  searchText,
  setSearchText,
  handleSearch,
  seekersData,
  handleSeekerClick,
}) => {
  return (
    <div data-testid="search-member-container">
      <input
        type="text"
        placeholder="search member"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        data-testid="search-input"
      />
      <button onClick={handleSearch} data-testid="search-button">
        search
      </button>
      <div className={styles.imagesContainer} data-testid="images-container">
        {seekersData?.length > 0 &&
          seekersData.map((seeker: any, index: number) => (
            <div
              className={styles.seekerRow}
              key={index}
              onClick={() => handleSeekerClick(seeker)}
              data-testid={`seeker-row-${index}`}
            >
              <img
                src={seeker?.faceUrl}
                alt="seeker"
                className={styles.seekerImage}
                height={24}
                width={24}
                data-testid={`seeker-image-${index}`}
              />
              <div
                className={styles.seekerDetails}
                data-testid={`seeker-details-${index}`}
              >
                <p data-testid={`seeker-name-${index}`}>{seeker?.first_name}</p>
                <p data-testid={`seeker-phone-${index}`}>
                  {seeker?.phone_number}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SearchComponent;
