// CLI.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * CLI component renders a command line interface for a container on a specific VM.
 *
 * The component has a few key features:
 * 1. **Command History**: The component stores the command history in the state and renders it below the input field.
 * 2. **Command Input**: The component renders a text input field to enter a command. The input is debounced and when the user submits the form, the component makes a POST request to the server to execute the command.
 * 3. **Navigation**: The component provides navigation using the up and down arrow keys. When the user presses the up arrow key, the component displays the previous command in the input field. When the user presses the down arrow key, the component displays the next command in the input field.
 * 4. **Loading State**: The component shows a loading state when the command is being executed. The loading state is represented by a spinner.
 * 5. **Error Handling**: The component handles errors that occur when executing the command. If an error occurs, the component displays an error message below the input field.
 */
const CLI = () => {
  const { vmName, containerName } = useParams();
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const historyEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom whenever history updates
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const handleCommandSubmit = async (e) => {
    e.preventDefault();
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    setIsLoading(true);

    try {
      const response = await axios.post(`/api/metrics/${vmName}/exec/${containerName}`, { command: trimmedCommand });
      const newOutput = response.data.output;

      // Append the command with prompt and its output to history
      setHistory((prevHistory) => [
        ...prevHistory,
        <div key={prevHistory.length} className="flex">
          <span className="text-green-500 mr-2">$</span>
          <span>{trimmedCommand}</span>
        </div>,
        ...newOutput.split('\n').map((line, idx) => (
          <div key={`${prevHistory.length + 1}-${idx}`} className="text-gray-300">
            {line}
          </div>
        )),
      ]);

      // Update command history for navigation
      setCommandHistory((prevCmdHistory) => [...prevCmdHistory, trimmedCommand]);
      setHistoryIndex(-1);
      setCommand('');
    } catch (error) {
      console.error('Error executing command:', error);
      const errorOutput = error.response?.data?.error || 'Command execution failed.';

      // Append the command with prompt and error message to history
      setHistory((prevHistory) => [
        ...prevHistory,
        <div key={prevHistory.length} className="flex">
          <span className="text-green-500 mr-2">$</span>
          <span>{trimmedCommand}</span>
        </div>,
        <div key={`${prevHistory.length}-error`} className="text-red-500">
          {errorOutput}
        </div>,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (isLoading) return; // Prevent navigation during loading

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const newIndex = historyIndex === -1 ? commandHistory.length - 1 : historyIndex - 1;
      if (newIndex >= 0) {
        setCommand(commandHistory[newIndex]);
        setHistoryIndex(newIndex);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const newIndex = historyIndex + 1;
      if (newIndex < commandHistory.length) {
        setCommand(commandHistory[newIndex]);
        setHistoryIndex(newIndex);
      } else {
        setCommand('');
        setHistoryIndex(-1);
      }
    }
  };

  const handleHistoryClick = () => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="mt-10 p-6 bg-black text-white pb-4 rounded-xl h-cli flex flex-col">
      <h2 className="text-2xl font-bold mb-4">CLI - {containerName} ({vmName})</h2>
      <div
        className="bg-black p-4 mt-4 rounded flex-1 overflow-y-auto font-mono text-sm hide-scrollbar"
        onClick={handleHistoryClick}
      >
        {history.map((line, index) => (
          <div key={index}>{line}</div>
        ))}

        {/* Current Input Prompt */}
        <div className="flex">
          <span className="text-green-500 mr-2">$</span>
          <form onSubmit={handleCommandSubmit} className="flex-1" style={{ display: 'flex' }}>
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              disabled={isLoading}
              className={`bg-black text-white flex-1 outline-none ${isLoading ? 'cursor-wait' : ''}`}
              style={{ caretColor: 'white' }}
              placeholder={isLoading ? 'Executing...' : ''}
            />
          </form>
        </div>

        {isLoading && (
          <div className="flex items-center mt-2">
            <span className="text-green-500 mr-2">Processing...</span>
            <div className="loader border-b-2 border-green-500 rounded-full w-2 h-2 animate-spin"></div>
          </div>
        )}

        <div ref={historyEndRef} />
      </div>
      <button
        onClick={() => navigate('/')}
        className="mt-4 bg-red-500 text-white p-2 rounded"
      >
        Exit CLI
      </button>
    </div>
  );
};

export default CLI;

