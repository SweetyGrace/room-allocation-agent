import React, { useState, useEffect } from 'react';
import styles from './StylesPopUp.module.scss';
import { GlobalStyles, QuestionCustomStyles } from './types';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

interface StylesPopupProps {
  isGlobal: boolean;
  onClose: () => void;
  globalStyles: GlobalStyles;
  questionCustomStyles: QuestionCustomStyles;
  updateGlobalStyles: (category: string, property: string, value: string) => void;
  updateQuestionCustomStyle: (questionId: number, type: string, property: string, value: string) => void;
  styleQuestionId: number | null;
  getEffectiveStyle: (questionId: number, type: 'question' | 'options') => any;
}

const StylesPopup: React.FC<StylesPopupProps> = ({
  isGlobal,
  onClose,
  globalStyles,
  questionCustomStyles,
  updateGlobalStyles,
  updateQuestionCustomStyle,
  styleQuestionId,
  getEffectiveStyle
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  // Define tabs
  const tabs = isGlobal 
    ? ['Question', 'Options', 'Sections'] 
    : ['Question', 'Options'];
  
  const [activeTab, setActiveTab] = useState(tabs[0]);
    // Handle text alignment
  const [textAlignment, setTextAlignment] = useState<string>('left');

  // Predefined color palette
  const colorPalette = [
    '#000000', // Black
    '#333333', // Dark Gray
    '#666666', // Gray
    '#999999', // Medium Gray
    '#B19CD9', // Light Purple
    '#8675A9', // Medium Purple
    '#654EA3', // Deep Purple
    '#212529', // Almost Black
    '#E6E6FA', // Lavender
    '#9370DB', // Medium Purple
    '#DA70D6', // Orchid
    '#FF7F50', // Coral
    '#4A9FEB', // Blue
    '#E34C26', // Red-Orange
    '#4CAF50', // Green
    '#3B82F6', // Bright Blue
    '#F59E0B', // Orange-Yellow
  ];

  // Font sizes for the dropdown
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '22px', '24px', '28px', '32px'];
  
  // Font weights with readable labels
  const fontWeights = [
    { value: '300', label: 'Light (300)' },
    { value: '400', label: 'Regular (400)' },
    { value: '500', label: 'Medium (500)' },
    { value: '600', label: 'Semi-Bold (600)' },
    { value: '700', label: 'Bold (700)' },
    { value: '800', label: 'Extra Bold (800)' },
    { value: '900', label: 'Black (900)' },
  ];

  // Get current category based on active tab
  const getCategory = (): string => {
    if (isGlobal) {
      if (activeTab === 'Question') return 'questions';
      if (activeTab === 'Options') return 'options';
      if (activeTab === 'Sections') return 'sections';
    } else {
      if (activeTab === 'Question') return 'question';
      if (activeTab === 'Options') return 'options';
    }
    return 'questions'; // Default
  };

  // Handle style changes
  const handleStyleChange = (property: string, value: string) => {
    const category = getCategory();
    
    if (isGlobal) {
      if (category === 'sections') {
        updateGlobalStyles(category, `title.${property}`, value);
      } else {
        updateGlobalStyles(category, property, value);
      }
    } else if (styleQuestionId !== null) {
      updateQuestionCustomStyle(styleQuestionId, category, property, value);
    }
  };

  // Get current style value
  const getCurrentStyle = (property: string): string => {
    const category = getCategory();
  
    if (isGlobal) {
      if (category === 'questions') {
        return globalStyles.questions[property as keyof typeof globalStyles.questions] || '';
      }
      if (category === 'options') {
        return globalStyles.options[property as keyof typeof globalStyles.options] || '';
      }
      if (category === 'sections') {
        return globalStyles.sections.title[property as keyof typeof globalStyles.sections.title] || ''; // Ensure this is correct
      }
    } else if (styleQuestionId !== null) {
      const questionStyles = questionCustomStyles[styleQuestionId];
      if (questionStyles && questionStyles[category] && questionStyles[category][property]) {
        return questionStyles[category][property];
      }
  
      // Fallback to global style
      if (category === 'question') {
        return globalStyles.questions[property as keyof typeof globalStyles.questions] || '';
      }
      if (category === 'options') {
        return globalStyles.options[property as keyof typeof globalStyles.options] || '';
      }
    }
    return '';
  };


  useEffect(() => {
    // Set initial alignment when tab changes
    const currentAlign = getCurrentStyle('textAlign');
    setTextAlignment(currentAlign || 'left');
  }, [activeTab]);

  const handleAlignmentChange = (alignment: string) => {
    setTextAlignment(alignment);
    handleStyleChange('textAlign', alignment);
  };

  // Handle bold text toggle
  const [isBold, setIsBold] = useState<boolean>(false);
  
  useEffect(() => {
    // Set initial bold state when tab changes
    const currentWeight = getCurrentStyle('fontWeight');
    setIsBold(currentWeight === '700' || currentWeight === 'bold');
  }, [activeTab]);

  const toggleBold = () => {
    const newValue = isBold ? '500' : '700';
    setIsBold(!isBold);
    handleStyleChange('fontWeight', newValue);
  };

  return (
    <div className={styles.stylesPopupOverlay}>
      <div className={styles.stylesPopup}>
        {/* Header */}
        <div className={styles.popupHeader}>
          <h2>Edit {isGlobal ? 'Global' : 'Question'} Styles</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        {/* Tabs */}
        <div className={styles.tabsContainer}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Question' && (
                <>
                  <span className={styles.tabIcon}>T</span> {tab}
                </>
              )}
              {tab === 'Options' && (
                <>
                  <span className={styles.tabIcon}>✎</span> {tab}
                </>
              )}
              {tab === 'Sections' && (
                <>
                  <span className={styles.tabIcon}>≡</span> {tab}
                </>
              )}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className={styles.popupContent}>
          {/* Text Color */}
          <div className={styles.styleSection}>
            <label className={styles.styleLabel}>
              Text Color
            </label>
            <div className={styles.colorPickerContainer}>
              <div 
                className={styles.colorPreview}
                style={{ backgroundColor: getCurrentStyle('color') }}
              ></div>
              <input
                type="text"
                className={styles.colorInput}
                value={getCurrentStyle('color')}
                onChange={(e) => handleStyleChange('color', e.target.value)}
              />
            </div>
            <div className={styles.colorPalette}>
              {colorPalette.map((color) => (
                <button
                  key={color}
                  className={`${styles.colorOption} ${getCurrentStyle('color') === color ? styles.activeColor : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleStyleChange('color', color)}
                />
              ))}
              {/* Add "+More" button */}
              <button
                className={styles.moreColorButton}
                onClick={() => setShowColorPicker(!showColorPicker)}
              >
                + More
              </button>
            </div>
            
            {/* Render color picker panel */}
            {showColorPicker && (
              <div className={styles.colorPickerPanel}>
                <input
                  type="color"
                  className={styles.colorPickerInput}
                  value={getCurrentStyle('color')}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                />
              </div>
            )}
          </div>
          
          {/* Font Size */}
          <div className={styles.styleSection}>
            <label className={styles.styleLabel}>
              Font Size
            </label>
            <FormControl fullWidth>
              <InputLabel id="font-size-label" title="Font Size">Font Size</InputLabel>
              <Select
                labelId="font-size-label"
                value={getCurrentStyle('fontSize')}
                onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                className={styles.styleSelect}
                label="Font Size"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200, // Limit dropdown height
                    },
                  },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                }}
              >
                {fontSizes.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          
          {/* Font Weight */}
          <div className={styles.styleSection}>
            <label className={styles.styleLabel}>
              Font Weight
            </label>
            <FormControl fullWidth>
              <InputLabel id="font-weight-label" title="Font Weight">Font Weight</InputLabel>
              <Select
                labelId="font-weight-label"
                value={getCurrentStyle('fontWeight')}
                onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                className={styles.styleSelect}
                label="Font Weight"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200, // Limit dropdown height
                    },
                  },
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                  },
                }}
              >
                {fontWeights.map((weight) => (
                  <MenuItem key={weight.value} value={weight.value}>
                    {weight.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          
          {/* Text Alignment */}
          <div className={styles.styleSection}>
            <label className={styles.styleLabel}>
              Text Alignment
            </label>
            <div className={styles.alignmentButtons}>
              <button
                className={`${styles.alignButton} ${textAlignment === 'left' ? styles.activeAlign : ''}`}
                onClick={() => handleAlignmentChange('left')}
                title="Align Left"
              >
                &#8592; {/* Left Arrow Icon */}
              </button>
              <button
                className={`${styles.alignButton} ${textAlignment === 'center' ? styles.activeAlign : ''}`}
                onClick={() => handleAlignmentChange('center')}
                title="Align Center"
              >
                &#8596; {/* Horizontal Arrow Icon */}
              </button>
              <button
                className={`${styles.alignButton} ${textAlignment === 'right' ? styles.activeAlign : ''}`}
                onClick={() => handleAlignmentChange('right')}
                title="Align Right"
              >
                &#8594; {/* Right Arrow Icon */}
              </button>
            </div>
          </div>
          
          {/* Bold Text Checkbox */}
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="boldText"
              className={styles.checkbox}
              checked={isBold}
              onChange={toggleBold}
            />
            <label htmlFor="boldText" className={styles.checkboxLabel}>
              <span className={styles.boldIcon}>B</span> Bold Text
            </label>
          </div>
        </div>
        
        {/* Footer */}
        <div className={styles.popupFooter}>
          <button
            onClick={onClose}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className={styles.saveBtn}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default StylesPopup;