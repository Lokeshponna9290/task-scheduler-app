import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure database directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Middleware
app.use(express.json({ limit: '15mb' }));

// Helper to sanitize user identifier for filenames
function sanitizeUserId(userId) {
  if (!userId || typeof userId !== 'string') return 'default';
  return userId.replace(/[^a-zA-Z0-9_-]/g, '_');
}

// Get user specific events file path
function getUserEventsFilePath(userId) {
  const safeId = sanitizeUserId(userId);
  return path.join(DATA_DIR, `events_${safeId}.json`);
}

// Get user specific profile file path
function getUserProfileFilePath(userId) {
  const safeId = sanitizeUserId(userId);
  return path.join(DATA_DIR, `profile_${safeId}.json`);
}

// Helper to read events for a user
function readUserEvents(userId) {
  const filePath = getUserEventsFilePath(userId);
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`Error reading events for user ${userId}:`, err);
  }
  return null;
}

// Helper to write events for a user
function writeUserEvents(userId, data) {
  const filePath = getUserEventsFilePath(userId);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing events for user ${userId}:`, err);
    return false;
  }
}

// Helper to read profile for a user
function readUserProfile(userId) {
  const filePath = getUserProfileFilePath(userId);
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`Error reading profile for user ${userId}:`, err);
  }
  return null;
}

// Helper to write profile for a user
function writeUserProfile(userId, data) {
  const filePath = getUserProfileFilePath(userId);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing profile for user ${userId}:`, err);
    return false;
  }
}

// ==================== REST DATABASE API ====================

// 1. Get all events for a Google user (Multi-device Cloud Fetch)
app.get('/api/events', (req, res) => {
  const userId = req.query.userId || 'default';
  let events = readUserEvents(userId);
  
  // If user has no specific events yet, fallback to default events or empty
  if (!events && userId !== 'default') {
    const defaultEvents = readUserEvents('default');
    if (defaultEvents) {
      events = defaultEvents;
      writeUserEvents(userId, events); // Copy to user database
    }
  }

  res.json({
    success: true,
    userId,
    data: events || [],
    count: events ? events.length : 0,
    timestamp: new Date().toISOString(),
  });
});

// 2. Sync / Save all events immediately to User Cloud Database
app.post('/api/events', (req, res) => {
  let { userId, events } = req.body;
  if (!events && Array.isArray(req.body)) {
    events = req.body;
    userId = req.query.userId || 'default';
  }
  userId = userId || req.query.userId || 'default';

  if (!Array.isArray(events)) {
    return res.status(400).json({ success: false, error: 'Expected an array of events' });
  }

  const saved = writeUserEvents(userId, events);
  // Also save to default as fallback
  if (userId !== 'default') {
    writeUserEvents('default', events);
  }

  if (saved) {
    res.json({ success: true, userId, count: events.length, timestamp: new Date().toISOString() });
  } else {
    res.status(500).json({ success: false, error: 'Failed to write to cloud database' });
  }
});

// 3. User Profile API
app.get('/api/profile', (req, res) => {
  const userId = req.query.userId || 'default';
  const profile = readUserProfile(userId) || readUserProfile('default');
  res.json({ success: true, userId, data: profile });
});

app.post('/api/profile', (req, res) => {
  const { userId = 'default', profile } = req.body;
  const data = profile || req.body;
  writeUserProfile(userId, data);
  res.json({ success: true, userId, data });
});

// 4. Google Auth Multi-Device Cloud Sync Verification
app.post('/api/auth/google', (req, res) => {
  const { email, name, picture, googleId } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Google email is required' });
  }

  const userId = email.toLowerCase().trim();
  let userProfile = readUserProfile(userId);

  if (!userProfile) {
    userProfile = {
      name: name || 'Google User',
      email,
      avatarUrl: picture || null,
      googleId: googleId || `g_${Date.now()}`,
      membership: 'Google Cloud Pro',
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
      devicesCount: 2,
    };
    writeUserProfile(userId, userProfile);
  }

  // Load existing events or initialize
  let events = readUserEvents(userId);
  if (!events) {
    events = readUserEvents('default') || [];
    writeUserEvents(userId, events);
  }

  res.json({
    success: true,
    user: userProfile,
    eventsCount: events.length,
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', multiDeviceSync: true, time: new Date().toISOString() });
});

// ==================== STATIC ASSETS & SPA FALLBACK ====================

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Scheduler Cloud Multi-Device Server running on port ${PORT}`);
});
