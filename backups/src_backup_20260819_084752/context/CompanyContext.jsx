import React, { createContext, useState, useEffect, useContext } from 'react';

const CompanyContext = createContext({});

export function CompanyProvider({ children }) {
  const [companyData, setCompanyData] = useState(() => {
    const saved = localStorage.getItem('companyData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const saveCompanyData = (data) => {
    setCompanyData(data);
    localStorage.setItem('companyData', JSON.stringify(data));
  };

  return (
    <CompanyContext.Provider value={{ companyData, saveCompanyData }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}
