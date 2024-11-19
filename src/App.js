import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Metrics from './Metrics';
import DeployForm from './DeployForm';
import CLI from './CLI';
import ImageVolumeManagement from './ImageVolumeManagement';
import NetworkVisualization from './NetworkVisualization';
import ContainerNetworkInfo from './ContainerNetworkInfo';

const App = () => {
  const [vmName, setVmName] = useState('vm1');

  return (
    <div className={'dark'}>
      <div className="min-h-screen bg-background dark:bg-background text-text dark:text-text">
        <Router>
          <header className="p-6 bg-card dark:bg-card shadow-md">
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold">Docker Debug Dashboard</h1>
              {/* Navigation Buttons */}
              <nav className="flex gap-4">
                <Link
                  to="/"
                  className="px-4 py-2 bg-orange-500 text-white rounded-3xl hover:bg-orange-600 transition"
                >
                  View Metrics
                </Link>
                <Link
                  to={`/network/${vmName}`}
                  className="px-4 py-2 bg-orange-500 text-white rounded-3xl hover:bg-orange-600 transition"
                >
                  View Network
                </Link>
                <Link
                  to="/deploy"
                  className="px-4 py-2 bg-orange-500 text-white rounded-3xl hover:bg-orange-600 transition"
                >
                  Deploy Container
                </Link>
                <Link
                  to={`/manage/${vmName}`}
                  className="px-4 py-2 bg-orange-500 text-white rounded-3xl hover:bg-orange-600 transition"
                >
                  Manage Images & Volumes
                </Link>
                
              </nav>
            </div>
          </header>

          <main className="container mx-auto p-6">
            {/* Routes */}
            <Routes>
              <Route path="/" element={<Metrics />} />
              <Route path="/deploy" element={<DeployForm />} />
              <Route path="/cli/:vmName/:containerName" element={<CLI />} />
              <Route path="/manage/:vmName" element={<ImageVolumeManagement />} />
              <Route path="/network/:vmName" element={<NetworkVisualization />} />
              <Route path="/network/container/:vmName/:containerName" element={<ContainerNetworkInfo />} />
            </Routes>
          </main>
        </Router>
      </div>
    </div>
  );
};

export default App;
