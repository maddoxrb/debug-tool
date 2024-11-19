import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ContainerHeader from './components/ContainerHeader';
import ContainerMetrics from './components/ContainerMetrics';
import LogsViewer from './components/LogsViewer';
import EnvVariables from './components/EnvVariables';

const ContainerCard = ({ container, vmName, fetchMetrics }) => {
  const [logs, setLogs] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const [filteredLogs, setFilteredLogs] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [envVars, setEnvVars] = useState([]);
  const [showEnvVars, setShowEnvVars] = useState(false);

  const navigate = useNavigate();

  // Fetch logs for the container
  const fetchLogs = async (containerName) => {
    if(showLogs){
        setShowLogs(!showLogs);
        return
    }
    try {
      const response = await axios.get(`/api/metrics/${vmName}/logs/${containerName}`);
      setLogs(response.data.logs);
      setFilteredLogs(response.data.logs); // Initially show all logs
      setShowLogs(!showLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  // Stop the container
  const stopContainer = async (containerName) => {
    await axios.post(`/api/metrics/${vmName}/stop/${containerName}`);
    fetchMetrics();
  };

  // Restart the container
  const restartContainer = async (containerName) => {
    await axios.post(`/api/metrics/${vmName}/restart/${containerName}`);
    fetchMetrics();
  };

  // Fetch environment variables
  const fetchEnvVars = async (containerName) => {
    const response = await axios.get(`/api/metrics/${vmName}/env/${containerName}`);
    setEnvVars(response.data.envVars);
    setShowEnvVars(!showEnvVars);
  };

  // Navigate to the network information page for the container
  const viewNetworkInfo = (containerName) => {
    navigate(`/network/container/${vmName}/${containerName}`);
  };

  return (
    <div className="bg-card dark:bg-card text-text dark:text-text p-6 rounded-lg shadow-md mb-6 relative">
      <ContainerHeader
        container={container}
        vmName={vmName}
        fetchLogs={fetchLogs}
        stopContainer={stopContainer}
        restartContainer={restartContainer}
        fetchEnvVars={fetchEnvVars}
        showLogs={showLogs}
        showEnvVars={showEnvVars}
        viewNetworkInfo={viewNetworkInfo}
      />
      <ContainerMetrics container={container} />

      {/* Logs Viewer */}
      <LogsViewer
        logs={logs}
        filteredLogs={filteredLogs}
        setFilteredLogs={setFilteredLogs}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showLogs={showLogs}
      />

      {/* Environment Variables Viewer */}
      {showEnvVars && (
        <EnvVariables containerName={container.Name} vmName={vmName} envVars={envVars} />
      )}

      {/* Buttons Wrapper */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button
          onClick={() => stopContainer(container.Name)}
          className="mr-2 bg-red-500 text-white p-2 px-5 rounded-2xl hover:bg-red-600 transition"
        >
          Stop
        </button>
        <button
          onClick={() => restartContainer(container.Name)}
          className="mr-2 bg-orange-500 text-white p-2 px-5 rounded-2xl hover:bg-orange-600 transition"
        >
          Restart
        </button>
      </div>
    </div>
  );
};

export default ContainerCard;
