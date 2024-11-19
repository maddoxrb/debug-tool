const express = require('express');
const { connectToVM } = require('../sshUtils');
const router = express.Router();

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

// --------------------
// Images Routes
// --------------------

// Fetch Docker images for a VM
router.get('/images/:vmName', async (req, res) => {
  const { vmName } = req.params;
  const vmHost = vmHosts[vmName];

  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  try {
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const command = 'docker images --format "{{json .}}"';

    let data = '';
    vmConn.exec(command, (err, stream) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      stream.on('data', (chunk) => (data += chunk))
        .on('close', () => {
          const images = data.trim().split('\n').map(safeJSONParse).filter(Boolean);
          res.json(images);
          vmConn.end();
          bastionConn.end();
        })
        .stderr.on('data', (data) => {
          console.error('STDERR:', data.toString());
        });
    });
  } catch (err) {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Failed to connect to VM or fetch images' });
  }
});

// Delete a Docker image
router.delete('/images/:vmName/:imageId', async (req, res) => {
  const { vmName, imageId } = req.params;
  const vmHost = vmHosts[vmName];

  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  try {
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const command = `docker rmi ${imageId}`;

    vmConn.exec(command, (err) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Image deleted successfully' });
      vmConn.end();
      bastionConn.end();
    });
  } catch (err) {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Failed to connect to VM or delete image' });
  }
});

// --------------------
// Volumes Routes
// --------------------

// Fetch Docker volumes for a VM
router.get('/volumes/:vmName', async (req, res) => {
  const { vmName } = req.params;
  const vmHost = vmHosts[vmName];

  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  try {
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const command = 'docker volume ls --format "{{json .}}"';

    let data = '';
    vmConn.exec(command, (err, stream) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      stream.on('data', (chunk) => (data += chunk))
        .on('close', () => {
          const volumes = data.trim().split('\n').map(safeJSONParse).filter(Boolean);
          res.json(volumes);
          vmConn.end();
          bastionConn.end();
        })
        .stderr.on('data', (data) => {
          console.error('STDERR:', data.toString());
        });
    });
  } catch (err) {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Failed to connect to VM or fetch volumes' });
  }
});

// Delete a Docker volume
router.delete('/volumes/:vmName/:volumeName', async (req, res) => {
  const { vmName, volumeName } = req.params;
  const vmHost = vmHosts[vmName];

  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  try {
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const command = `docker volume rm ${volumeName}`;

    vmConn.exec(command, (err) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Volume deleted successfully' });
      vmConn.end();
      bastionConn.end();
    });
  } catch (err) {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Failed to connect to VM or delete volume' });
  }
});

// --------------------
// Environment Variables Routes
// --------------------

// Fetch environment variables for a container
router.get('/:vmName/env/:containerName', async (req, res) => {
  const { vmName, containerName } = req.params;
  const vmHost = vmHosts[vmName];

  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  try {
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const command = `docker inspect --format '{{json .Config.Env}}' ${containerName}`;

    vmConn.exec(command, (err, stream) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      let data = '';
      stream.on('data', (chunk) => (data += chunk))
        .on('close', () => {
          try {
            const envVars = JSON.parse(data);
            res.json({ envVars });
          } catch (parseError) {
            console.error('Error parsing environment variables:', parseError);
            res.status(500).json({ error: 'Failed to parse environment variables' });
          }
          vmConn.end();
          bastionConn.end();
        })
        .stderr.on('data', (data) => {
          console.error('STDERR:', data.toString());
        });
    });
  } catch (err) {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Failed to connect to VM or fetch environment variables' });
  }
});

// Update an environment variable for a container
router.post('/:vmName/env/:containerName', async (req, res) => {
  const { vmName, containerName } = req.params;
  const { key, value } = req.body;
  const vmHost = vmHosts[vmName];

  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  if (!key || !value) return res.status(400).json({ error: 'Environment variable key and value are required' });

  try {
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    // Updating env vars in a running container is not straightforward. It usually requires recreating the container.
    // For demonstration, we'll export the variable in the current shell.
    const command = `docker exec ${containerName} bash -c "export ${key}='${value}'"`;

    vmConn.exec(command, (err, stream) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      stream.on('close', () => {
        res.json({ message: 'Environment variable updated (temporary for current shell)' });
        vmConn.end();
        bastionConn.end();
      })
      .stderr.on('data', (data) => {
        console.error('STDERR:', data.toString());
      });
    });
  } catch (err) {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Failed to connect to VM or update environment variable' });
  }
});

// --------------------
// Container Metrics Routes
// --------------------

// Route to get container metrics
router.get('/:vmName', async (req, res) => {
  const { vmName } = req.params;
  const vmHost = vmHosts[vmName];

  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  try {
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const metricsCommand = 'sudo docker stats --no-stream --format "{{json .}}"';

    vmConn.exec(metricsCommand, (err, stream) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      let data = '';
      stream
        .on('data', (chunk) => (data += chunk))
        .on('close', () => {
          if (!data) {
            console.error('No data received from Docker stats');
            res.status(500).json({ error: 'No data received from Docker stats' });
          } else {
            const lines = data.trim().split('\n');
            const metrics = lines.map(safeJSONParse).filter((item) => item !== null);

            // If metrics array is empty after filtering
            if (metrics.length === 0) {
              console.error('No valid JSON data received');
              res.status(500).json({ error: 'No valid metrics data' });
            } else {
              res.json(metrics);
            }
          }

          // Close the connections
          vmConn.end();
          bastionConn.end();
        })
        .stderr.on('data', (data) => {
          console.error('STDERR:', data.toString());
        });
    });
  } catch (err) {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Failed to connect to VM or retrieve metrics' });
  }
});

// Route to get logs of a specific container
router.get('/:vmName/logs/:containerName', async (req, res) => {
    const { vmName, containerName } = req.params;
    const vmHost = vmHosts[vmName];
  
    if (!vmHost) {
      return res.status(400).json({ error: 'Invalid VM name' });
    }
  
    try {
      const { vmConn, bastionConn } = await connectToVM(vmHost);
      const logsCommand = `sudo docker logs --tail 200 ${containerName}`;
      console.log(`Executing command: ${logsCommand}`);
  
      let responseSent = false;
      let data = '';
      let errorData = '';
  
      vmConn.exec(logsCommand, (err, stream) => {
        if (err) {
          console.error('Command execution error:', err);
          vmConn.end();
          bastionConn.end();
          return res.status(500).json({ error: err.message });
        }
  
        stream
          .on('data', (chunk) => {
            data += chunk;
          })
          .on('close', () => {
            if (!responseSent) {
              responseSent = true;
              console.log('Logs retrieved:', { stdout: data, stderr: errorData });
              res.json({ logs: data + errorData });
            }
            vmConn.end();
            bastionConn.end();
          })
          .stderr.on('data', (chunk) => {
            errorData += chunk; // Append STDERR to a separate variable
          });
      });
    } catch (err) {
      console.error('Connection error:', err);
      res.status(500).json({ error: 'Failed to connect to VM or retrieve logs' });
    }
  });
  
  

// Route to stop a container
router.post('/:vmName/stop/:containerName', async (req, res) => {
  const { vmName, containerName } = req.params;
  const vmHost = vmHosts[vmName];

  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  try {
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const stopCommand = `sudo docker stop ${containerName}`;

    vmConn.exec(stopCommand, (err) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Container stopped successfully' });
      vmConn.end();
      bastionConn.end();
    });
  } catch (err) {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Failed to connect to VM or stop container' });
  }
});

// Execute a command inside a running container
router.post('/:vmName/exec/:containerName', async (req, res) => {
  const { vmName, containerName } = req.params;
  const { command } = req.body;
  const vmHost = vmHosts[vmName];

  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  if (!command) return res.status(400).json({ error: 'Command is required' });

  try {
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const execCommand = `sudo docker exec ${containerName} ${command}`;

    vmConn.exec(execCommand, (err, stream) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      let data = '';
      stream.on('data', (chunk) => (data += chunk))
        .on('close', () => {
          res.json({ output: data });
          vmConn.end();
          bastionConn.end();
        })
        .stderr.on('data', (data) => {
          console.error('STDERR:', data.toString());
        });
    });
  } catch (err) {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Failed to connect to VM or execute command' });
  }
});

// Restart a container
router.post('/:vmName/restart/:containerName', async (req, res) => {
  const { vmName, containerName } = req.params;
  const vmHost = vmHosts[vmName];

  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  try {
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const restartCommand = `docker restart ${containerName}`;

    vmConn.exec(restartCommand, (err) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Container restarted successfully' });
      vmConn.end();
      bastionConn.end();
    });
  } catch (err) {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Failed to connect to VM or restart container' });
  }
});

module.exports = router;