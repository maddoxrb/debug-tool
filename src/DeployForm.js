// DeployForm.js
import React, { useState } from 'react';
import axios from 'axios';

/**
 * DeployForm is a React component that renders a form for deploying a Docker
 * container on a specified VM.
 */
const DeployForm = () => {
  const [imageName, setImageName] = useState('');
  const [containerName, setContainerName] = useState('');
  const [vmName, setVmName] = useState('vm1');

  /**
   * Handles submission of the form. Makes a POST request to the server to
   * deploy the container on the specified VM.
   * @param {Event} e - The event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/deploy', { imageName, containerName, vmName });
      alert(response.data.message);
      setImageName('');
      setContainerName('');
    } catch (error) {
      console.error(error);
      alert('Deployment failed: ' + error.response?.data?.error);
    }
  };

  return (
    <div className="p-4 bg-card shadow-md rounded-xl mt-10">
        <h2 className="text-3xl font-bold mb-6">Deploy a Container</h2>
        <form onSubmit={handleSubmit} className="p-4 bg-card shadow-md rounded-xl mb-6">
        <input
            type="text"
            placeholder="Image Name"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
            className="block w-full mb-2 p-2 border rounded bg-lightBg"
            required
        />
        <input
            type="text"
            placeholder="Container Name"
            value={containerName}
            onChange={(e) => setContainerName(e.target.value)}
            className="block w-full mb-2 p-2 border rounded bg-lightBg"
            required
        />
        <select
            value={vmName}
            onChange={(e) => setVmName(e.target.value)}
            className="block w-full bg-card mb-4 p-2 border rounded"
        >
            <option value="vm1">VM1</option>
            <option value="vm2">VM2</option>
            <option value="vm3">VM3</option>
            <option value="vm4">VM4</option>
        </select>
        <button type="submit" className="bg-green-500 p-2 rounded">
            Deploy Container
        </button>
        </form>
    </div>
    
  );
};

export default DeployForm;

