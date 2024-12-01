/**
 * @api {post} /deploy Deploy a container on a VM
 * @apiName DeployContainer
 * @apiGroup Deployment
 * @apiParam {String} imageName Name of the Docker image to deploy.
 * @apiParam {String} containerName Name of the container to create.
 * @apiParam {String} vmName Name of the VM to deploy on.
 * @apiSuccess {Object} result Deployment result.
 * @apiError {String} error Error message.
 */
const express = require('express');
const { connectToVM } = require('../sshUtils');
const router = express.Router();

router.post('/', async (req, res) => {
  const { imageName, containerName, vmName } = req.body;

  // List of VMs and their IP addresses
  const vmHosts = {
    vm1: '192.168.5.50',
    vm2: '192.168.5.27',
    vm3: '192.168.5.80',
    vm4: '192.168.5.111',
  };

  // Get the IP address of the specified VM
  const vmHost = vmHosts[vmName];

  if (!vmHost) {
    // Return an error if the VM name is invalid
    return res.status(400).json({ error: 'Invalid VM name' });
  }

  try {
    // Connect to the VM using SSH
    const { vmConn, bastionConn } = await connectToVM(vmHost);

    // Create the deployment command
    const deployCommand = `docker run -d --name ${containerName} ${imageName}`;

    // Execute the command on the VM
    vmConn.exec(deployCommand, (err, stream) => {
      if (err) {
        // Close the SSH connection and return an error if something goes wrong
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      // Handle the output of the command
      stream
        .on('close', () => {
          // Close the SSH connection when the command is done
          vmConn.end();
          bastionConn.end();
          // Return a success message
          res.json({ message: 'Container deployed successfully' });
        })
        .on('data', (data) => {
          // Log any output from the command
          console.log(data.toString());
        })
        .stderr.on('data', (data) => {
          // Log any errors from the command
          console.error('STDERR:', data.toString());
        });
    });
  } catch (err) {
    // Catch any errors that occur and return an error message
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

