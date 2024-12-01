import React, { useState } from 'react';
import axios from 'axios';

// CommandExecution component allows users to execute commands on a specified container
const CommandExecution = ({ containerName, vmName }) => {
  // State to store the command input by the user
  const [command, setCommand] = useState('');
  // State to store the output of the executed command
  const [commandOutput, setCommandOutput] = useState('');

  // Function to run the command by making a POST request to the server
  const runCommand = async () => {
    if (!command) return; // Do nothing if command is empty
    try {
      // Send the command to the server API and update command output
      const response = await axios.post(`/api/metrics/${vmName}/exec/${containerName}`, { command });
      setCommandOutput(response.data.output);
    } catch (error) {
      console.error('Error executing command:', error);
    }
  };

  return (
    <div className="mt-4">
      <h4 className="font-semibold">Run Command:</h4>
      {/* Input field for entering the command */}
      <input
        type="text"
        placeholder="Enter command..."
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        className="w-full p-2 mt-2 border border-gray-300 rounded"
      />
      {/* Button to execute the entered command */}
      <button onClick={runCommand} className="mt-2 bg-green-500 text-white p-2 rounded">
        Execute
      </button>
      {/* Display the output of the command execution */}
      {commandOutput && <pre className="bg-gray-200 p-2 mt-2 rounded">{commandOutput}</pre>}
    </div>
  );
};

export default CommandExecution;

