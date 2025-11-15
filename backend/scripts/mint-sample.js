// --- Helper functions (Copied 1:1 from your backend/engine.ts) ---
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function rand(min, max) { return min + Math.random() * (max - min); }
function shuffle(arr) { for (let i = arr.length-1; i>0; i--){ const j = Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }

// --- Driver names (Copied 1:1 from your backend/engine.ts) ---
const DRIVER_NAMES = [
  "Max Verstappen","Lewis Hamilton","Charles Leclerc","George Russell",
  "Lando Norris","Oscar Piastri","Kimi Antonelli","Yuki Tsunoda",
  "Sergio Perez","Carlos Sainz","Fernando Alonso","Esteban Ocon",
  "Pierre Gasly","Kevin Magnussen","Nico Hulkenberg","Oliver Bearman",
  "Liam Lawson","Isack Hadjar","Gabriel Bortoleto","Franco Colapinto"
];

// --- Data Mappings (to convert strings to numbers for the contract) ---
const TRACK_LIST = ['monaco', 'silverstone', 'monza', 'spa', 'suzuka'];
const CONDITIONS = ['dry', 'slightly_wet', 'wet'];

const TRACK_MAP = { 'monaco': 0, 'silverstone': 1, 'monza': 2, 'spa': 3, 'suzuka': 4 };
const COND_MAP = { 'dry': 0, 'slightly_wet': 1, 'wet': 2 };

/**
 * Generates stats for all drivers based on the EXACT logic
 * from your backend/engine.ts makeTemplates() function
 */
function makeAllDriverStats() {
  const allStats = [];
  const numRacers = DRIVER_NAMES.length;

  for (let i = 0; i < numRacers; i++) {
    const name = DRIVER_NAMES[i] ?? `Racer ${i+1}`;
    
    const seedAggro = name.toLowerCase().includes('verstappen') ? 80 :
                      name.toLowerCase().includes('hamilton') ? 55 :
                      name.toLowerCase().includes('leclerc') ? 65 : 50;
    const seedHandling = name.toLowerCase().includes('hamilton') ? 92 :
                         name.toLowerCase().includes('verstappen') ? 90 :
                         name.toLowerCase().includes('leclerc') ? 88 : 78;

    const baseSpeed = Math.round(clamp(110 + Math.random()*20 + (seedAggro - 50) * 0.12, 100, 140));
    const handling = Math.round(clamp(seedHandling + Math.round(rand(-6,6)), 55, 98));
    const aggression = Math.round(clamp(seedAggro + Math.round(rand(-10,10)), 30, 98));
    const tyreManagement = Math.round(clamp(60 + Math.round(rand(-20,20)) - Math.floor(aggression/20), 30, 98));

    // Generate and map favorite tracks and conditions
    const favTracks = shuffle(TRACK_LIST.slice()); // Full string array
    const favConds = shuffle(CONDITIONS.slice()); // Full string array

    // [UPDATED] Map the string arrays to number arrays for the contract
    const mappedTracks = favTracks.map(trackName => TRACK_MAP[trackName]);
    const mappedConds = favConds.map(condName => COND_MAP[condName]);

    allStats.push({
      id: i + 1, // Contract IDs are 1-20
      name: name,
      speed: baseSpeed,
      aggression: aggression,
      handling: handling,
      tyreManagement: tyreManagement,
      favTracks: mappedTracks, // <-- UPDATED: Now the full array [0, 3, 1, 4, 2]
      favConditions: mappedConds, // <-- UPDATED: Now the full array [2, 0, 1]
      price: ethers.utils.parseEther("100") 
    });
  }
  return allStats;
}


async function main() {
  const [deployer] = await ethers.getSigners();
  const Turbo = await ethers.getContractFactory("TurboRacers");
  const turbo = Turbo.attach(process.env.CONTRACT_ADDRESS);
  console.log("Connected to", turbo.address, "as owner", deployer.address);

  const allDrivers = makeAllDriverStats();
  console.log(`Starting to mint ${allDrivers.length} racers...`);

  for (const driver of allDrivers) {
    console.log(`\n[${driver.id}/${allDrivers.length}] Minting: ${driver.name}`);
    console.log(`  Stats: Speed(${driver.speed}), Aggro(${driver.aggression}), Handling(${driver.handling}), Tyre(${driver.tyreManagement})`);
    console.log(`  Prefs: Tracks(${driver.favTracks}), Conds(${driver.favConditions})`);

    try {
      // [UPDATED] Call the new mintRacer function with all attributes
      const tx = await turbo.mintRacer(
        deployer.address,   // address _to (owner)
        driver.id,          // uint256 _id (1-20)
        driver.name,        // string memory _name
        driver.speed,       // uint8 _speed
        driver.aggression,  // uint8 _aggression
        driver.handling,    // uint8 _handling
        driver.tyreManagement, // uint8 _tyreManagement
        driver.favTracks,   // uint8[5] memory _favTracks
        driver.favConditions, // uint8[3] memory _favConditions
        driver.price        // uint256 _initialPrice
      );
      await tx.wait();
      console.log(`  -> SUCCESS: Minted ${driver.name} with ID ${driver.id}`);
    } catch (e) {
      if (e.message.includes("ERC721: token already minted")) {
        console.log(`  -> INFO: Skipping ${driver.name}, token ID ${driver.id} already exists.`);
      } else {
        console.error(`  -> FAILED to mint ${driver.name}:`, e.message);
        throw e; // Stop the script if it's a different error
      }
    }
  }

  console.log("\n-------------------------");
  console.log("All racers minted!");
  console.log("-------------------------");
}

main().catch((e) => { 
  console.error(e); 
  process.exitCode = 1; 
});