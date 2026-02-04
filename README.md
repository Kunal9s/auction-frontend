Live Auction Platform

A real-time auction platform built with React, Node.js, Socket.io, 
and Redis. The key features include live bidding, countdown timers 
and instant updates across all connected users.

Key Highlights:
1. Real-time bidding - Instant updates across all clients using WebSocket
2. Race condition prevention - Atomic operations with Redis Lua scripts
3. Server time synchronization - Prevents client-side time manipulation
4. Live countdown timers - Visual indicators for auction end times
5. Responsive design - Works on desktop, laptop & mobile devices
6. Smooth animations - Framer motion for fluid UI transitions
7. Toast notifications - Real-time feedback for bid success/failure
8. Auto-reconnection - Handles network interruptions gracefully

Architecture
Tech Stack
Frontend: 
🪛 React 19 - UI framework
🪛 Socket.io Client - Real-time communication
🪛 Framer Motion - Animations
🪛 React Hot Toast - Notifications

Backend:
🪛 Node.js - Runtime
🪛 Express - Web framework
🪛 Socket.io - WebSocket server
🪛 Redis - In-memory database
🪛 ioredis - Redis client with Lua support 

Infrastructure:
🪛 Docker - Containerization
🪛 Docker Compose - Multi-container orchestration

Deployment:
➡️ Backend: Render
➡️ Frontend: Vercel

Built with ❤️ using React, Node.js, Socket.io and redis


