// Metrics.js
import React, { useEffect, useState, useRef, useContext } from 'react';
import axios from 'axios';
import ContainerCard from './ContainerCard';
import { useNavigate } from 'react-router-dom';
import { VMContext } from './VMContext'; // Import the context

const Metrics = () => {
  const { vmName, setVmName } = useContext(VMContext); // Consume the context
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const fetchInProgress = useRef(false);

  const fetchMetrics = async () => {
    if (fetchInProgress.current) return;
    setIsLoading(true);
    fetchInProgress.current = true;

    try {
      const response = await axios.get(`/api/metrics/${vmName}`);
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  };

  useEffect(() => {
    setMetrics([]);
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, [vmName]);

  const handleVmChange = (e) => {
    if (!fetchInProgress.current) {
      setVmName(e.target.value); // Update the context state
    }
  };

  return (
    <div className="p-6 bg-background dark:bg-background min-h-screen text-text dark:text-text">
      <span className="flex items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold">⚡ Container Information </h2>

        <select
          className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-card dark:bg-card text-text dark:text-text"
          value={vmName}
          onChange={handleVmChange}
          disabled={isLoading}
        >
          <option value="vm1">VM1</option>
          <option value="vm2">VM2</option>
          <option value="vm3">VM3</option>
          <option value="vm4">VM4</option>
        </select>

        {isLoading && <p className="text-gray-500 dark:text-gray-400">Loading metrics...</p>}
      </span>

      {metrics.length > 0 ? (
        metrics.map((container) => (
          <ContainerCard
            key={container.ID}
            container={container}
            vmName={vmName}
            fetchMetrics={fetchMetrics}
          />
        ))
      ) : (
        !isLoading && <p className="text-gray-500 dark:text-gray-400">No metrics available.</p>
      )}
    </div>
  );
};

export default Metrics;
