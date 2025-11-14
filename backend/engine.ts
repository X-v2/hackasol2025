// engine.ts
import { Server } from "socket.io";

/**
 * Full Race Engine
 * - 20 racers (2025 driver names)
 * - 5 tracks (arrays of corner risk buckets)
 * - track conditions (dry/slightly_wet/wet)
 * - lap-based: 10 laps, ~5s per lap (tick = 500ms)
 * - pit stops with entry slowdown + stopped stall
 * - crash model: DNF / pit-recoverable / minor
 * - safety car deployment on multiple severe crashes
 * - provisional points each tick
 * - final points and fastest-lap bonus
 *
 * Use:
 * startRace(io, { track: 'monaco', condition: 'dry' })
 */

// -------------------- CONFIG --------------------
export const TICK_MS = 500; // 0.5s
export const LAPS = 10;
export const LAP_LENGTH = 1000; // arbitrary distance units per lap
export const TICKS_PER_LAP = Math.round((5000) / TICK_MS); // 5s per lap / tick ms => 10
export const NUM_RACERS = 20;

export const FIA_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

type Condition = 'dry' | 'slightly_wet' | 'wet';
const CONDITION_MOD: Record<Condition, number> = { dry: 1.0, slightly_wet: 1.25, wet: 1.6 };

// -------------------- TRACKS (corner risk arrays) --------------------
const TRACKS: Record<string, number[]> = {
  // arrays of 20 buckets (0..1) showing corner/crash risk intensity
  monaco:    [0.02,0.05,0.12,0.18,0.25,0.3,0.28,0.22,0.18,0.15,0.14,0.12,0.2,0.25,0.3,0.22,0.15,0.1,0.08,0.04],
  silverstone: [0.04,0.06,0.08,0.12,0.15,0.2,0.18,0.25,0.22,0.18,0.12,0.1,0.08,0.07,0.06,0.08,0.1,0.12,0.09,0.05],
  monza:     [0.01,0.02,0.03,0.02,0.04,0.03,0.02,0.03,0.02,0.01,0.02,0.03,0.02,0.04,0.03,0.02,0.01,0.02,0.03,0.01],
  spa:       [0.03,0.05,0.1,0.18,0.22,0.28,0.25,0.18,0.14,0.12,0.15,0.2,0.26,0.18,0.14,0.12,0.1,0.08,0.06,0.04],
  suzuka:    [0.04,0.07,0.12,0.15,0.2,0.18,0.16,0.2,0.18,0.14,0.12,0.1,0.08,0.1,0.12,0.14,0.1,0.08,0.06,0.05]
};
export const TRACK_LIST = Object.keys(TRACKS);

// -------------------- DRIVER NAMES (2025 roster sample) --------------------
const DRIVER_NAMES = [
  "Max Verstappen","Lewis Hamilton","Charles Leclerc","George Russell",
  "Lando Norris","Oscar Piastri","Kimi Antonelli","Yuki Tsunoda",
  "Sergio Perez","Carlos Sainz","Fernando Alonso","Esteban Ocon",
  "Pierre Gasly","Kevin Magnussen","Nico Hulkenberg","Oliver Bearman",
  "Liam Lawson","Isack Hadjar","Gabriel Bortoleto","Franco Colapinto"
];

// -------------------- TYPES --------------------
type RacerTemplate = {
  id: number;
  name: string;
  handling: number;        // 0..100 higher -> less crash
  aggression: number;      // 0..100 higher -> faster but more crash-prone
  tyreManagement: number; // 0..100 higher -> slower tyre wear
  favourite_tracks: string[]; // priority list
  favourable_conditions: Condition[]; // priority
  baseSpeed: number;      // base speed factor
  price: number;
};

type RuntimeRacer = RacerTemplate & {
  distance: number;
  speed: number;
  rank: number;
  crashed: boolean; // True if in any crash state (minor, pit, DNF)
  dnf: boolean;
  tyreWear: number; // 0..200
  pitEntering: boolean;
  pitEntryTicks: number;
  inPit: boolean;
  pitTicksLeft: number;
  lapsCompleted: number;
  currentLapMs: number;
  bestLapMs: number | null;
  provisionalPoints: number;
  finalPoints?: number;
  finished: boolean; // True when lapsCompleted >= LAPS
};

// -------------------- HELPERS --------------------
function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }
function rand(min: number, max: number) { return min + Math.random() * (max - min); }
function shuffle<T>(arr: T[]) { for (let i = arr.length-1; i>0; i--){ const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }

// -------------------- MAKE TEMPLATES --------------------
function makeTemplates(): RacerTemplate[] {
  const templates: RacerTemplate[] = [];
  for (let i = 0; i < NUM_RACERS; i++) {
    const name = DRIVER_NAMES[i] ?? `Racer ${i+1}`;
    // tuned seeds for famous drivers (simple)
    const seedAggro = name.toLowerCase().includes('verstappen') ? 80 :
                      name.toLowerCase().includes('hamilton') ? 55 :
                      name.toLowerCase().includes('leclerc') ? 65 : 50;
    const seedHandling = name.toLowerCase().includes('hamilton') ? 92 :
                         name.toLowerCase().includes('verstappen') ? 90 :
                         name.toLowerCase().includes('leclerc') ? 88 : 78;

    const baseSpeed = clamp(110 + Math.random()*20 + (seedAggro - 50) * 0.12, 100, 140);
    const handling = clamp(seedHandling + Math.round(rand(-6,6)), 55, 98);
    const aggression = clamp(seedAggro + Math.round(rand(-10,10)), 30, 98);
    const tyreManagement = clamp(60 + Math.round(rand(-20,20)) - Math.floor(aggression/20), 30, 98);

    const favTracks = shuffle(TRACK_LIST.slice()); // randomized priority list
    const favConds: Condition[] = shuffle(['dry','slightly_wet','wet']);

    templates.push({
      id: i,
      name,
      handling,
      aggression,
      tyreManagement,
      favourite_tracks: favTracks,
      favourable_conditions: favConds,
      baseSpeed,
      price: 100
    });
  }
  return templates;
}
const TEMPLATES = makeTemplates();

// -------------------- PIT CONFIG --------------------
const PIT_THRESHOLD = 85;        // tyreWear threshold to trigger pit
const PIT_ENTRY_TICKS = 4;       // ticks of pit entry slowdown
const PIT_STOP_TICKS = 6;        // ticks stopped in pit stall
const PIT_ENTRY_SLOWDOWN = 0.35; // fraction of normal speed while entering

// -------------------- CRASH / SAFETY CONFIG --------------------
const BASE_CRASH = 0.002;        // base crash prob per tick
const NEIGHBOR_DISTANCE = 20;    // distance units to consider "nearby"
const SAFETY_CAR_TRIGGER = 2;    // number of active non-DNF crashes to deploy SC
const SAFETY_CAR_MIN_TICKS = 8;
const SAFETY_CAR_MAX_TICKS = 14;

// -------------------- ENGINE EXPORT --------------------
/**
 * startRace(io, opts)
 * opts: { track?: string, condition?: Condition }
 */
export function startRace(io: Server, opts: { track?: string; condition?: Condition } = {}) {
  const track = (opts.track && TRACKS[opts.track]) ? opts.track : 'monaco';
  const condition: Condition = opts.condition ?? 'dry';
  const trackArray = TRACKS[track];
  const trackBuckets = trackArray.length;

  // runtime state
  const racers: RuntimeRacer[] = TEMPLATES.map(t => ({
    ...t,
    distance: 0,
    speed: 0,
    rank: 0,
    crashed: false,
    dnf: false,
    tyreWear: 0,
    pitEntering: false,
    pitEntryTicks: 0,
    inPit: false,
    pitTicksLeft: 0,
    lapsCompleted: 0,
    currentLapMs: 0,
    bestLapMs: null,
    provisionalPoints: 0,
    finished: false
  }));

  let tick = 0;
  let safetyCar = false;
  let safetyCarTicksLeft = 0;
  let lastLeader = -1;

  io.emit('race_event', { type: 'race_start', track, condition, laps: LAPS, tickMs: TICK_MS });

  const interval = setInterval(() => {
    tick++;

    // handle safety car countdown
    if (safetyCar) {
      safetyCarTicksLeft--;
      if (safetyCarTicksLeft <= 0) {
        safetyCar = false;
        io.emit('race_event', { type: 'safety_car_end', tick });
      }
    }

    // Simulate each racer
    for (const r of racers) {
      if (r.dnf || r.finished) continue;

      // ---------- PIT ENTRY PHASE ----------
      if (r.pitEntering) {
        // slow down but still move a bit
        r.speed = Math.max(5, Math.round(r.baseSpeed * PIT_ENTRY_SLOWDOWN));
        // small movement while entering
        r.distance += r.speed * 0.05;
        r.pitEntryTicks--;
        if (r.pitEntryTicks <= 0) {
          r.pitEntering = false;
          r.inPit = true;
          r.pitTicksLeft = PIT_STOP_TICKS;
          io.emit('race_event', { type: 'pit_in', racerId: r.id, tick, pitTicks: r.pitTicksLeft });
        }
        // do not increment lap timer significantly while entering (count partial)
        r.currentLapMs += Math.round(TICK_MS * 0.4);
        continue;
      }

      // ---------- PIT STOP PHASE ----------
      if (r.inPit) {
        r.speed = 0;
        r.pitTicksLeft--;
        if (r.pitTicksLeft <= 0) {
          r.inPit = false;
          // reset tyre wear
          r.tyreWear = 0;
          // If in pit due to crash, clear crash state
          if (r.crashed) r.crashed = false;
          io.emit('race_event', { type: 'pit_out', racerId: r.id, tick, tyreWear: r.tyreWear });
        }
        // pit stall time counts towards race time but not lap progression
        r.currentLapMs += TICK_MS;
        continue;
      }

      // ---------- [FIX] CRASHED (MINOR) RECOVERY PHASE ----------
      // Handle racers who are in a 'minor crash' state (not DNF, not in Pit)
      if (r.crashed) {
        r.speed = 0; // Ensure speed is 0 while crashed
        
        // Check for recovery (using the 0.35 chance from the original 'minor' logic)
        if (Math.random() < 0.35) {
            r.crashed = false;
            io.emit('race_event', { type: 'recovered', racerId: r.id, tick: tick });
        }
        
        // Time still passes for the lap
        r.currentLapMs += TICK_MS;
        continue; // Skip normal movement, tyre wear, and new crash checks
      }

      // ---------- NORMAL MOVEMENT ----------
      // base speed influenced by aggression and tyre wear; cap when safety car active
      let speed = r.baseSpeed * (0.6 + (r.aggression / 250)); // minor aggression boost
      speed -= r.tyreWear * 0.12; // tyre penalty
      if (safetyCar) speed *= 0.45; // big slowdown under safety car
      // jitter
      speed += rand(-2, 3);
      r.speed = Math.max(5, Math.round(speed));

      // advance distance
      r.distance += r.speed * 0.12;

      // Only accumulate lap timer when on-track (not in pit entry/pit/crashed)
      r.currentLapMs += TICK_MS;

      // ---------- [FIX] Lap detection (distance-based only) ----------
      // Use 'while' to catch multiple lap-crossings in one tick (unlikely, but robust)
      while (r.distance >= (r.lapsCompleted + 1) * LAP_LENGTH) {
        if (r.finished) break; // Already finished, don't process more laps
        
        r.lapsCompleted++;

        // record best lap (ms)
        if (r.bestLapMs === null || r.currentLapMs < r.bestLapMs) {
          r.bestLapMs = r.currentLapMs;
          // [NEW] Add price bump for setting a new fastest lap
          r.price = Math.round(r.price * 1.01 * 100) / 100;
          io.emit('race_event', { type: 'fastest_lap_new', racerId: r.id, lapMs: r.currentLapMs, tick });
        }

        io.emit('race_event', { type: 'lap_complete', racerId: r.id, lap: r.lapsCompleted, lapMs: r.currentLapMs, tick });
        r.currentLapMs = 0; // Reset for next lap

        // Check if this lap was the finishing lap
        if (r.lapsCompleted >= LAPS) {
          r.finished = true;
          // Don't 'continue' or 'break' the main racer loop,
          // just stop processing more laps for this racer this tick
          break;
        }
      }

      // ---------- tyre wear accumulates ----------
      // tyreWear increases with aggression, and is mitigated by tyreManagement
      const wearInc = 0.25 + (r.aggression / 300) - (r.tyreManagement / 600);
      r.tyreWear = clamp(r.tyreWear + wearInc + rand(0, 0.15), 0, 200);

      // ---------- PIT DECISION (simple): only when tyreWear >= threshold ----------
      if (!r.pitEntering && !r.inPit && r.tyreWear >= PIT_THRESHOLD) {
        // trigger pit entry to simulate pit lane approach
        r.pitEntering = true;
        r.pitEntryTicks = PIT_ENTRY_TICKS;
        // announce
        io.emit('race_event', { type: 'pit_planned', racerId: r.id, tick, tyreWear: Math.round(r.tyreWear) });
      }

      // ---------- Crash model ----------
      // compute crash probability robustly:
      // base + handling factor + aggression + tyre + corner risk + neighbors + condition multiplier
      let crashProb = BASE_CRASH; // base per-tick
      const handlingFactor = (100 - r.handling) / 100; // 0..1
      const aggressionFactor = Math.max(0, (r.aggression - 50) / 100); // 0..0.48
      const tyreFactor = clamp(r.tyreWear / 200, 0, 1); // 0..1
      // determine corner risk bucket by lap-normalized position:
      // safe normalized = (distance % LAP_LENGTH) / LAP_LENGTH
      const normalized = ((r.distance % LAP_LENGTH) / LAP_LENGTH) || 0;
      const bucket = Math.min(trackBuckets - 1, Math.floor(normalized * trackBuckets));
      const cornerRisk = trackArray[bucket] ?? 0.1;
      // neighbors factor
      const neighbors = racers.reduce((acc, other) => acc + ((other.id !== r.id && !other.dnf && Math.abs(other.distance - r.distance) < NEIGHBOR_DISTANCE) ? 1 : 0), 0);
      const neighborsFactor = Math.min(5, neighbors) / 10; // 0..0.5
      crashProb += handlingFactor * 0.012;
      crashProb += aggressionFactor * 0.012;
      crashProb += tyreFactor * 0.015;
      crashProb += cornerRisk * 0.03;
      crashProb += neighborsFactor * 0.005;

      // favourite track reduces crash probability (if top in list)
      const favIndex = r.favourite_tracks.indexOf(track);
      if (favIndex === 0) crashProb *= 0.78;
      else if (favIndex === 1) crashProb *= 0.88;

      // favourable condition reduces crash probability
      const condIndex = r.favourable_conditions.indexOf(condition);
      if (condIndex === 0) crashProb *= 0.85;

      // global condition multiplier
      crashProb *= CONDITION_MOD[condition];

      // small noise
      crashProb *= (1 + rand(-0.05, 0.05));
      crashProb = clamp(crashProb, 0, 0.5);

      // only attempt crash if not in pit/pitEntry (we're on-track) and not safetyCar slowed to neutral
      if (!safetyCar && Math.random() < crashProb) {
        // severity roll
        const severity = Math.random();
        if (severity < 0.12) {
          // severe -> DNF
          r.dnf = true;
          r.crashed = true;
          r.speed = 0;
          r.tyreWear = clamp(r.tyreWear + 30, 0, 200);
          r.price = Math.round(r.price * 0.5 * 100) / 100;
          io.emit('race_event', { type: 'crash_dnf', racerId: r.id, tick, crashProb });
        } else if (severity < 0.5) {
          // recoverable -> pit
          r.crashed = true;
          r.pitEntering = false; // override if any
          r.inPit = true;
          r.pitTicksLeft = Math.max(4, Math.round(rand(4, 8)));
          r.speed = 0;
          io.emit('race_event', { type: 'crash_pit', racerId: r.id, tick, pitTicks: r.pitTicksLeft });
        } else {
          // [FIX] minor -> stop, will recover later
          r.crashed = true;
          r.speed = 0; // Set speed to 0
          r.tyreWear = clamp(r.tyreWear + 12, 0, 200);
          r.price = Math.round(r.price * 0.9 * 100) / 100;
          io.emit('race_event', { type: 'crash_minor', racerId: r.id, tick });
          // Recovery check is now handled at the start of the next tick
        }

        // check safety car trigger: count active crashes that are not DNF
        // Note: A 'minor' crash (r.crashed=true, r.dnf=false) counts
        const activeCrashes = racers.filter(rr => rr.crashed && !rr.dnf).length;
        if (activeCrashes >= SAFETY_CAR_TRIGGER && !safetyCar) {
          safetyCar = true;
          safetyCarTicksLeft = Math.max(SAFETY_CAR_MIN_TICKS, Math.round(rand(SAFETY_CAR_MIN_TICKS, SAFETY_CAR_MAX_TICKS)));
          io.emit('race_event', { type: 'safety_car', tick, duration: safetyCarTicksLeft });
          // bunching: compress distances (leader stays, rest pack closely)
          racers.sort((a,b)=>b.distance-a.distance);
          for (let i = 1; i < racers.length; i++) {
            racers[i].distance = Math.max(0, racers[i-1].distance - rand(2, 6));
          }
        }
      } // crash check end

    } // end per-racer loop

    // sort ranks
    racers.sort((a,b)=>b.distance - a.distance);
    racers.forEach((r, idx) => r.rank = idx + 1);

    // provisional points (live)
    racers.forEach(r => r.provisionalPoints = FIA_POINTS[r.rank - 1] || 0);

    // leader change
    if (racers[0].id !== lastLeader) {
      lastLeader = racers[0].id;
      io.emit('race_event', { type: 'lead_change', newLeader: lastLeader, tick });
      // leader price bump
      racers[0].price = Math.round(racers[0].price * 1.02 * 100) / 100;
    }

    // emit race_update
    io.emit('race_update', {
      tick,
      safetyCar,
      racers: racers.map(r => ({
        id: r.id,
        name: r.name,
        distance: Math.round(r.distance),
        speed: r.speed,
        rank: r.rank,
        lapsCompleted: r.lapsCompleted,
        tyreWear: Math.round(r.tyreWear * 100) / 100,
        pitEntering: r.pitEntering,
        pitEntryTicks: r.pitEntryTicks,
        inPit: r.inPit,
        pitTicksLeft: r.pitTicksLeft,
        crashed: r.crashed,
        dnf: r.dnf,
        finished: r.finished,
        price: Math.round(r.price * 100) / 100,
        provisionalPoints: r.provisionalPoints,
        bestLapMs: r.bestLapMs
      }))
    });

    // [FIX] check finish condition: all non-DNF racers finished
    const activeRacers = racers.filter(r => !r.dnf);
    const finishedCount = activeRacers.filter(r => r.finished).length;
    if (finishedCount >= activeRacers.length) {
      clearInterval(interval);

      // final ordering by distance
      racers.sort((a,b)=>b.distance-a.distance);
      racers.forEach((r, idx) => {
        r.rank = idx + 1;
        r.finalPoints = FIA_POINTS[idx] || 0;
      });

      // fastest lap calculation (min bestLapMs)
      const validBest = racers.filter(r => r.bestLapMs !== null);
      let fastest: RuntimeRacer | null = null;
      for (const r of validBest) {
        if (!fastest || (r.bestLapMs! < fastest.bestLapMs!)) fastest = r;
      }
      if (fastest) {
        const finIdx = racers.findIndex(r => r.id === fastest!.id);
        if (finIdx >= 0 && finIdx < 10) {
          // award +1 only if finished in top10
          racers[finIdx].finalPoints = (racers[finIdx].finalPoints || 0) + 1;
        }
        // [NEW] Add final price bump for fastest lap holder
        if (finIdx >= 0) {
            racers[finIdx].price = Math.round(racers[finIdx].price * 1.05 * 100) / 100;
        }
      }

      // emit final results
      io.emit('race_finished', {
        tick,
        racers: racers.map(r => ({
          id: r.id,
          name: r.name,
          rank: r.rank,
          lapsCompleted: r.lapsCompleted,
          dnf: r.dnf,
          finalPoints: r.finalPoints || 0,
          bestLapMs: r.bestLapMs,
          price: Math.round(r.price * 100) / 100
        }))
      });

      io.emit('race_event', { type: 'race_end', tick });
      return;
    }

  }, TICK_MS);
}