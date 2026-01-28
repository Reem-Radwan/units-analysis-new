import React, { useState, useRef, useEffect } from 'react';

const MultiSelect = ({ label, options, selectedValues, onChange, placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };


    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (value) => {
    const newSelected = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newSelected);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) return selectedValues[0];
    return `${selectedValues.length} selected`;
  };

  return (
    <div className="filter-group">
      <label className="filter-label">{label}</label>
      <div className="multi-select-container" ref={dropdownRef}>
        <div
          className={`multi-select-header ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`selected-values ${selectedValues.length === 0 ? 'placeholder' : ''}`}>
            {getDisplayText()}
          </span>
          <div className={`dropdown-arrow ${isOpen ? 'open' : ''}`} />
        </div>
        
        {isOpen && (
          <div className="multi-select-dropdown">
            {options.map(option => (
              <div
                key={option}
                className="multi-select-option"
                onClick={() => handleToggle(option)}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => {}}
                />
                <label>{option}</label>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default MultiSelect;