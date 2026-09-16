import React, { createContext, useState, useEffect, useContext } from 'react';
import { db, storage } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

const CompanyContext = createContext({});

export function CompanyProvider({ children }) {
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    const docRef = doc(db, 'company', 'main');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCompanyData({ id: 'main', ...data });
        if (data.name) {
          document.title = data.name;
        } else {
          document.title = 'Agenda Digital';
        }
      } else {
        setCompanyData(null);
        document.title = 'Agenda Digital';
      }
    });

    return () => unsubscribe();
  }, []);

  const saveCompanyData = async (data) => {
    try {
      let finalData = { ...data };
      
      // If logo is a base64 string, upload to Storage
      if (data.logo && data.logo.startsWith('data:image')) {
        const logoRef = ref(storage, 'company/logo.png');
        await uploadString(logoRef, data.logo, 'data_url');
        const logoUrl = await getDownloadURL(logoRef);
        finalData.logo = logoUrl;
      }

      await setDoc(doc(db, 'company', 'main'), finalData, { merge: true });
    } catch (error) {
      console.error("Error saving company data:", error);
    }
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
