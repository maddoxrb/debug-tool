import React from 'react';

const LogsViewer = ({ logs, filteredLogs, setFilteredLogs, searchTerm, setSearchTerm, showLogs }) => {
  if (!showLogs) return null;

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
