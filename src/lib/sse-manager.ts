import type { GameScene } from '@/db/schema';

// Store active connections with timestamps
interface ConnectionInfo {
  controller: ReadableStreamDefaultController;
  lastActivity: number;
}

// Store active connections - multiple controllers per story
const connections = new Map<string, Set<ConnectionInfo>>();

// Connection timeout in milliseconds (5 minutes)
const CONNECTION_TIMEOUT = 5 * 60 * 1000;

// Cleanup interval (1 minute)
const CLEANUP_INTERVAL = 60 * 1000;

// Function to add a connection
export function addConnection(storyId: string, controller: ReadableStreamDefaultController) {
  if (!connections.has(storyId)) {
    connections.set(storyId, new Set());
  }
  const connectionInfo: ConnectionInfo = {
    controller,
    lastActivity: Date.now()
  };
  connections.get(storyId)!.add(connectionInfo);
  console.log(`Added connection for story ${storyId}. Total connections: ${connections.get(storyId)!.size}`);
}

// Function to remove a connection
export function removeConnection(storyId: string, controller?: ReadableStreamDefaultController) {
  const storyConnections = connections.get(storyId);
  if (storyConnections) {
    if (controller) {
      // Find and remove the specific connection
      for (const connectionInfo of storyConnections) {
        if (connectionInfo.controller === controller) {
          storyConnections.delete(connectionInfo);
          console.log(`Removed specific connection for story ${storyId}. Remaining: ${storyConnections.size}`);
          break;
        }
      }
    } else {
      // Remove all connections for this story (legacy behavior)
      connections.delete(storyId);
      console.log(`Removed all connections for story ${storyId}`);
    }
    
    // Clean up empty sets
    if (storyConnections.size === 0) {
      connections.delete(storyId);
    }
  }
}

// Function to broadcast new scene to connected clients
export function broadcastNewScene(storyId: string, scene: GameScene) {
  const storyConnections = connections.get(storyId);
  if (storyConnections && storyConnections.size > 0) {
    const message = `data: ${JSON.stringify({ 
      type: 'new_scene', 
      scene,
      timestamp: new Date().toISOString()
    })}\n\n`;
    
    console.log(`Broadcasting to ${storyConnections.size} connections for story ${storyId}`);
    
    // Broadcast to all connected clients
    const deadConnections: ConnectionInfo[] = [];
    const now = Date.now();
    
    storyConnections.forEach(connectionInfo => {
      try {
        connectionInfo.controller.enqueue(message);
        // Update last activity timestamp
        connectionInfo.lastActivity = now;
      } catch (error) {
        console.error('Error broadcasting to connection:', error);
        deadConnections.push(connectionInfo);
      }
    });
    
    // Remove dead connections
    deadConnections.forEach(connectionInfo => {
      storyConnections.delete(connectionInfo);
    });
    
    // Clean up empty sets
    if (storyConnections.size === 0) {
      connections.delete(storyId);
    }
  } else {
    console.log(`No active connections for story ${storyId}`);
  }
}

// Function to get active connections count
export function getActiveConnections(storyId: string): boolean {
  const storyConnections = connections.get(storyId);
  return storyConnections ? storyConnections.size > 0 : false;
}

// Function to get connection count for debugging
export function getConnectionCount(storyId: string): number {
  const storyConnections = connections.get(storyId);
  return storyConnections ? storyConnections.size : 0;
}

// Function to clean up inactive connections
export function cleanupInactiveConnections() {
  const now = Date.now();
  let totalCleaned = 0;
  
  connections.forEach((storyConnections, storyId) => {
    const inactiveConnections: ConnectionInfo[] = [];
    
    storyConnections.forEach(connectionInfo => {
      if (now - connectionInfo.lastActivity > CONNECTION_TIMEOUT) {
        inactiveConnections.push(connectionInfo);
      }
    });
    
    // Remove inactive connections
     inactiveConnections.forEach(connectionInfo => {
       try {
         connectionInfo.controller.close();
       } catch {
         // Connection might already be closed
       }
       storyConnections.delete(connectionInfo);
       totalCleaned++;
     });
    
    // Clean up empty sets
    if (storyConnections.size === 0) {
      connections.delete(storyId);
    }
  });
  
  if (totalCleaned > 0) {
    console.log(`Cleaned up ${totalCleaned} inactive connections`);
  }
}

// Function to send heartbeat to all connections
export function sendHeartbeat() {
  const heartbeatMessage = `data: ${JSON.stringify({ 
    type: 'heartbeat', 
    timestamp: new Date().toISOString()
  })}\n\n`;
  
  connections.forEach((storyConnections, storyId) => {
    const deadConnections: ConnectionInfo[] = [];
    
    storyConnections.forEach(connectionInfo => {
       try {
         connectionInfo.controller.enqueue(heartbeatMessage);
         connectionInfo.lastActivity = Date.now();
       } catch {
         deadConnections.push(connectionInfo);
       }
     });
    
    // Remove dead connections
    deadConnections.forEach(connectionInfo => {
      storyConnections.delete(connectionInfo);
    });
    
    // Clean up empty sets
    if (storyConnections.size === 0) {
      connections.delete(storyId);
    }
  });
}

// Start cleanup interval
let cleanupInterval: NodeJS.Timeout | null = null;

export function startCleanupInterval() {
  if (cleanupInterval) {
    return; // Already started
  }
  
  cleanupInterval = setInterval(() => {
    cleanupInactiveConnections();
    sendHeartbeat();
  }, CLEANUP_INTERVAL);
  
  console.log('SSE cleanup interval started');
}

export function stopCleanupInterval() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('SSE cleanup interval stopped');
  }
}

// Auto-start cleanup when module is loaded
startCleanupInterval();