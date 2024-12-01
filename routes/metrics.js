const express = require('express');
const { connectToVM } = require('../sshUtils');
const router = express.Router();
const { spawn } = require('child_process');

// Define the list of VMs and their IP addresses
const vmHosts = {
  vm1: '192.168.5.50',
  vm2: '192.168.5.27',
  vm3: '192.168.5.80',
  vm4: '192.168.5.111',
};

/**
 * Helper function to safely parse JSON strings
 * @param {String} line The JSON string to parse
 * @returns {Object} The parsed JSON object, or null if parsing fails
 */
function safeJSONParse(line) {
  try {
    return JSON.parse(line);
  } catch (error) {
    console.error('JSON parsing error:', error);
    return null;
  }
}

/**
 * Function to convert memory sizes from various units to MiB
 * @param {String} sizeStr The memory size with optional unit (e.g. '100 MiB', '1 GB', '500 KB')
 * @returns {Number} The memory size in MiB
 */
function convertToMiB(sizeStr) {
  let size = parseFloat(sizeStr);
  if (sizeStr.toUpperCase().includes('GIB') || sizeStr.toUpperCase().includes('GB')) {
    return size * 1024;
  } else if (sizeStr.toUpperCase().includes('MIB') || sizeStr.toUpperCase().includes('MB')) {
    return size;
  } else if (sizeStr.toUpperCase().includes('KIB') || sizeStr.toUpperCase().includes('KB')) {
    return size / 1024;
  } else {
    return size; // Assume MiB if no unit is specified
  }
}

/**
 * Function to get prediction from Python script
 * @param {Object} containerStats The container statistics as returned by the docker container inspect command
 * @returns {Promise<String>} The prediction from the Python script, or an error message if the Python script fails
 */
const getPrediction = (containerStats) => {
  return new Promise((resolve, reject) => {
    try {
      // Extract the memory usage and limit from the container stats
      const memUsageParts = containerStats.MemUsage.split(' / ');
      const memUsageStr = memUsageParts[0].trim();
      const memLimitStr = memUsageParts[1].trim();

      // Create the input data for the Python script
      const inputData = {
        cpu_perc: parseFloat(containerStats.CPUPerc.replace('%', '').trim()),
        mem_usage: convertToMiB(memUsageStr),
        mem_limit: convertToMiB(memLimitStr),
        mem_perc: parseFloat(containerStats.MemPerc.replace('%', '').trim()),
        pids: parseInt(containerStats.PIDs),
      };

      // Spawn the Python script and pass the input data to its stdin
      const pyProcess = spawn('python3', ['predict.py']);
      pyProcess.stdin.write(JSON.stringify(inputData));
      pyProcess.stdin.end();

      let prediction = '';
      let errorData = '';

      pyProcess.stdout.on('data', (data) => {
        prediction += data.toString();
      });

      pyProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pyProcess.on('close', (code) => {
        if (code !== 0) {
          // If the Python script failed, log the error and reject the promise
          console.error(`Python script exited with code ${code}: ${errorData}`);
          reject(new Error(`Python script error: ${errorData}`));
        } else {
          // If the Python script succeeded, resolve the promise with the prediction
          resolve(prediction.trim());
        }
      });
    } catch (err) {
      // If there was an error preprocessing the container stats, log the error and reject the promise
      console.error('Error preprocessing container stats:', err);
      reject(err);
    }
  });

};

// --------------------
// Images Routes
// -------------------

// Route to get Docker images for a VM
router.get('/images/:vmName', async (req, res) => {
  const { vmName } = req.params;
  const vmHost = vmHosts[vmName];

  // Validate the VM name
  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  try {
    // Connect to the VM
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const command = 'docker images --format "{{json .}}"';

    let data = '';
    // Execute the command to fetch images
    vmConn.exec(command, (err, stream) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      // Collect command output and parse it
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

// Route to delete a Docker image
router.delete('/images/:vmName/:imageId', async (req, res) => {
  const { vmName, imageId } = req.params;
  const vmHost = vmHosts[vmName];

  // Validate the VM name
  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  try {
    // Connect to the VM
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const command = `docker rmi ${imageId}`;

    // Execute the command to remove the image
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

// Route to list Docker volumes for a VM
router.get('/volumes/:vmName', async (req, res) => {
  const { vmName } = req.params;
  const vmHost = vmHosts[vmName];

  // Validate the VM name
  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  try {
    // Connect to the VM
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const command = 'docker volume ls --format "{{json .}}"';

    let data = '';
    // Execute the command to list volumes
    vmConn.exec(command, (err, stream) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      // Collect command output and parse it
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

// Route to delete a Docker volume
router.delete('/volumes/:vmName/:volumeName', async (req, res) => {
  const { vmName, volumeName } = req.params;
  const vmHost = vmHosts[vmName];

  // Validate the VM name
  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  try {
    // Connect to the VM
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const command = `docker volume rm ${volumeName}`;

    // Execute the command to delete the volume
    vmConn.exec(command, (err) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      // Return a success message
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

  // Check if the VM host is valid
  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  try {
    // Connect to the VM
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const command = `docker inspect --format '{{json .Config.Env}}' ${containerName}`;

    vmConn.exec(command, (err, stream) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      // Collect the command output
      let data = '';
      stream.on('data', (chunk) => (data += chunk))
        .on('close', () => {
          try {
            // Parse and return the environment variables
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

  // Check if the VM host is valid
  if (!vmHost) return res.status(400).json({ error: 'Invalid VM name' });

  // Validate that both key and value are provided
  if (!key || !value) return res.status(400).json({ error: 'Environment variable key and value are required' });

  try {
    // Connect to the VM
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    const command = `docker exec ${containerName} bash -c "export ${key}='${value}'"`;

    vmConn.exec(command, (err, stream) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      // Confirm the environment variable update
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

  if (!vmHost) {
    return res.status(400).json({ error: 'Invalid VM name' });
  }

  try {
    // Connect to the VM using SSH
    const { vmConn, bastionConn } = await connectToVM(vmHost);
    // Get the container metrics using Docker stats
    const metricsCommand = 'sudo docker stats --no-stream --format "{{json .}}"';

    // Execute the command and stream the output
    vmConn.exec(metricsCommand, async (err, stream) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      // Accumulate the output of the command
      let data = '';
      stream
        .on('data', (chunk) => (data += chunk))
        .on('close', async () => {
          if (!data) {
            console.error('No data received from Docker stats');
            res.status(500).json({ error: 'No data received from Docker stats' });
          } else {
            // Parse the output into an array of JSON objects
            const lines = data.trim().split('\n');
            const metrics = lines.map(safeJSONParse).filter((item) => item !== null);

            // If no valid data was received, return an error
            if (metrics.length === 0) {
              console.error('No valid JSON data received');
              res.status(500).json({ error: 'No valid metrics data' });
            } else {
              // For each container, get the prediction and add it to the metrics
              try {
                const predictions = await Promise.all(
                  metrics.map(async (container) => {
                    try {
                      // Get the prediction for the container
                      const prediction = await getPrediction(container);
                      // If the prediction is 1, set the warning flag
                      container.warning = prediction === '1';
                    } catch (err) {
                      console.error(
                        `Error getting prediction for container ${container.Name}:`,
                        err
                      );
                      // If there's an error, set the warning flag to false
                      container.warning = false;
                    }
                    return container;
                  })
                );
                // Return the array of metrics with the predictions
                res.json(predictions);
              } catch (err) {
                console.error('Error processing metrics:', err);
                res.status(500).json({ error: 'Failed to process metrics' });
              }
            }
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
    res.status(500).json({ error: 'Failed to connect to VM or retrieve metrics' });
  }
});

module.exports = router;

// Route to get logs of a specific container
router.get('/:vmName/logs/:containerName', async (req, res) => {
    const { vmName, containerName } = req.params;
    const vmHost = vmHosts[vmName];
  
    if (!vmHost) {
      return res.status(400).json({ error: 'Invalid VM name' });
    }
  
    try {
      // Connect to the VM using SSH
      const { vmConn, bastionConn } = await connectToVM(vmHost);
      // Get the logs of the specified container using Docker logs
      const logsCommand = `sudo docker logs --tail 200 ${containerName}`;
      console.log(`Executing command: ${logsCommand}`);
  
      let responseSent = false;
      let data = '';
      let errorData = '';
  
      // Execute the command and stream the output
      vmConn.exec(logsCommand, (err, stream) => {
        if (err) {
          console.error('Command execution error:', err);
          vmConn.end();
          bastionConn.end();
          return res.status(500).json({ error: err.message });
        }
  
        // Accumulate the output of the command
        stream
          .on('data', (chunk) => {
            data += chunk;
          })
          .on('close', () => {
            // Return the logs if they haven't been sent yet
            if (!responseSent) {
              responseSent = true;
              res.json({ logs: data + errorData });
            }
            // Close the SSH connections
            vmConn.end();
            bastionConn.end();
          })
          .stderr.on('data', (chunk) => {
            errorData += chunk; 
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

    // Execute the command to stop the container
    vmConn.exec(stopCommand, (err) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      // Return a success message
      res.json({ message: 'Container stopped successfully' });
      // Close the SSH connections
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

    // Execute the command and stream the output
    vmConn.exec(execCommand, (err, stream) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      let data = '';
      // Accumulate the output of the command
      stream.on('data', (chunk) => (data += chunk))
        .on('close', () => {
          // Return the output of the command
          res.json({ output: data });
          // Close the SSH connections
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

    // Execute the command to restart the container
    vmConn.exec(restartCommand, (err) => {
      if (err) {
        console.error('Command execution error:', err);
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Container restarted successfully' });
      // Close the SSH connections
      vmConn.end();
      bastionConn.end();
    });
  } catch (err) {
    console.error('Connection error:', err);
    res.status(500).json({ error: 'Failed to connect to VM or restart container' });
  }
});

module.exports = router;

