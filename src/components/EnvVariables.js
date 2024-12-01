/**
 * A component to display a list of environment variables for a given container.
 *
 * @param {string} containerName - The name of the container.
 * @param {string} vmName - The name of the VM that the container is running on.
 * @param {Object[]} envVars - An array of environment variables, where each
 *     element is a string representing the name and value of the environment
 *     variable, e.g. "FOO=bar".
 */
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

