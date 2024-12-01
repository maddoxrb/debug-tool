const express = require('express');
const { connectToVM } = require('../sshUtils');
const router = express.Router();

// Mapping of VM names to their IP addresses
const vmHosts = {
  vm1: '192.168.5.50',
  vm2: '192.168.5.27',
  vm3: '192.168.5.80',
  vm4: '192.168.5.111',
};

// Helper function to safely parse JSON
function safeJSONParse(line) {
  try {
    return JSON.parse(line);
  } catch (error) {
    console.error("JSON parsing error:", error);
    return null;
  }
}

// Route to get network details of a VM
router.get('/:vmName', async (req, res) => {
  const { vmName } = req.params;
  const vmHost = vmHosts[vmName];

  // Validate VM name
  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  try {
    // Connect to the VM
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const command = 'docker network inspect bridge';

    let data = '';
    // Execute command to get network details
    vmConn.exec(command, (err, stream) => {
      if (err) throw err;

      // Collect command output
      stream.on('data', (chunk) => (data += chunk))
        .on('close', () => {
          const networkData = safeJSONParse(data);
          res.json(networkData);
          vmConn.end();
          bastionConn.end();
        })
        .stderr.on('data', (data) => {
          console.error('STDERR:', data.toString());
        });
    });
  } catch (err) {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Failed to connect to VM or retrieve network data' });
  }
});

// Route to get network details of a specific container
router.get('/:vmName/container/:containerName', async (req, res) => {
  const { vmName, containerName } = req.params;
  const vmHost = vmHosts[vmName];

  // Validate VM name
  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  try {
    // Connect to the VM
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const command = `docker inspect ${containerName}`;

    let data = '';
    // Execute command to inspect container
    vmConn.exec(command, (err, stream) => {
      if (err) throw err;

      // Collect command output
      stream.on('data', (chunk) => (data += chunk))
        .on('close', () => {
          const containerData = safeJSONParse(data);
          res.json(containerData[0]);
          vmConn.end();
          bastionConn.end();
        })
        .stderr.on('data', (data) => {
          console.error('STDERR:', data.toString());
        });
    });
  } catch (err) {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Failed to connect to VM or retrieve container network data' });
  }
});

module.exports = router;

