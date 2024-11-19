const { Client } = require('ssh2');
const fs = require('fs');

function connectToVM(vmHost) {
  return new Promise((resolve, reject) => {
    const bastionConn = new Client();
    bastionConn
      .on('ready', () => {
        bastionConn.forwardOut(
          '127.0.0.1',
          0,
          vmHost,
          22,
          (err, stream) => {
            if (err) {
              bastionConn.end();
              return reject(err);
            }
            const vmConn = new Client();
            vmConn
              .on('ready', () => {
                resolve({ vmConn, bastionConn });
              })
              .on('error', (err) => {
                bastionConn.end();
                reject(err);
              })
              .connect({
                sock: stream,
                username: 'cc',
                privateKey: fs.readFileSync('C:\\Users\\Maddox\\.ssh\\cckey.pem'),
              });
          }
        );
      })
      .on('error', (err) => {
        reject(err);
      })
      .connect({
        host: '129.114.27.250', // bastion1's public IP
        port: 22,
        username: 'cc',
        privateKey: fs.readFileSync('C:\\Users\\Maddox\\.ssh\\F24_BASTION.pem'),
      });
  });
}

module.exports = { connectToVM };
