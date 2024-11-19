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
      <h3 className="text-lg font-semibold">{container.Name}</h3>
      <div>
        <button onClick={() => fetchLogs(container.Name)} className="mr-2 bg-green-500 text-white p-2 px-5 rounded-2xl hover:bg-green-600 transition">
          {showLogs ? 'Hide Logs' : 'View Logs'}
        </button>
        
       
        <button onClick={() => fetchEnvVars(container.Name)} className="mr-2 bg-green-500 text-white p-2 px-5 rounded-2xl hover:bg-green-600 transition">
          {showEnvVars ? 'Hide Env Vars' : 'View Env Vars'}
        </button>
        <button onClick={() => viewNetworkInfo(container.Name)} className="mr-2 bg-green-500 text-white p-2 px-5 rounded-2xl hover:bg-green-600 transition">
          Container Details
        </button>
        <button onClick={() => navigate(`/cli/${vmName}/${container.Name}`)} className="bg-blue-800 text-white p-2 px-5 rounded-2xl hover:bg-blue-600 transition">
          Open CLI
        </button>
      </div>
    </div>
  );
};

export default ContainerHeader;
