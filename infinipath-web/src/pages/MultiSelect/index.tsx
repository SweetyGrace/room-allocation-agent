import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import dropDown from "../../assets/images/dropdownDown.svg";
import CheckBoxChecked from "../../assets/images/checkBoxChecked.svg";
import CheckBox from "../../assets/images/Checkbox.svg";
import CheckBoxUnchecked from "../../assets/images/checkboxUnchecked.svg";
import searchIcon from "../../assets/images/search-icon.svg";
import { X } from "lucide-react";
import { OPTIONS_SELECTED } from "../../constants/textConstants";

type MultiSelectProps = {
  options: string[];
  selected: string[];
  setSelected: (value: string[]) => void;
  placeholder?: string;
  closeOnClickOutside?: boolean;
};

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  setSelected,
  placeholder = "Search...",
  closeOnClickOutside = false,
}) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">("bottom");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate dropdown position
  useEffect(() => {
    if (open && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 300; // Approximate dropdown height

      // If not enough space below but enough space above, open upward
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
  }, [open]);

  // Add click outside logic
  React.useEffect(() => {
    if (!closeOnClickOutside || !open) return;
    const handleClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [closeOnClickOutside, open]);

  const filtered = options.filter((item) =>
    (item ?? "").toLowerCase().includes(search.toLowerCase()),  
  );

  // Select-all indicator logic
  const allSelected = selected.length === options.length && options.length > 0;

  const toggle = (option: string) => {
    setSelected(
      selected.includes(option)
        ? selected.filter((o) => o !== option)
        : [...selected, option],
    );
  };

  const remove = (option: string) => {
    setSelected(selected.filter((o) => o !== option));
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(options);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement | HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filtered.length - 1
      );
    } else if (e.key === "Enter" || e.key === " ") {
      if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        toggle(filtered[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      setHighlightedIndex(filtered.length > 0 ? 0 : -1);
    } else {
      setHighlightedIndex(-1);
    }
  }, [open, search, filtered.length]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className={styles.container} ref={dropdownRef}>
      <div
        onClick={() => setOpen((prev) => !prev)}
        className={styles.selectedChips}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className={styles.selectedContent}>
          {selected.length === 0 ? (
            <span className={styles.placeholderText}></span>
          ) : selected.length > 1 ? (
            <div className={styles.multiSelectWrapper}>
              <span 
                className={styles.selectedCountText}
                title={selected.join(', ')}
              >
                {selected.length} {OPTIONS_SELECTED}
              </span>
              <X
                className={styles.clearAllIcon}
                size={16}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected([]);
                }}
              />
            </div>
          ) : (
            <>
              {selected.map((item) => (
                <span className={styles.chip} key={item}>
                  {item}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(item);
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </>
          )}
        </div>
        <span className={styles.downArrow}>
          <img src={dropDown} alt="dropdown" />
        </span>
      </div>

      {open && (
        <div 
          className={`${styles.dropdown} ${dropdownPosition === "top" ? styles.dropdownTop : styles.dropdownBottom}`}
          style={{
            ...(dropdownPosition === "top" ? {
              bottom: '100%',
              top: 'auto',
              marginBottom: '4px'
            } : {
              top: '100%',
              bottom: 'auto',
              marginTop: '4px'
            })
          }}
        >
          <div className={styles.searchBar}>
            {/* Select-all indicator */}
            <span
              className={styles.selectAllIndicator}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAll();
              }}
              title={allSelected ? "Deselect all" : "Select all"}
              style={{ cursor: "pointer", marginRight: 8 }}
            >
              <img
                src={CheckBox}
                alt={allSelected ? "Deselect all" : "Select all"}
                className={styles.customCheckbox}
                style={{ verticalAlign: "middle" }}
              />
            </span>

            <div className={styles.inputWrapper}>
              {!search && (
                <img
                  src={searchIcon}
                  alt="search"
                  className={styles.searchIcon}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
              )}
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
                onKeyDown={handleKeyDown}
                style={{
                  paddingLeft: !search ? 32 : undefined,
                }}
              />
            </div>

            {/* Cross icon to close dropdown */}
            <X
              className={styles.closeDropdown}
              onClick={() => {
                setOpen(false);
                setSearch("");
              }}
              size={20}
              aria-label="Close dropdown"
            />
          </div>

          <ul className={styles.options} role="listbox">
            {filtered.map((opt, idx) => (
              <li
                key={opt}
                className={`${styles.option} ${
                  highlightedIndex === idx ? styles.highlighted : ""
                }`}
                onClick={() => toggle(opt)}
                style={{
                  cursor: "pointer",
                  background:
                    highlightedIndex === idx ? "#f0f0f0" : undefined,
                }}
                role="option"
                aria-selected={selected.includes(opt)}
                tabIndex={-1}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={selected.includes(opt)}
                  style={{ display: "none" }}
                />
                <img
                  src={
                    selected.includes(opt) ? CheckBoxChecked : CheckBoxUnchecked
                  }
                  alt={selected.includes(opt) ? "Checked" : "Unchecked"}
                  className={styles.customCheckbox}
                  style={{ verticalAlign: "middle" }}
                />
                <label style={{ marginLeft: 8, cursor: "pointer" }}>
                  {opt}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;

