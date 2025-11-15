// code/components/RaceViewer2D.tsx
'use client'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------------
   F1-GRADE TRACKS (NO OVERLAPS, CLEAN CORNERS)
------------------------------------------------------------------- */
const TRACK_GRAND_PRIX = `
M 80 230 L 60 200 Q 40 180 60 160 L 110 150 Q 140 145 150 120 L 155 90 Q 160 70 180 70 L 220 75 Q 245 80 245 105 L 240 135 Q 235 160 210 170 L 190 180 Q 170 190 170 210 L 175 235 Q 180 255 160 260 L 120 265 Q 95 270 80 250 Z
`;
const TRACK_TECHNICAL = `
M 70 240 L 50 210 Q 40 190 55 175 L 90 160 Q 115 150 110 130 L 95 100 Q 85 80 105 65 L 135 50 Q 160 40 185 55 L 215 75 Q 235 90 230 115 L 220 145 Q 210 170 230 190 L 250 210 Q 265 225 250 240 L 220 255 Q 190 270 160 265 L 130 260 Q 95 255 70 240 Z
`;
const TRACK_HIGH_SPEED = `
M 60 230 L 50 190 Q 45 165 70 150 L 130 130 Q 160 120 180 100 L 205 75 Q 220 60 240 70 L 255 90 Q 270 110 260 130 L 240 160 Q 230 175 235 195 L 245 230 Q 250 250 230 260 L 190 270 Q 160 275 130 270 L 95 265 Q 70 260 60 230 Z
`;
const TRACK_CITY = `
M 90 250 L 70 225 Q 55 205 70 185 L 95 165 Q 115 150 105 130 L 90 105 Q 80 85 95 70 L 125 55 Q 150 45 175 60 L 200 80 Q 220 95 220 120 L 215 150 Q 210 175 230 195 L 255 215 Q 270 230 250 250 L 215 265 Q 185 275 155 270 L 125 265 Q 105 260 90 250 Z
`;
const TRACK_GP_NATIONAL = `
M 85 240 L 65 210 Q 50 185 75 170 L 120 150 Q 150 140 150 115 L 150 90 Q 150 70 170 65 L 210 60 Q 235 60 245 85 L 250 115 Q 255 140 235 155 L 205 170 Q 185 180 190 205 L 195 235 Q 200 255 180 265 L 140 270 Q 110 275 95 260 L 85 240 Z
`;

/* Track registry */
type TrackName = 'grandPrix' | 'technical' | 'highSpeed' | 'cityCircuit' | 'gpNational';
const TRACKS: Record<TrackName, string> = {
  grandPrix: TRACK_GRAND_PRIX,
  technical: TRACK_TECHNICAL,
  highSpeed: TRACK_HIGH_SPEED,
  cityCircuit: TRACK_CITY,
  gpNational: TRACK_GP_NATIONAL,
};

/**
 * Map backend names to frontend track components
 */
const TRACK_MAP: Record<string, TrackName> = {
  monaco: 'cityCircuit',
  silverstone: 'grandPrix',
  monza: 'highSpeed',
  spa: 'gpNational',
  suzuka: 'technical',
  default: 'grandPrix',
};

/* evenly spaced tick markers */
const TICK_COUNT = 28;
const TICK_POINTS = Array.from({ length: TICK_COUNT }, (_, i) => (i + 0.5) / TICK_COUNT);

// --- TYPES ---
interface Racer {
  id: number;
  name: string;
  distance: number;
  speed: number;
  rank: number;
  lapsCompleted: number;
  state: string;
  dnf: boolean;
  finished: boolean;
  [key: string]: any;
}

interface RaceConfig {
  track: string;
  condition: string;
  laps: number;
}

interface RaceViewerProps {
  leaderboard: Racer[];
  raceConfig: RaceConfig | null;
}

// From engine.js
const LAP_LENGTH = 1000;

/* ------------------------------------------------------------------
   CAR COMPONENT (From user's new logic)
   Manages its own motion value and animation
------------------------------------------------------------------- */
const RacerCar = ({
  racer,
  getPathPoint,
  pathLength,
  rankColor,
  label, // <-- Added label prop
}: any) => {
  // Motion value for this specific car's progress
  const carProgress = useMotionValue(0);

  // Animate to new position when racer.distance changes
  useEffect(() => {
    if (!pathLength) return;

    // Calculate progress on the *current lap*
    const lapProgress = (racer.distance % LAP_LENGTH) / LAP_LENGTH;

    // Smoothly animate the motion value to the new progress
    animate(carProgress, lapProgress, {
      duration: 1.0, // Match the 1s tick rate
      ease: 'linear', // Use linear for smooth, consistent movement
    });
  }, [racer.distance, pathLength, carProgress]);

  // Transform progress (0-1) into an {x, y} point on the SVG path
  const point = useTransform(carProgress, (t) => {
    if (!pathLength) return { x: 0, y: 0 };
    // t is 0-1, so multiply by pathLength
    const p = getPathPoint(t * pathLength);
    return { x: p.x - 5, y: p.y - 5 };
  });

  const x = useTransform(point, (p) => p.x);
  const y = useTransform(point, (p) => p.y);

  // DNF check is handled by the parent component's filter

  return (
    // zIndex stacks P1 on top
    <motion.g style={{ x, y, zIndex: 100 - racer.rank }}>
      <circle r="6" fill={rankColor} stroke="white" strokeWidth="1.4" />
      <text
        x="10"
        y="4"
        fill="white"
        stroke="black"
        strokeWidth="0.35"
        fontSize="9"
        style={{ textShadow: "0 0 2px black" }}
      >
        {label} {/* <-- Use the label prop */}
      </text>
    </motion.g>
  );
};


/* ------------------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------------------- */
export default function RaceViewer2D({ leaderboard, raceConfig }: RaceViewerProps) {
  const [selectedTrack, setSelectedTrack] = useState<TrackName>('grandPrix');

  const pathRef = useRef<SVGPathElement | null>(null);
  const [pathLength, setPathLength] = useState(0);

  // Sync track to live race config
  useEffect(() => {
    if (raceConfig && raceConfig.track) {
      const trackName = TRACK_MAP[raceConfig.track] || TRACK_MAP.default;
      setSelectedTrack(trackName);
    }
  }, [raceConfig]);

  // Calculate path length when the track changes
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [selectedTrack]);

  /* This function now matches the one from your new file.
    It takes a distance (length) and returns a point.
  */
  const getPathPoint = (dist: number) => {
    if (!pathRef.current) return { x: 0, y: 0 };
    return pathRef.current.getPointAtLength(dist);
  };


  return (
    // Removed the outer flex container, the select is gone
    <div className="relative w-full h-[500px] flex items-center justify-center">
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <path
          ref={pathRef}
          d={TRACKS[selectedTrack]}
          fill="none"
          stroke="#555"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

   

        {/* --- Render REAL Racers --- */}
        {pathLength > 0 && leaderboard
          .filter(racer => !racer.dnf) // Filter out DNF racers
          .map((racer) => {
            
            // Set colors for P1, P2, P3, and others
            const color =
              racer.rank === 1 ? '#dc2626' : // P1 Red
              racer.rank === 2 ? '#f59e0b' : // P2 Orange
              racer.rank === 3 ? '#9ca3af' : // P3 Silver
              '#6b7280'; // Others Gray

            // Show 'PIT' if in pits, otherwise show first 3 letters of name.
            const label =
              racer.state.includes('pit') ? 'PIT' :
              racer.name.substring(0, 3).toUpperCase();

            return (
              <RacerCar
                key={racer.id}
                racer={racer}
                getPathPoint={getPathPoint}
                pathLength={pathLength}
                rankColor={color}
                label={label}
              />
            );
          })}
      </svg>
    </div>
  );
}