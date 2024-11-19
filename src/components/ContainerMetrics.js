import React from 'react';

const ContainerMetrics = ({ container }) => (
  <div className="mt-4">
    <p><strong>CPU Usage:</strong> {container.CPUPerc}</p>
    <p><strong>Memory Usage:</strong> {container.MemUsage} ({container.MemPerc})</p>
    <p><strong>Net I/O:</strong> {container.NetIO}</p>
    <p><strong>Container ID:</strong> {container.Container}</p>
    <p><strong>Processes:</strong> {container.PIDs}</p>
  </div>
);

export default ContainerMetrics;
