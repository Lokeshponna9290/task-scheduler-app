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

const EVENTS_DB_FILE = path.join(DATA_DIR, 'events.json');
const PROFILE_DB_FILE = path.join(DATA_DIR, 'profile.json');

// Middleware
app.use(express.json({ limit: '10mb' }));

// Helper to read database
function readEventsDB() {
  try {
    if (fs.existsSync(EVENTS_DB_FILE)) {
      const raw = fs.readFileSync(EVENTS_DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading events database:', err);
  }
  return null;
}

// Helper to write database
function writeEventsDB(data) {
  try {
    fs.writeFileSync(EVENTS_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing events database:', err);
    return false;
  }
}

// Helper to read profile database
function readProfileDB() {
  try {
    if (fs.existsSync(PROFILE_DB_FILE)) {
      const raw = fs.readFileSync(PROFILE_DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading profile database:', err);
  }
  return null;
}

// Helper to write profile database
function writeProfileDB(data) {
  try {
    fs.writeFileSync(PROFILE_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing profile database:', err);
    return false;
  }
}

// ==================== REST DATABASE API ====================

// 1. Get all events from Database
app.get('/api/events', (req, res) => {
  const events = readEventsDB();
  res.json({
    success: true,
    data: events || [],
    count: events ? events.length : 0,
    timestamp: new Date().toISOString(),
  });
});

// 2. Sync/Save all events immediately to Database
app.post('/api/events', (req, res) => {
  const events = req.body;
  if (!Array.isArray(events)) {
    return res.status(400).json({ success: false, error: 'Expected an array of events' });
  }

  const saved = writeEventsDB(events);
  if (saved) {
    res.json({ success: true, count: events.length, timestamp: new Date().toISOString() });
  } else {
    res.status(500).json({ success: false, error: 'Failed to write to database' });
  }
});

// 3. Upsert single event
app.post('/api/events/upsert', (req, res) => {
  const event = req.body;
  if (!event || !event.id) {
    return res.status(400).json({ success: false, error: 'Event object with id is required' });
  }

  let events = readEventsDB() || [];
  const idx = events.findIndex(e => e.id === event.id);
  if (idx >= 0) {
    events[idx] = event;
  } else {
    events.push(event);
  }

  writeEventsDB(events);
  res.json({ success: true, data: event, timestamp: new Date().toISOString() });
});

// 4. Delete single event
app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  let events = readEventsDB() || [];
  events = events.filter(e => e.id !== id);
  writeEventsDB(events);
  res.json({ success: true, deletedId: id, timestamp: new Date().toISOString() });
});

// 5. Get User Profile from Database
app.get('/api/profile', (req, res) => {
  const profile = readProfileDB();
  res.json({ success: true, data: profile });
});

// 6. Save User Profile to Database
app.post('/api/profile', (req, res) => {
  const profile = req.body;
  writeProfileDB(profile);
  res.json({ success: true, data: profile });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ==================== STATIC ASSETS & SPA FALLBACK ====================

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Scheduler Database & Application Server running on port ${PORT}`);
});
