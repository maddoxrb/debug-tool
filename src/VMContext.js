// VMContext.js
import React, { createContext, useState } from 'react';

// Create the context
export const VMContext = createContext();

// Create a provider component
export const VMProvider = ({ children }) => {
  const [vmName, setVmName] = useState('vm1');

  return (
    <VMContext.Provider value={{ vmName, setVmName }}>
      {children}
    </VMContext.Provider>
  );
};
