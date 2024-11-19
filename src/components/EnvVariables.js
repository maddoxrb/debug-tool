import React, { useState } from 'react';
import axios from 'axios';

const EnvVariables = ({ containerName, vmName, envVars }) => {
  const [newEnvValue, setNewEnvValue] = useState('');

  const updateEnvVar = async (envVar, newValue) => {
    if (!newValue) return;
    try {
      await axios.post(`/api/metrics/${vmName}/update-env/${containerName}`, { envVar, newValue });
      alert('Environment variable updated');
    } catch (error) {
      console.error('Error updating environment variable:', error);
    }
  };

  return (
    <div className="mt-6 pb-10">
      <h4 className="font-semibold">Environment Variables:</h4>
      {envVars.map((envVar, index) => (
        <div
          key={index}
          className="flex items-center mb-2 bg-gray-100 dark:bg-gray-800 p-2 rounded"
        >
          <span className="w-full break-all pl-3 pr-6">{envVar}</span>
          <input
            type="text"
            placeholder="New value"
            className="p-2 border rounded ml-2"
            onBlur={(e) => updateEnvVar(envVar, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default EnvVariables;
