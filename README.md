# Network Lab

An interactive network topology builder and packet-routing visualizer built with React, TypeScript, and graph algorithms.

## Features
- Draggable workstations, switches, routers, servers, firewalls and cloud nodes
- Connect devices visually, delete nodes or edges
- Breadth-first search to find the shortest path by hop count
- Animate the route and simulate offline devices
- Save diagrams locally, reset or export JSON
- Unit tests for the routing engine

This is an **educational graph simulation**, not real IP routing or packet-level emulation.

## Run locally
Requires Node.js 20.19+.

```bash
npm install
npm run dev
```

Run tests with `npm test` and create a production bundle with `npm run build`.

## Roadmap
- Weighted routes and Dijkstra's algorithm
- Import JSON and predefined lab scenarios
- Link latency and packet-loss simulation
- Device hardware inventory and GPU servers

Built as a software engineering portfolio project.
