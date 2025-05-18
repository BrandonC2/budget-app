import React, { createContext, useState, useContext, useEffect } from 'react';

const UserPreferencesContext = createContext();

export const useUserPreferences = () => {
  return useContext(UserPreferencesContext);
};

export const UserPreferencesProvider = ({ children }) => {
  // Load preferences from localStorage or set defaults
  const [currency, setCurrency] = useState(
    localStorage.getItem('currency') || 'USD'
  );
  
  const [dateFormat, setDateFormat] = useState(
    localStorage.getItem('dateFormat') || 'MM/DD/YYYY'
  );
  
  const [startingDay, setStartingDay] = useState(
    localStorage.getItem('startingDay') || 'Monday'
  );

  // Update localStorage when preferences change
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('dateFormat', dateFormat);
  }, [dateFormat]);

  useEffect(() => {
    localStorage.setItem('startingDay', startingDay);
  }, [startingDay]);

  // Function to update all preferences at once
  const updatePreferences = (newPreferences) => {
    if (newPreferences.currency) {
      setCurrency(newPreferences.currency);
    }
    
    if (newPreferences.dateFormat) {
      setDateFormat(newPreferences.dateFormat);
    }
    
    if (newPreferences.startingDay) {
      setStartingDay(newPreferences.startingDay);
    }
  };

  // Format a date according to the selected format
  const formatDate = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    switch (dateFormat) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM/DD/YYYY':
      default:
        return `${month}/${day}/${year}`;
    }
  };

  // Format a currency value according to the selected currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '';
    
    const numValue = parseFloat(value);
    
    switch (currency) {
      case 'EUR':
        return `€${numValue.toFixed(2)}`;
      case 'GBP':
        return `£${numValue.toFixed(2)}`;
      case 'JPY':
        return `¥${Math.round(numValue)}`;
      case 'CAD':
        return `CA$${numValue.toFixed(2)}`;
      case 'USD':
      default:
        return `$${numValue.toFixed(2)}`;
    }
  };

  const value = {
    currency,
    dateFormat,
    startingDay,
    updatePreferences,
    formatDate,
    formatCurrency
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}; 