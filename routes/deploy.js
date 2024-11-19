const express = require('express');
const { connectToVM } = require('../sshUtils');
const router = express.Router();

router.post('/', async (req, res) => {
  const { imageName, containerName, vmName } = req.body;

  const vmHosts = {
    vm1: '192.168.5.50',
    vm2: '192.168.5.27',
    vm3: '192.168.5.80',
    vm4: '192.168.5.111',
  };

  const vmHost = vmHosts[vmName];

  if (!vmHost) {
    return res.status(400).json({ error: 'Invalid VM name' });
  }

  try {
    const { vmConn, bastionConn } = await connectToVM(vmHost);

    

    const deployCommand = `docker run -d --name ${containerName} ${imageName}`;

    vmConn.exec(deployCommand, (err, stream) => {
      if (err) {
        vmConn.end();
        bastionConn.end();
        return res.status(500).json({ error: err.message });
      }

      stream
        .on('close', () => {
          vmConn.end();
          bastionConn.end();
          res.json({ message: 'Container deployed successfully' });
        })
        .on('data', (data) => {
        })
        .stderr.on('data', (data) => {
          console.error('STDERR:', data.toString());
        });
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
