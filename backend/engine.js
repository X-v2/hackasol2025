// raceEngine.js
/**
 * Full Race Engine (MVP logic-fixed)
 *
 * Exports: startRace(io, contract, opts = {})
 *
 * Fixes (MVP-critical logic):
 *  - Convert BigNumber/contract values to JS numbers defensively
 *  - Crash check occurs BEFORE movement (no post-move crash awarding)
 *  - Do NOT sort `racers` while iterating: safety-car bunching deferred until after loop
 *  - Recoverable crash -> pit uses pitReason = 'repair' (no contradictory crashed+inPit)
 *  - Safety car counts only on-track crashes (state === 'crashed_on_track')
 *  - Use `if` for lap detection (avoid multi-lap award within 1 tick)
 *  - Preserve tyre wear penalty for crash-caused repairs (don't reset on pit_out if repair)
 *  - Handle all-DNF with explicit 'race_abandoned' event
 */

export const TICK_MS = 800; // 0.5s
export const LAPS = 10;
export const LAP_LENGTH = 1000;
export const TICKS_PER_LAP = Math.round((5000) / TICK_MS); // kept but optional
export const NUM_RACERS = 20;

export const FIA_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

const CONDITION_MOD = { dry: 1.0, slightly_wet: 1.25, wet: 1.6 };

const TRACKS = {
    monaco: [0.02, 0.05, 0.12, 0.18, 0.25, 0.3, 0.28, 0.22, 0.18, 0.15, 0.14, 0.12, 0.2, 0.25, 0.3, 0.22, 0.15, 0.1, 0.08, 0.04],
    silverstone: [0.04, 0.06, 0.08, 0.12, 0.15, 0.2, 0.18, 0.25, 0.22, 0.18, 0.12, 0.1, 0.08, 0.07, 0.06, 0.08, 0.1, 0.12, 0.09, 0.05],
    monza: [0.01, 0.02, 0.03, 0.02, 0.04, 0.03, 0.02, 0.03, 0.02, 0.01, 0.02, 0.03, 0.02, 0.04, 0.03, 0.02, 0.01, 0.02, 0.03, 0.01],
    spa: [0.03, 0.05, 0.1, 0.18, 0.22, 0.28, 0.25, 0.18, 0.14, 0.12, 0.15, 0.2, 0.26, 0.18, 0.14, 0.12, 0.1, 0.08, 0.06, 0.04],
    suzuka: [0.04, 0.07, 0.12, 0.15, 0.2, 0.18, 0.16, 0.2, 0.18, 0.14, 0.12, 0.1, 0.08, 0.1, 0.12, 0.14, 0.1, 0.08, 0.06, 0.05]
};
export const TRACK_LIST = Object.keys(TRACKS);

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function rand(min, max) { return min + Math.random() * (max - min); }
function randInt(min, max) { return Math.floor(min + Math.random() * (max - min + 1)); }
function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }

// PIT
const PIT_THRESHOLD = 85;
const PIT_ENTRY_TICKS = 4;
const PIT_STOP_TICKS = 6;
const PIT_ENTRY_SLOWDOWN = 0.35;

// CRASH / SAFETY
const BASE_CRASH = 0.0002;
const NEIGHBOR_DISTANCE = 20;
const SAFETY_CAR_TRIGGER = 2;
const SAFETY_CAR_MIN_TICKS = 8;
const SAFETY_CAR_MAX_TICKS = 14;

function toNumberSafe(v) {
    // If it's a BigNumber-like (ethers), convert safely.
    try {
        if (v === undefined || v === null) return NaN;
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
            const n = Number(v);
            return Number.isFinite(n) ? n : NaN;
        }
        if (typeof v === 'object' && typeof v.toNumber === 'function') {
            return v.toNumber();
        }
        if (typeof v === 'object' && typeof v.toString === 'function') {
            const s = v.toString();
            const n = Number(s);
            return Number.isFinite(n) ? n : NaN;
        }
        return NaN;
    } catch (e) {
        return NaN;
    }
}

/**
 * startRace(io, contract, opts)
 * opts: { track?: string, condition?: 'dry'|'slightly_wet'|'wet' }
 */
export async function startRace(io, contract, opts = {}) {
    const track = (opts.track && TRACKS[opts.track]) ? opts.track : 'monaco';
    const condition = opts.condition ?? 'dry';
    const trackArray = TRACKS[track];
    const trackBuckets = trackArray.length;

    // ---------- Fetch Racers from Contract ----------
    io.emit('race_event', { type: 'race_starting', message: 'fetching racers...' });
    let templates = [];
    try {
        console.log("Fetching racers from contract...");
        const ids = await contract.getAllRacerIds();
        for (const idBN of ids) {
            const id = toNumberSafe(idBN);
            const r = await contract.getRacer(id);

            // Defensive extraction and clamping
            const rawBaseSpeed = toNumberSafe(r[3]);
            const rawAgg = toNumberSafe(r[4]);
            const rawHandling = toNumberSafe(r[6]);
            const rawTyreMgmt = toNumberSafe(r[7]);
            const rawPrice = (() => {
                try { return parseFloat(r[8].toString()); } catch (e) { return NaN; }
            })();

            const baseSpeed = Number.isFinite(rawBaseSpeed) ? rawBaseSpeed : 50;
            const aggression = Number.isFinite(rawAgg) ? clamp(rawAgg, 0, 100) : 50;
            const handling = Number.isFinite(rawHandling) ? clamp(rawHandling, 0, 100) : 50;
            const tyreManagement = Number.isFinite(rawTyreMgmt) ? clamp(rawTyreMgmt, 0, 100) : 50;
            const price = Number.isFinite(rawPrice) ? rawPrice : 1.0;

            // name defensively
            let name = r[2];
            if (typeof name !== 'string') {
                try { name = name.toString(); } catch (e) { name = `Racer#${id}`; }
            }

            templates.push({
                id: id,
                name,
                baseSpeed,
                aggression,
                handling,
                tyreManagement,
                price: Math.round(price * 100) / 100,
                favourite_tracks: shuffle(TRACK_LIST.slice()),
                favourable_conditions: shuffle(['dry', 'slightly_wet', 'wet'])
            });
        }
        io.emit('race_event', { type: 'fetch_ok', message: `fetched ${templates.length} racers` });
    } catch (err) {
        console.error("Failed to fetch racers from contract:", err);
        io.emit('race_event', { type: 'race_error', message: 'Failed to fetch racers from contract.' });
        return;
    }

    if (templates.length === 0) {
        io.emit('race_event', { type: 'race_error', message: 'No racers found in contract.' });
        return;
    }

    // runtime state (use explicit 'state' field, minimal)
    // states: 'on_track', 'pit_entry', 'in_pit', 'crashed_on_track', 'dnf', 'finished'
    const racers = templates.map(t => ({
        ...t,
        distance: 0,
        speed: 0,
        rank: 0,
        state: 'on_track',
        tyreWear: 0,
        pitEntryTicks: 0,
        pitTicksLeft: 0,
        pitReason: null, // 'wear' | 'repair' | null
        lapsCompleted: 0,
        currentLapMs: 0,
        bestLapMs: null,
        provisionalPoints: 0,
        finished: false,
        dnf: false
    }));

    let tick = 0;
    let safetyCar = false;
    let safetyCarTicksLeft = 0;
    let lastLeader = -1;

    io.emit('race_event', { type: 'race_start', track, condition, laps: LAPS, tickMs: TICK_MS });
    await new Promise((resolve) => {
        const interval = setInterval(() => {
            tick++;
            let doBunching = false;


            // handle safety car countdown
            if (safetyCar) {
                safetyCarTicksLeft--;
                if (safetyCarTicksLeft <= 0) {
                    safetyCar = false;
                    io.emit('race_event', { type: 'safety_car_end', tick });
                }
            }

            // PER-RACER SIMULATION (no sorting / mutating racers array here)
            for (const r of racers) {
                // skip DNF/finished
                if (r.dnf || r.finished) continue;

                // ---------- PIT ENTRY PHASE ----------
                if (r.state === 'pit_entry') {
                    // slow down but still move a tiny bit (pit approach)
                    r.speed = Math.max(5, Math.round(r.baseSpeed * PIT_ENTRY_SLOWDOWN));
                    r.distance += r.speed * 0.05;
                    r.pitEntryTicks--;
                    r.currentLapMs += Math.round(TICK_MS * 0.4);
                    if (r.pitEntryTicks <= 0) {
                        r.state = 'in_pit';
                        r.pitTicksLeft = PIT_STOP_TICKS;
                        io.emit('race_event', { type: 'pit_in', racerId: r.id, tick, pitTicks: r.pitTicksLeft, reason: r.pitReason });
                    }
                    continue;
                }

                // ---------- IN PIT ----------
                if (r.state === 'in_pit') {
                    r.speed = 0;
                    r.pitTicksLeft--;
                    // pit stall time counts toward lap time (we keep it consistent)
                    r.currentLapMs += TICK_MS;
                    if (r.pitTicksLeft <= 0) {
                        // If pit was for tyre wear -> fully reset tyre wear
                        if (r.pitReason === 'wear') {
                            r.tyreWear = 0;
                        }
                        // If pit was a repair, keep tyreWear (so crash tyre penalty persists)
                        if (r.state === 'in_pit') {
                            // exit pit
                            r.state = 'on_track';
                            // If this was a repair that had set DNF earlier, ensure dnf false only if applicable
                            // (we assume repair doesn't change dnf)
                            io.emit('race_event', { type: 'pit_out', racerId: r.id, tick, tyreWear: Math.round(r.tyreWear * 100) / 100, reason: r.pitReason });
                            r.pitReason = null;
                        }
                    }
                    continue;
                }

                // ---------- Crashed but not in pit (on-track) ----------
                if (r.state === 'crashed_on_track') {
                    // stand still and attempt recovery
                    r.speed = 0;
                    // 35% chance to recover each tick (original logic)
                    if (Math.random() < 0.35) {
                        r.state = 'on_track';
                        io.emit('race_event', { type: 'recovered', racerId: r.id, tick });
                    }
                    r.currentLapMs += TICK_MS;
                    continue;
                }

                // ---------- NORMAL: perform crash check FIRST ----------
                // compute crash probability:
                let crashProb = BASE_CRASH;
                const handlingFactor = (100 - r.handling) / 100; // 0..1
                const aggressionFactor = Math.max(0, (r.aggression - 50) / 100); // 0..0.5
                const tyreFactor = clamp(r.tyreWear / 200, 0, 1); // 0..1
                const normalized = ((r.distance % LAP_LENGTH) / LAP_LENGTH) || 0;
                const bucket = Math.min(trackBuckets - 1, Math.floor(normalized * trackBuckets));
                const cornerRisk = trackArray[bucket] ?? 0.1;
                const neighbors = racers.reduce((acc, other) => acc + ((other.id !== r.id && !other.dnf && Math.abs(other.distance - r.distance) < NEIGHBOR_DISTANCE) ? 1 : 0), 0);
                const neighborsFactor = Math.min(5, neighbors) / 10; // 0..0.5

                crashProb += handlingFactor * 0.012;
                crashProb += aggressionFactor * 0.012;
                crashProb += tyreFactor * 0.015;
                crashProb += cornerRisk * 0.03;
                crashProb += neighborsFactor * 0.005;

                // favourite track reduction
                const favIndex = r.favourite_tracks.indexOf(track);
                if (favIndex === 0) crashProb *= 0.78;
                else if (favIndex === 1) crashProb *= 0.88;

                // favourable condition reduction
                const condIndex = r.favourable_conditions.indexOf(condition);
                if (condIndex === 0) crashProb *= 0.85;

                crashProb *= CONDITION_MOD[condition];
                crashProb *= (1 + rand(-0.05, 0.05));
                crashProb = clamp(crashProb, 0, 0.5);

                // Only attempt crash when not under safetyCar (per original logic)
                const willCrashThisTick = (!safetyCar && Math.random() < crashProb);

                if (willCrashThisTick) {
                    const severity = Math.random();
                    if (severity < 0.12) {
                        // severe -> DNF (on track)
                        r.dnf = true;
                        r.state = 'dnf';
                        r.speed = 0;
                        r.tyreWear = clamp(r.tyreWear + 30, 0, 200);
                        r.price = Math.round(r.price * 0.5 * 100) / 100;
                        io.emit('race_event', { type: 'crash_dnf', racerId: r.id, tick, crashProb });
                    } else if (severity < 0.5) {
                        // recoverable -> send to pit for repair
                        // set pitReason = 'repair' so pit_out does not reset tyreWear
                        r.pitReason = 'repair';
                        r.state = 'pit_entry';
                        r.pitEntryTicks = PIT_ENTRY_TICKS;
                        // give some pit stall ticks when they enter
                        r.pitTicksLeft = Math.max(4, Math.round(rand(4, 8)));
                        // increase tyre wear as penalty (persist through pit_out if repair)
                        r.tyreWear = clamp(r.tyreWear + rand(6, 20), 0, 200);
                        r.speed = 0;
                        io.emit('race_event', { type: 'crash_pit', racerId: r.id, tick, pitTicks: r.pitTicksLeft });
                    } else {
                        // minor -> stopped on track, recoverable later
                        r.state = 'crashed_on_track';
                        r.speed = 0;
                        r.tyreWear = clamp(r.tyreWear + 12, 0, 200);
                        r.price = Math.round(r.price * 0.9 * 100) / 100;
                        io.emit('race_event', { type: 'crash_minor', racerId: r.id, tick });
                    }

                    // Safety car trigger: count ON-TRACK crashes that are not DNF
                    const activeCrashes = racers.filter(rr => rr.state === 'crashed_on_track' && !rr.dnf).length;
                    if (activeCrashes >= SAFETY_CAR_TRIGGER && !safetyCar) {
                        safetyCar = true;
                        safetyCarTicksLeft = Math.max(SAFETY_CAR_MIN_TICKS, Math.round(rand(SAFETY_CAR_MIN_TICKS, SAFETY_CAR_MAX_TICKS)));
                        doBunching = true; // defer bunching until after per-racer loop
                        io.emit('race_event', { type: 'safety_car', tick, duration: safetyCarTicksLeft });
                    }

                    // After handling crash for this tick, skip movement for this racer (they are stopped)
                    r.currentLapMs += TICK_MS;
                    continue;
                }

                // ---------- NORMAL MOVEMENT (no crash) ----------
                // speed calculation
                let speed = r.baseSpeed * (0.6 + (r.aggression / 250));
                speed -= r.tyreWear * 0.12;
                if (safetyCar) speed *= 0.45;
                speed += rand(-2, 3);
                r.speed = Math.max(5, Math.round(speed));

                // advance distance
                r.distance += r.speed * 0.12;

                // Only accumulate lap timer when on track (not in pit / pit_entry / crashed_on_track)
                r.currentLapMs += TICK_MS;

                // ---------- SINGLE-LAP detection (if) ----------
                const nextLapBoundary = (r.lapsCompleted + 1) * LAP_LENGTH;
                if (r.distance >= nextLapBoundary && r.lapsCompleted < LAPS) {
                    r.lapsCompleted++;

                    // record best lap
                    if (r.bestLapMs === null || r.currentLapMs < r.bestLapMs) {
                        r.bestLapMs = r.currentLapMs;
                        r.price = Math.round(r.price * 1.01 * 100) / 100;
                        io.emit('race_event', { type: 'fastest_lap_new', racerId: r.id, lapMs: r.currentLapMs, tick });
                    }

                    io.emit('race_event', { type: 'lap_complete', racerId: r.id, lap: r.lapsCompleted, lapMs: r.currentLapMs, tick });
                    r.currentLapMs = 0;

                    if (r.lapsCompleted >= LAPS) {
                        r.finished = true;
                        r.state = 'finished';
                        // finished racers stop being processed further

                        r.distance = LAPS * LAP_LENGTH;
                    }
                }

                // ---------- Tyre wear accrual ----------
                const wearInc = 0.25 + (r.aggression / 300) - (r.tyreManagement / 600);
                r.tyreWear = clamp(r.tyreWear + wearInc + rand(0, 0.15), 0, 200);

                // ---------- Pit decision from tyre wear ----------
                if (r.state === 'on_track' && r.tyreWear >= PIT_THRESHOLD) {
                    r.pitReason = 'wear';
                    r.state = 'pit_entry';
                    r.pitEntryTicks = PIT_ENTRY_TICKS;
                    io.emit('race_event', { type: 'pit_planned', racerId: r.id, tick, tyreWear: Math.round(r.tyreWear) });
                }

            } // end per-racer loop

            // Do deferred safety-car bunching AFTER the per-racer loop (no mid-loop sort)
            if (doBunching) {
                // bunching: sort by distance then compress spacing behind leader
                racers.sort((a, b) => b.distance - a.distance);
                for (let i = 1; i < racers.length; i++) {
                    racers[i].distance = Math.max(0, racers[i - 1].distance - rand(2, 6));
                }
            }

            // compute ranks & provisional points
            racers.sort((a, b) => b.distance - a.distance);
            racers.forEach((r, idx) => r.rank = idx + 1);
            racers.forEach(r => r.provisionalPoints = FIA_POINTS[r.rank - 1] || 0);

            // leader change
            if (racers[0] && racers[0].id !== lastLeader) {
                lastLeader = racers[0].id;
                io.emit('race_event', { type: 'lead_change', newLeader: lastLeader, tick });
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
                    state: r.state,
                    pitEntryTicks: r.pitEntryTicks,
                    inPit: r.state === 'in_pit',
                    pitTicksLeft: r.pitTicksLeft,
                    pitReason: r.pitReason,
                    crashed: r.state === 'crashed_on_track',
                    dnf: r.dnf,
                    finished: r.finished,
                    price: Math.round(r.price * 100) / 100,
                    provisionalPoints: r.provisionalPoints,
                    bestLapMs: r.bestLapMs
                }))
            });

            // Finish condition handling
            const activeRacers = racers.filter(r => !r.dnf && !r.finished);
            // If all racers are DNF or none active:
            const aliveCount = racers.filter(r => !r.dnf).length;
            if (aliveCount === 0) {
                clearInterval(interval);
                io.emit('race_event', { type: 'race_abandoned', tick, message: 'All racers DNF - race abandoned' });
                // Provide final DNF list
                io.emit('race_finished', {
                    tick,
                    racers: racers.map(r => ({
                        id: r.id,
                        name: r.name,
                        rank: r.rank,
                        lapsCompleted: r.lapsCompleted,
                        dnf: r.dnf,
                        finalPoints: 0,
                        bestLapMs: r.bestLapMs,
                        price: Math.round(r.price * 100) / 100
                    }))
                });
                return;
            }

            // If every non-DNF racer has finished => race over
            const finishedCount = racers.filter(r => !r.dnf && r.finished).length;
            const nonDnfCount = racers.filter(r => !r.dnf).length;
            if (nonDnfCount > 0 && finishedCount >= nonDnfCount) {
                clearInterval(interval);

                // final ordering by distance
                racers.sort((a, b) => b.distance - a.distance);
                racers.forEach((r, idx) => {
                    r.rank = idx + 1;
                    r.finalPoints = FIA_POINTS[idx] || 0;
                });

                // fastest lap holder determination among those who set laps
                const validBest = racers.filter(r => r.bestLapMs !== null && !r.dnf);
                let fastest = null;
                for (const rr of validBest) {
                    if (!fastest || rr.bestLapMs < fastest.bestLapMs) fastest = rr;
                }
                if (fastest) {
                    const finIdx = racers.findIndex(r => r.id === fastest.id);
                    // award +1 only if finished and in top10
                    if (finIdx >= 0 && finIdx < 10 && racers[finIdx].finished && !racers[finIdx].dnf) {
                        racers[finIdx].finalPoints = (racers[finIdx].finalPoints || 0) + 1;
                    }
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
                        distance: r.distance,
                        tyre: r.tyre,
                        finalPoints: r.finalPoints || 0,
                        bestLapMs: r.bestLapMs,
                        price: Math.round(r.price * 100) / 100
                    }))
                });

                io.emit('race_event', { type: 'race_end', tick });
                resolve();
                return;
            }

        }, TICK_MS);
    });
}
