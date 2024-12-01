const { Client } = require('ssh2');
const fs = require('fs');

/**
 * Connect to a VM using SSH and return the SSH connection.
 * @param {string} vmHost - The hostname or IP address of the VM.
 * @return {Promise} - A Promise that resolves with an object containing the SSH connection to the VM and the SSH connection to the bastion.
 */
function connectToVM(vmHost) {
  return new Promise((resolve, reject) => {
    // Establish a connection to the bastion.
    const bastionConn = new Client();
    bastionConn
      .on('ready', () => {
        // Forward an SSH connection from the bastion to the VM.
        bastionConn.forwardOut(
          '127.0.0.1',
          0,
          vmHost,
          22,
          (err, stream) => {
            if (err) {
              // Close the bastion connection if there's an error.
              bastionConn.end();
              return reject(err);
            }
            // Create a new SSH connection that will be forwarded to the VM.
            const vmConn = new Client();
            vmConn
              .on('ready', () => {
                // Resolve the Promise with the VM connection and the bastion connection.
                resolve({ vmConn, bastionConn });
              })
              .on('error', (err) => {
                // Close the bastion connection if there's an error.
                bastionConn.end();
                reject(err);
              })
              .connect({
                // Use the forwarded connection as the socket for the VM connection.
                sock: stream,
                username: 'cc',
                // Use the private key to authenticate with the VM.
                privateKey: fs.readFileSync('C:\\Users\\Maddox\\.ssh\\cckey.pem'),
              });
          }
        );
      })
      .on('error', (err) => {
        // Reject the Promise if there's an error connecting to the bastion.
        reject(err);
      })
      .connect({
        // Connect to the bastion using its public IP address.
        host: '129.114.27.250',
        port: 22,
        username: 'cc',
        // Use the private key to authenticate with the bastion.
        privateKey: fs.readFileSync('C:\\Users\\Maddox\\.ssh\\F24_BASTION.pem'),
      });
  });
}

module.exports = { connectToVM };

