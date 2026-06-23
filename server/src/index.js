import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { CARDS, ZONES, SCENARIOS, TEAMS } from './cards.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ---------------- Game state (in memory) ----------------
const POINTS_CORRECT = 10;
const POINTS_WRONG = -3;

function freshTeam(meta) {
  return {
    id: meta.id,
    name: meta.name,
    color: meta.color,
    members: {},                 // socketId -> username
    placements: {},              // cardId -> zoneId
    scenarios: { pv: '', ra: '' },
    lastActorByCard: {},         // cardId -> username (who moved it last)
  };
}

const game = {
  phase: 'lobby',                // lobby | playing | revealed
  startedAt: null,
  teams: Object.fromEntries(TEAMS.map((t) => [t.id, freshTeam(t)])),
};

const CARD_ANSWER = Object.fromEntries(CARDS.map((c) => [c.id, c.correctZone]));

function teamScore(team) {
  let score = 0;
  let correct = 0;
  for (const [cardId, zone] of Object.entries(team.placements)) {
    if (CARD_ANSWER[cardId] === zone) { score += POINTS_CORRECT; correct += 1; }
    else { score += POINTS_WRONG; }
  }
  return { score, correct, placed: Object.keys(team.placements).length };
}

// What players see while playing (NO correctness leaked).
function publicTeam(team) {
  const { score, correct, placed } = teamScore(team);
  return {
    id: team.id,
    name: team.name,
    color: team.color,
    members: Object.values(team.members),
    placements: team.placements,
    scenarios: team.scenarios,
    lastActorByCard: team.lastActorByCard,
    progress: placed,
    // score & correctness only exposed once revealed
    score: game.phase === 'revealed' ? score : null,
    correctCount: game.phase === 'revealed' ? correct : null,
  };
}

function leaderboard() {
  return Object.values(game.teams)
    .map((t) => {
      const s = teamScore(t);
      return {
        id: t.id, name: t.name, color: t.color,
        members: Object.values(t.members),
        progress: s.placed,
        totalCards: CARDS.length,
        score: game.phase === 'revealed' ? s.score : null,
        correct: game.phase === 'revealed' ? s.correct : null,
      };
    })
    .sort((a, b) => (b.score ?? b.progress) - (a.score ?? a.progress));
}

function answerKey() {
  // Only sent on reveal.
  return Object.fromEntries(CARDS.map((c) => [c.id, c.correctZone]));
}

function broadcastTeam(teamId) {
  io.to(`team:${teamId}`).emit('team', publicTeam(game.teams[teamId]));
  broadcastFacilitator();
}

function broadcastFacilitator() {
  io.to('facilitator').emit('facilitator', {
    phase: game.phase,
    startedAt: game.startedAt,
    leaderboard: leaderboard(),
    teams: Object.values(game.teams).map(publicTeam),
    answerKey: game.phase === 'revealed' ? answerKey() : null,
  });
}

function broadcastPhase() {
  io.emit('phase', { phase: game.phase, startedAt: game.startedAt });
  if (game.phase === 'revealed') io.emit('answerKey', answerKey());
  broadcastFacilitator();
}

// ---------------- Socket handlers ----------------
io.on('connection', (socket) => {
  // Send static config immediately.
  socket.emit('config', { cards: CARDS, zones: ZONES, scenarios: SCENARIOS, teams: TEAMS });
  socket.emit('phase', { phase: game.phase, startedAt: game.startedAt });
  if (game.phase === 'revealed') socket.emit('answerKey', answerKey());

  socket.on('joinTeam', ({ username, teamId }) => {
    const team = game.teams[teamId];
    if (!team || !username) return;
    socket.data.username = username;
    socket.data.teamId = teamId;
    socket.join(`team:${teamId}`);
    team.members[socket.id] = username;
    socket.emit('team', publicTeam(team));
    broadcastTeam(teamId);
  });

  socket.on('joinFacilitator', () => {
    socket.data.facilitator = true;
    socket.join('facilitator');
    broadcastFacilitator();
  });

  socket.on('move', ({ cardId, zone }) => {
    const teamId = socket.data.teamId;
    const team = game.teams[teamId];
    if (!team || game.phase === 'revealed') return;
    if (!CARD_ANSWER[cardId]) return;
    if (zone === null || zone === 'tray') {
      delete team.placements[cardId];
      delete team.lastActorByCard[cardId];
    } else {
      team.placements[cardId] = zone;
      team.lastActorByCard[cardId] = socket.data.username || '?';
    }
    broadcastTeam(teamId);
  });

  socket.on('scenario', ({ which, text }) => {
    const team = game.teams[socket.data.teamId];
    if (!team || game.phase === 'revealed') return;
    if (which === 'pv' || which === 'ra') {
      team.scenarios[which] = String(text || '').slice(0, 4000);
      broadcastTeam(socket.data.teamId);
    }
  });

  // ---- Facilitator controls ----
  socket.on('control', ({ action }) => {
    if (!socket.data.facilitator) return;
    if (action === 'start') { game.phase = 'playing'; game.startedAt = Date.now(); }
    if (action === 'reveal') { game.phase = 'revealed'; }
    if (action === 'reset') {
      game.phase = 'lobby';
      game.startedAt = null;
      for (const t of Object.values(game.teams)) {
        t.placements = {};
        t.scenarios = { pv: '', ra: '' };
        t.lastActorByCard = {};
      }
    }
    broadcastPhase();
    for (const id of Object.keys(game.teams)) broadcastTeam(id);
  });

  socket.on('disconnect', () => {
    const teamId = socket.data.teamId;
    if (teamId && game.teams[teamId]) {
      delete game.teams[teamId].members[socket.id];
      broadcastTeam(teamId);
    }
    if (socket.data.facilitator) broadcastFacilitator();
  });
});

// ---------------- Health probes (for Kubernetes) ----------------
app.get('/healthz', (_req, res) => res.status(200).send('ok'));
app.get('/readyz', (_req, res) => res.status(200).send('ok'));

// ---------------- Serve built client ----------------
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));
app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));

server.listen(PORT, () => console.log(`Inspection game on :${PORT}`));
