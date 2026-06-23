# Inspection Readiness — Live Team Challenge

A collaborative, real-time training game for an inspection-readiness workshop.
Attendees split into teams, then **drag action cards into the right phase**
(*Before Inspection* / *After Inspection*), **spot the trap cards** (bad
practices) and drop them in the **Wrong bin**, and **answer the two open-ended
inspector scenarios** (PV & RA). Teammates see each other's moves instantly. The
facilitator runs a big screen with a live leaderboard and a dramatic answer reveal.

![flow](https://img.shields.io/badge/stack-React%20%2B%20Socket.IO%20%2B%20Docker-6366f1)

## Run it

```bash
cd inspection-game
docker compose up --build
```

Then open **http://localhost:8080**

- **Players:** open the link → *Join a team* → enter a name → pick a team → start sorting.
- **Facilitator:** open the link → *Facilitator screen* → use **Start**, **Reveal**, **Reset**.

Run on a laptop/server on the same network and share `http://<that-machine-ip>:8080`
with the room (everyone needs to reach the same host).

## How the game works

| Zone | What goes there |
|------|-----------------|
| **Before Inspection** | Correct preparation actions |
| **After Inspection** | Correct response / CAPA actions |
| **Wrong / Bad practice** | The deliberate trap cards (e.g. "send CVs straight to the inspector") |

- 29 shuffled action cards (correct + traps mixed together).
- 2 open-ended **During inspection** scenarios (PV timeliness, RA safety variations) — teams type their answer; reviewed at the debrief.
- Scoring: **+10** per correctly placed card, **−3** per misplaced card. Hidden during play; revealed (with green/red flips + confetti) when the facilitator hits **Reveal**.

## Collaboration model

The Node + **Socket.IO** server is the real-time hub ("broker"). Each team is a
Socket.IO **room**; every move/scenario edit is broadcast to teammates and to the
facilitator screen within milliseconds. Server is the single source of truth, so
late joiners and reconnects get the current board automatically.

> **Why Socket.IO instead of MQTT?** For browser-to-browser collaboration it needs
> no extra broker container, handles rooms/reconnects/fallback natively, and is
> lower-latency for this use case. If you specifically want MQTT, swap the hub for
> an `eclipse-mosquitto` service in `docker-compose.yml` and use `mqtt.js` on the
> client — the event shapes (`move`, `scenario`, `team`) map 1:1 to topics.

## Project layout

```
inspection-game/
├─ docker-compose.yml
├─ Dockerfile              # multi-stage: build React → serve from Node
├─ server/                 # Express + Socket.IO real-time hub + game state
│  └─ src/{index.js,cards.js}
└─ client/                 # React + Vite + @dnd-kit + Framer Motion + confetti
   └─ src/{App.jsx, socket.js, components/*}
```

## Editing the cards

All card text and the answer key live in **`server/src/cards.js`**
(`CARDS`, `ZONES`, `SCENARIOS`, `TEAMS`). Change wording, add/remove cards, or add
teams there and rebuild.

## Local dev (without Docker)

```bash
# terminal 1
cd server && npm install && PORT=8080 npm start
# terminal 2
cd client && npm install && npm run dev   # http://localhost:5173 (proxies sockets to :8080)
```
