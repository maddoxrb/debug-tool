/**
 * ContainerHeader renders the header for each container in the
 * ContainerCard component.
 *
 * @param {object} container - the container object
 * @param {string} vmName - the name of the VM the container belongs to
 * @param {function} fetchLogs - the function to fetch the logs for the container
 * @param {function} stopContainer - the function to stop the container
 * @param {function} restartContainer - the function to restart the container
 * @param {function} fetchEnvVars - the function to fetch the environment variables for the container
 * @param {boolean} showLogs - whether the logs are currently being shown
 * @param {boolean} showEnvVars - whether the environment variables are currently being shown
 * @param {function} viewNetworkInfo - the function to view the network information for the container
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ContainerHeader = ({
  container,
  vmName,
  fetchLogs,
  stopContainer,
  restartContainer,
  fetchEnvVars,
  showLogs,
  showEnvVars,
  viewNetworkInfo
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      {/* The name of the container */}
      <h3 className="text-lg font-semibold">{container.Name}</h3>
      <div>
        {/* Button to fetch the logs for the container */}
        <button onClick={() => fetchLogs(container.Name)} className="mr-2 bg-green-800 text-white p-2 px-5 rounded-2xl hover:bg-green-600 transition">
          {showLogs ? 'Hide Logs' : 'View Logs'}
        </button>
        
        {/* Button to fetch the environment variables for the container */}
        <button onClick={() => fetchEnvVars(container.Name)} className="mr-2 bg-green-800 text-white p-2 px-5 rounded-2xl hover:bg-green-600 transition">
          {showEnvVars ? 'Hide Env Vars' : 'View Env Vars'}
        </button>
        {/* Button to view the network information for the container */}
        <button onClick={() => viewNetworkInfo(container.Name)} className="mr-2 bg-green-800 text-white p-2 px-5 rounded-2xl hover:bg-green-600 transition">
          Container Details
        </button>
        {/* Button to open the CLI for the container */}
        <button onClick={() => navigate(`/cli/${vmName}/${container.Name}`)} className="bg-blue-800 text-white p-2 px-5 rounded-2xl hover:bg-blue-600 transition">
          Open CLI
        </button>
      </div>
    </div>
  );
};

export default ContainerHeader;

