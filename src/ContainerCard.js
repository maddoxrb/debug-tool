import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ContainerHeader from './components/ContainerHeader';
import ContainerMetrics from './components/ContainerMetrics';
import { FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import LogsViewer from './components/LogsViewer';
import EnvVariables from './components/EnvVariables';
import { Tooltip } from 'react-tooltip';

const ContainerCard = ({ container, vmName, fetchMetrics }) => {
  const [logs, setLogs] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const [filteredLogs, setFilteredLogs] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [envVars, setEnvVars] = useState([]);
  const [showEnvVars, setShowEnvVars] = useState(false);
  const [isStopping, setIsStopping] = useState(false); // New state variable

  const navigate = useNavigate();

  // Fetch logs for the container
  const fetchLogs = async (containerName) => {
    if (showLogs) {
      setShowLogs(!showLogs);
      return;
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
    setIsStopping(true); // Set isStopping to true
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

  // Reset isStopping when container status indicates it's stopped
  useEffect(() => {
    if (container.Status === 'exited' || container.Status === 'stopped') {
      setIsStopping(false);
    }
  }, [container.Status]);

  return (
    <div className="bg-card dark:bg-card text-text dark:text-text p-6 rounded-lg shadow-md mb-6 relative">
      {container.warning && (
        <div className="absolute top-4 right-4 pulsate-container">
          <FaExclamationTriangle
            className="text-red-500 animate-pulsate"
            data-tooltip-id="error-tooltip"
            aria-label="Error detected"
          />
          <Tooltip id="error-tooltip" place="top" type="dark" effect="solid">
            Warning! Our Inference model has detected a possible error on this container. Please check the logs for more details
          </Tooltip>
        </div>
      )}

      

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
      {isStopping && (
        <div className="absolute mr-16 pulsate-container">
          <FaTrash
            className="text-black animate-pulsate"
            data-tooltip-id="stopping-tooltip"
            aria-label="Container is being stopped"
          />
          <Tooltip id="stopping-tooltip" place="top" type="dark" effect="solid">
            Container is being stopped
          </Tooltip>
        </div>
      )}
        <button
          onClick={() => stopContainer(container.Name)}
          className="mr-2 bg-red-500 text-white p-2 px-5 rounded-2xl hover:bg-red-600 transition"
        >
          Stop
        </button>
      </div>
    </div>
  );
};

export default ContainerCard;
