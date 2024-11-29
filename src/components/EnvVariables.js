import React from 'react';

const EnvVariables = ({ containerName, vmName, envVars }) => {

  return (
    <div className="mt-6 pb-10">
      <h4 className="font-semibold">Environment Variables:</h4>
      {envVars.map((envVar, index) => (
        <div
          key={index}
          className="flex items-center mb-2 bg-gray-100 dark:bg-gray-800 p-2 rounded"
        >
          <span className="w-full break-all pl-3 pr-6">{envVar}</span>
        </div>
      ))}
    </div>
  );
};

export default EnvVariables;
