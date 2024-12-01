/**
 * This component fetches container data from the API and renders a table
 * showing the container's details.
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ContainerNetworkDetails = () => {
  const { vmName, containerName } = useParams();
  const [containerData, setContainerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const navigate = useNavigate();

  /**
   * Fetch container network data from the API
   */
  const fetchContainerData = async () => {
    setIsLoading(true); // Start loading
    try {
      const response = await axios.get(`/api/network/${vmName}/container/${containerName}`);
      setContainerData(response.data);
    } catch (error) {
      console.error('Error fetching container data:', error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchContainerData();
  }, [vmName, containerName]);

  /**
   * Render a table row
   * @param {string} label - The label for the row
   * @param {string} value - The value for the row
   */
  const renderTableRow = (label, value) => (
    <tr key={label}>
      <td className="py-2 px-4 border-b font-semibold">{label}</td>
      <td className="py-2 px-4 border-b">{value || 'N/A'}</td>
    </tr>
  );

  if (isLoading) {
    return (
      <div className="p-6 bg-card min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Loading Container Details...</h2>
      </div>
    );
  }

  if (!containerData) {
    return (
      <div className="p-6 bg-card min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Failed to Load Container Details</h2>
        <button
          onClick={() => navigate('/')}
          className="mb-6 bg-blue-500 text-white py-2 px-4 rounded"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const {
    Id,
    Name,
    Created,
    Image,
    State,
    Config,
    NetworkSettings,
    LogPath,
    RestartCount,
  } = containerData;

  const { Status, Running, Pid, StartedAt, FinishedAt } = State || {};
  const { Gateway, IPAddress, MacAddress, Ports, Networks } = NetworkSettings || {};
  const exposedPorts = Ports ? Object.keys(Ports).join(', ') : 'None';
  const envVariables = Config?.Env ? Config.Env.join(', ') : 'None';

  // Handle nested network details
  const networkDetails = Networks
    ? Object.entries(Networks).map(([networkName, details]) => (
        <div key={networkName}>
          <p><strong>Network:</strong> {networkName}</p>
          <p><strong>IP Address:</strong> {details.IPAddress || 'N/A'}</p>
          <p><strong>Gateway:</strong> {details.Gateway || 'N/A'}</p>
          <p><strong>Mac Address:</strong> {details.MacAddress || 'N/A'}</p>
          <hr className="my-2" />
        </div>
      ))
    : 'No Networks Available';

  return (
    <div className="p-6 bg-card pb-10 mt-10 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Container Details - {containerName}</h2>
      <div className="overflow-x-auto rounded-lg">
        <div className=" bg-lightBg rounded-lg mb-8 p-6 bg-lightBg rounded shadow-md">
          <h3 className="text-xl font-bold mb-4">Network Details</h3>
          {networkDetails}
        </div>
        <table className="min-w-full bg-lightBg shadow-md rounded-xl overflow-hidden border border-gray-300">
          <tbody>
            {renderTableRow('Container ID', Id)}
            {renderTableRow('Name', Name)}
            {renderTableRow('Created', new Date(Created).toLocaleString())}
            {renderTableRow('Image', Image)}
            {renderTableRow('Status', Status)}
            {renderTableRow('Running', Running ? 'Yes' : 'No')}
            {renderTableRow('PID', Pid)}
            {renderTableRow('Started At', new Date(StartedAt).toLocaleString())}
            {renderTableRow('Restart Count', RestartCount)}
            {renderTableRow('Exposed Ports', exposedPorts)}
            {renderTableRow('Gateway', Gateway)}
            {renderTableRow('IP Address', IPAddress)}
            {renderTableRow('MAC Address', MacAddress)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContainerNetworkDetails;

