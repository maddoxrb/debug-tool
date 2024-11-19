const express = require('express');
const deployRouter = require('./routes/deploy');
const metricsRouter = require('./routes/metrics');
const networkRoutes = require('./routes/network');
const app = express();
app.use(express.json());

// Register your routers
app.use('/api/deploy', deployRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/network', networkRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
