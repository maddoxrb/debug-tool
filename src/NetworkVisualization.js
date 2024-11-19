import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const VMNetworkInfo = () => {
  const { vmName } = useParams();
  const [networkData, setNetworkData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch network data from the server
  const fetchNetworkData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/network/${vmName}`);
      setNetworkData(response.data);
    } catch (error) {
      console.error('Error fetching network data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
  }, [vmName]);

  const renderNetworkDetails = (network) => (
    <div key={network.Id} className=" p-6 rounded-xl bg-card dark:bg-card rounded shadow-md">
        <h2 className="text-3xl font-bold mb-8">VM Networking Information - {vmName.toUpperCase()}</h2>
      <h3 className="text-xl font-bold mb-4 text-text dark:text-text">
        {network.Name.toUpperCase()} Network Details
      </h3>
      <table className="min-w-full bg-card dark:bg-card text-text dark:text-text rounded mb-4">
        <tbody>
          <tr>
            <td className="py-2 px-4 font-semibold">Network ID</td>
            <td className="py-2 px-4">{network.Id}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-semibold">Driver</td>
            <td className="py-2 px-4">{network.Driver}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-semibold">Scope</td>
            <td className="py-2 px-4">{network.Scope}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-semibold">IPv6 Enabled</td>
            <td className="py-2 px-4">{network.EnableIPv6 ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td className="py-2 px-4 font-semibold">Internal</td>
            <td className="py-2 px-4">{network.Internal ? 'Yes' : 'No'}</td>
          </tr>
        </tbody>
      </table>

      {/* Render Containers */}
      <h4 className="text-lg font-bold mb-4 text-text dark:text-text">Containers</h4>
      <table className="min-w-full bg-card dark:bg-card text-text dark:text-text rounded">
            <thead>
                <tr className="text-left"> {/* Ensure text is left-aligned */}
                <th className="py-3 px-4 border-b text-left">Container Name</th>
                <th className="py-3 px-4 border-b text-left">IPv4 Address</th>
                <th className="py-3 px-4 border-b text-left">MAC Address</th>
                </tr>
            </thead>
            <tbody>
                {Object.entries(network.Containers || {}).map(([id, details]) => (
                <tr key={id} className="hover:bg-gray-800">
                    <td className="py-2 px-4 border-b">{details.Name}</td>
                    <td className="py-2 px-4 border-b">{details.IPv4Address || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{details.MacAddress || 'N/A'}</td>
                </tr>
                ))}
            </tbody>
            </table>


      {/* Render Network Options */}
      <h4 className="text-lg font-bold mt-6 text-text dark:text-text">Network Options</h4>
      <table className="min-w-full bg-card dark:bg-card text-text dark:text-text rounded">
        <tbody>
          {Object.entries(network.Options || {}).map(([key, value]) => (
            <tr key={key}>
              <td className="py-2 px-4 font-semibold">{key}</td>
              <td className="py-2 px-4">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6 bg-background rounded-xl mt-4 dark:bg-background text-text dark:text-text">
      


      {isLoading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading network data...</p>
      ) : (
        networkData.map((network) => renderNetworkDetails(network))
      )}
    </div>
  );
};

export default VMNetworkInfo;
