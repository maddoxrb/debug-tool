# Docker Debug Dashboard

This project is a web-based dashboard for monitoring and debugging Docker containers on a remote virtual machine.

## Overview

The dashboard is built using React and Node.js, and allows users to view metrics and logs for individual containers, as well as execute commands and view network information.

## File Structure

* `debug-tool/` - React frontend code
	+ `public/` - static assets
	+ `src/` - React components and utilities
		- `App.js` - top-level component for the dashboard
		- `CLI.js` - component for executing commands on a container
		- `ContainerCard.js` - component for displaying metrics and logs for a single container
		- `ContainerHeader.js` - component for displaying the header for a container
		- `DeployForm.js` - component for deploying a new container
		- `EnvVariables.js` - component for displaying environment variables for a container
		- `ImageVolumeManagement.js` - component for managing images and volumes
		- `LogsViewer.js` - component for displaying logs for a container
		- `Metrics.js` - component for displaying metrics for a container
		- `NetworkVisualization.js` - component for visualizing the network for a container
		- `index.css` - global CSS styles
	+ `server/` - Node.js server code
		- `index.js` - main server file
		- `routes/` - API routes for the server
			- `cli.js` - API route for executing commands on a container
			- `deploy.js` - API route for deploying a new container
			- `images.js` - API route for managing images
			- `network.js` - API route for visualizing the network for a container
			- `volumes.js` - API route for managing volumes
	+ `package.json` - dependencies and scripts for the frontend
	+ `README.md` - this file
* `simulations/` - example Dockerfiles and scripts for simulating workloads
	+ `Dockerfile.error` - Dockerfile that generates an error
	+ `Dockerfile.standard` - Dockerfile that generates a standard workload
	+ `collect_stats.py` - script for collecting metrics and logs for a container

## Development

To start the development server, run `npm start` in the `debug-tool/` directory. This will start the server and open the dashboard in your default web browser.

To build the frontend, run `npm run build` in the `debug-tool/` directory. This will create a production build of the frontend in the `debug-tool/build/` directory.

To start the server, run `node debug-tool/server/index.js` in the `debug-tool/` directory.
