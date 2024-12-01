import React from 'react';

/**
 * LogsViewer renders a text input field and a text area for viewing logs.
 * It also performs filtering based on the search term.
 *
 * @param {object} props
 * @param {string} props.logs - the logs to display
 * @param {string} props.filteredLogs - the filtered logs
 * @param {function} props.setFilteredLogs - the function to set the filtered logs
 * @param {string} props.searchTerm - the current search term
 * @param {function} props.setSearchTerm - the function to set the search term
 * @param {boolean} props.showLogs - whether to show the logs
 */
const LogsViewer = ({ logs, filteredLogs, setFilteredLogs, searchTerm, setSearchTerm, showLogs }) => {
  if (!showLogs) return null;

  /**
   * Handle changes in the search input field.
   * Update the search term and perform filtering based on the search term.
   * @param {object} e - the event object
   */
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Filter logs based on the search term
    const filtered = logs
      .split('\n')
      .filter((line) => line.toLowerCase().includes(term.toLowerCase()))
      .join('\n');
    setFilteredLogs(filtered);
  };

  return (
    <div className="mt-6 pb-10">
      <h4 className="font-semibold ">Logs:</h4>
      <input
        type="text"
        placeholder="Search logs..."
        value={searchTerm}
        onChange={handleSearch}
        className="w-full p-2 mb-4 border border-gray-300 bg-lightBg rounded"
      />
      <textarea
        className="w-full h-80 p-2 border border-gray-300 bg-lightBg rounded"
        readOnly
        value={filteredLogs}
      />
    </div>
  );
};

export default LogsViewer;

