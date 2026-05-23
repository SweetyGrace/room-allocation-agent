import { Checkbox } from "@mui/material";
import styles  from './index.module.scss'
import checked from '../../../assets/images/checked-checkbox.svg';
import unchecked from '../../../assets/images/unchecked-checkbox.svg';
import { FilterOption } from "../../../components/MeetingAnalyticsDashboard/Analtyics.modal";
import { filterDataItem } from "../../../components/MeetingAnalyticsDashboardSections/HeaderSection";

interface FilterOptionsProps {
    filters: FilterOption[];
    selectedFilters: string[],
    onChange: (updatedFilters: string[])=>void
    filterLabels: {[key: string]: string}
}

export const FilterOptions: React.FC<FilterOptionsProps> = ({
    filters,
    selectedFilters,
    onChange,
    filterLabels
  }) => {

    /**
     * Handles the change event for filter selection.
     * Toggles the presence of a filter name in the selected filters list.
     * If the filter name is already selected, it removes it; otherwise, it adds it.
     * Calls the `onChange` callback with the updated list of selected filters.
     *
     * @param name - The name of the filter to toggle in the selected filters list.
     */
    const handleChange = (name: string) => {
      const newSelectedFilters = selectedFilters.includes(name)
        ? selectedFilters.filter((item: string) => item !== name)
        : [...selectedFilters, name];
      onChange(newSelectedFilters);
    };
  
    return (
      <>
        {filters.map((item: filterDataItem, index: number) => (
          (
            index !=0 && <div key={`${item.id}-${item.name}`} className={styles.filerLabel}>
            <label className={styles.field}>
              <Checkbox
                icon={<img src={unchecked} alt="unchecked" loading="lazy" />}
                checkedIcon={<img src={checked} alt="Checked" loading="lazy" />}
                onChange={() => handleChange(item.name)}
                checked={selectedFilters.includes(item.name) }
              />
              {filterLabels[item.name] || item.name}
            </label>
          </div>
          )
        ))}
      </>
    );
  };