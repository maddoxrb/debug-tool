import React, { useState } from 'react';
import axios from 'axios';

const CommandExecution = ({ containerName, vmName }) => {
  const [command, setCommand] = useState('');
  const [commandOutput, setCommandOutput] = useState('');

  const runCommand = async () => {
    if (!command) return;
    try {
      const response = await axios.post(`/api/metrics/${vmName}/exec/${containerName}`, { command });
      setCommandOutput(response.data.output);
    } catch (error) {
      console.error('Error executing command:', error);
    }
  };

  return (
    <div className="mt-4">
      <h4 className="font-semibold">Run Command:</h4>
      <input
        type="text"
        placeholder="Enter command..."
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        className="w-full p-2 mt-2 border border-gray-300 rounded"
      />
      <button onClick={runCommand} className="mt-2 bg-green-500 text-white p-2 rounded">
        Execute
      </button>
      {commandOutput && <pre className="bg-gray-200 p-2 mt-2 rounded">{commandOutput}</pre>}
    </div>
  );
};

export default CommandExecution;
