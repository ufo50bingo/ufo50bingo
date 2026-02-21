export const STANDARD_UFO = {
  goals: {
    easy: {
      barbuta: [
        "BARBUTA: Purchase the Pin",
        "BARBUTA: Speak to 2 different Bean NPCs",
      ],
      bughunter: [
        "BUG HUNTER: Get 15 Kills by the end of Day 4",
        "BUG HUNTER: Get 4 pit Kills in one job",
      ],
      ninpek: [
        "NINPEK: Collect 5 purple eggs from enemies",
        "NINPEK: Score 6,000+ points",
      ],
      paintchase: [
        "PAINT CHASE: EVEN-COAT allowed; beat courses 16, 17, and 20 while destroying all spike mines",
        "PAINT CHASE: Reach 90+ score after beating at least 3 levels",
      ],
      magicgarden: [
        "MAGIC GARDEN: Defeat an enemy worth at least 700 points",
        "MAGIC GARDEN: Use OVER-GROW; save 30+ oppies in a run",
      ],
      mortol: [
        "MORTOL: OPEN-TOMB allowed; Kill 6 enemy spawners in 2-B using fire arrows",
        "MORTOL: Collect 6 extra life pickups",
      ],
      velgress: [
        "VELGRESS: Clear out a shop's stock",
        "VELGRESS: Hold 50 coins at once",
      ],
      planetzoldath: [
        "PLANET ZOLDATH: Drop 4 items at your ship in one run",
        "PLANET ZOLDATH: Collect 4 energy cubes in a run",
      ],
      attactics: [
        "ATTACTICS: Have 3 Heroes at once (Ranked or Survival Mode)",
        "ATTACTICS: Win 5 battles without losing any flags",
      ],
      devilition: [
        "DEVILITION: Beat 3 rounds in a run while placing the maximum number of pieces each round",
        "DEVILITION: Kill 3 or more villagers in one combo and survive the round",
      ],
      kickclub: [
        "KICK CLUB: Reach Track World with 19,000 points or less",
        "KICK CLUB: Score 25,000+ points",
      ],
      avianos: [
        "AVIANOS: Control 15+ tiles at once",
        "AVIANOS: Capture 3 enemy tiles in one campaign war",
      ],
      mooncat: ["MOONCAT: Defeat 6 unique enemy types", "MOONCAT: Use 3 warps"],
      bushidoball: [
        "BUSHIDO BALL: Win a 10+ point match (laws on)",
        "BUSHIDO BALL: Win 2 rounds in a tournament (laws on)",
      ],
      blockkoala: [
        "BLOCK KOALA: Beat 3 story levels without using the undo button",
        {
          name: "BLOCK KOALA: WORM-1234 allowed; Beat levels {{bk_easy}}, {{bk_easy}}, {{bk_easy}}, {{bk_easy}}",
          sort_tokens: "$numeric",
        },
      ],
      camouflage: [
        "CAMOUFLAGE: Escape with 10 oranges",
        {
          name: "CAMOUFLAGE: FORM-ELDA allowed; Beat levels {{camo_easy}}, {{camo_easy}}, and {{camo_easy}}",
          sort_tokens: "$numeric",
        },
      ],
      campanella: [
        "CAMPANELLA: Collect 7 coffees",
        "CAMPANELLA: Use BEAN-DRIP; score 6,000+ points",
      ],
      golfaria: ["GOLFARIA: Save 2 green ball NPCs", "GOLFARIA: Hit 3 eagles"],
      thebigbellrace: [
        "THE BIG BELL RACE: KO an opponent with 3 unique power-ups",
        "THE BIG BELL RACE: Win Race 1 without boosters",
      ],
      warptank: [
        {
          name: "WARPTANK: SLIM-TANK allowed; Beat sectors: {{warp_easy}}, {{warp_easy}}, and {{warp_easy}}",
          sort_tokens: "warptank_order",
        },
        "WARPTANK: Beat 3 sectors, defeating all possible enemies in each",
      ],
      waldorfsjourney: [
        "WALDORF'S JOURNEY: Have 35 shells at once",
        "WALDORF'S JOURNEY: Have 4 puffins at once",
      ],
      porgy: [
        "PORGY: Collect 4 fuel tanks",
        "PORGY: Equip the {{porgy_upgrade}}",
      ],
      oniondelivery: [
        "ONION DELIVERY: Deliver 8 onions and complete the day",
        "ONION DELIVERY: Complete a day with 6+ time boxes hit",
      ],
      caramelcaramel: [
        "CARAMEL CARAMEL: Score 8,000+ points in the prologue",
        "CARAMEL CARAMEL: Snap 10 bonus background elements",
      ],
      partyhouse: [
        "PARTY HOUSE: Have 1 of each star guest in a party at once in {{ph_scenario}}",
        "PARTY HOUSE: Have 6 trouble in a party at once (Busting OK)",
      ],
      hotfoot: [
        "HOT FOOT: Use TEST-BAGS: Win a 30-point, 1-special-cost game. All throws that score points must be Special Throws",
        "HOT FOOT: Win the first match using 6 different characters",
      ],
      divers: ["DIVERS: Purchase Godblood", "DIVERS: Reach level 3"],
      railheist: [
        "RAIL HEIST: Beat 5 levels",
        "RAIL HEIST: LAZY-COPS allowed; beat Root Around while destroying every barrel",
      ],
      vainger: ["VAINGER: Collect 3 items", "VAINGER: Defeat a boss"],
      rockonisland: [
        "ROCK ON! ISLAND: Beat Initial Encounter",
        "ROCK ON! ISLAND: Have all 6 fully upgraded cavemen types at once (no villages)",
      ],
      pingolf: [
        "PINGOLF: Destroy 10 orange obstacles",
        "PINGOLF: Under par on 5 courses",
      ],
      mortolii: [
        "MORTOL II: Activate all the switches",
        "MORTOL II: In one run, kill 6 chickens without damaging them as Bomber",
      ],
      fisthell: [
        "FIST HELL: Enter a shop with $20+",
        "FIST HELL: Reach wave 7 in the gym",
      ],
      overbold: [
        "OVERBOLD: Max out 4 upgrades at once",
        "OVERBOLD: Purchase 3 price hiked items in one run",
      ],
      campanella2: [
        "CAMPANELLA 2: Defeat Rotondo at end of Burrows II",
        "CAMPANELLA 2: Have two upgrades at once (square icons)",
      ],
      hypercontender: [
        "HYPER CONTENDER: Use PAST-RULE; beat Draft Mode twice",
        "HYPER CONTENDER: Win 4 fights in one run (default ring settings)",
      ],
      valbrace: [
        "VALBRACE: Defeat the Crone",
        "VALBRACE: Give the Red Knight 5 items",
      ],
      rakshasa: [
        "RAKSHASA: Destroy 4 bug nests with your weapon in one run",
        "RAKSHASA: Score 2,000+ points with each of the three weapon types in one run",
      ],
      starwaspir: [
        "STAR WASPIR: Beat wave 1 with 1500+ points (before bonus) without touching any letters",
        "STAR WASPIR: Complete wave 1 without defeating either boss enemy",
      ],
      grimstone: [
        "GRIMSTONE: Defeat 15 enemies",
        "GRIMSTONE: Get Rufus to level 2 and feed him a Dog Treat",
      ],
      lordsofdiskonia: [
        "LORDS OF DISKONIA: Have 5 enemy disks drown",
        "LORDS OF DISKONIA: Destroy 2+ enemy disks in one shot",
      ],
      nightmanor: [
        "NIGHT MANOR: Find 10 journal entries",
        "NIGHT MANOR: Win the hiding minigame twice",
      ],
      elfazarshat: [
        "ELFAZAR'S HAT: Earn an extra life in the bonus round",
        "ELFAZAR'S HAT: Get three different level 2 upgrades in a run",
      ],
      pilotquest: [
        "PILOT QUEST: Make a friend at the crash site",
        "PILOT QUEST: Craft an ingot at the crash site",
      ],
      miniandmax: [
        "MINI & MAX: Collect the full reward for ridding the books of Silverfish",
        "MINI & MAX: Collect the reward from 2 spiders' quests",
      ],
      combatants: [
        "COMBATANTS: Beat First Blood without shooting",
        "COMBATANTS: Beat Skirmish",
      ],
      quibblerace: [
        "QUIBBLE RACE: Bet against your sponsored Quibble and win the round",
        "QUIBBLE RACE: Have your sponsored Quibble win the race, while boosting a different one",
      ],
      seasidedrive: [
        "SEASIDE DRIVE: Clear Stage 1 with 3 lives and exactly 10,000 points",
        "SEASIDE DRIVE: Collect a coin by winning a bonus game",
      ],
      campanella3: [
        "CAMPANELLA 3: Defeat Galbrain (Stage A Boss)",
        "CAMPANELLA 3: Earn a continue from the bonus game",
      ],
      cyberowls: ["CYBER OWLS: Beat {{owls}}"],
    },
    medium: {
      barbuta: [
        "BARBUTA: Fill 5 item slots (you start at 1)",
        "BARBUTA: Visit 25+ rooms",
      ],
      bughunter: [
        "BUG HUNTER: Use GOOD-JOBS; Beat Job 1 on {{dig1}}{{dig2}}{{dig3}}{{dig4}}{{dig5}}{{dig6}}",
        "BUG HUNTER: Complete a job",
      ],
      ninpek: [
        "NINPEK: Collect a coffee without ever firing a shot",
        "NINPEK: Have 6 extra lives at once",
      ],
      paintchase: [
        "PAINT CHASE: Beat 5 different courses with no enemies remaining",
        "PAINT CHASE: Beat 6 courses",
      ],
      magicgarden: [
        "MAGIC GARDEN: Save 100 oppies before scoring 4,000 points",
        "MAGIC GARDEN: Score 10,000+ points before saving 50 Oppies",
      ],
      mortol: ["MORTOL: Clear all levels in World 1", "MORTOL: Have 50+ Lives"],
      velgress: [
        "VELGRESS: Beat level 1 while defeating all enemies using your blaster",
        "VELGRESS: Beat level 2 while stepping on every bomb block",
      ],
      planetzoldath: [
        "PLANET ZOLDATH: Collect the overworld ground Map Piece",
        "PLANET ZOLDATH: Have 2 of each resource at once",
      ],
      attactics: [
        "ATTACTICS: Beat Campaign level 8",
        "ATTACTICS: Reach Lieutenant (50+) in Ranked Mode",
      ],
      devilition: [
        "DEVILITION: Beat 5 rounds in a run without placing the middle piece",
        "DEVILITION: Have 6 villagers at once",
      ],
      kickclub: [
        "KICK CLUB: Beat Track World",
        "KICK CLUB: Eat 10 hidden desserts",
      ],
      avianos: [
        "AVIANOS: Win a custom Fledgling game with 0 mountains (P2 first, other settings default)",
        "AVIANOS: BLUE-BEAK allowed; Win the campaign Fledgling game. You must always select {{ancestor}} when available",
      ],
      mooncat: [
        "MOONCAT: Successfully exit two different water rooms",
        "MOONCAT: Spawn 3 different sets of egg blocks",
      ],
      bushidoball: [
        "BUSHIDO BALL: Win a 16-point match on Hyper speed (laws on)",
        "BUSHIDO BALL: Beat the first two rounds as {{bushido_all}} (laws on, 8+ points)",
      ],
      blockkoala: [
        {
          name: "BLOCK KOALA: WORM-1234 allowed; Beat levels {{bk_med}}, {{bk_med}}, {{bk_med}}, {{bk_med}}",
          sort_tokens: "$numeric",
        },
      ],
      camouflage: ["CAMOUFLAGE: Escape with 5 babies", "CAMOUFLAGE: Gold disk"],
      campanella: [
        "CAMPANELLA: Defeat the Stage B Boss",
        "CAMPANELLA: Score 20,000+ points",
      ],
      golfaria: ["GOLFARIA: Hit 3 Parbots", "GOLFARIA: Obtain the Brakes"],
      thebigbellrace: [
        "THE BIG BELL RACE: Win 3 different races without collecting power-ups",
        "THE BIG BELL RACE: Use KIWI-AURA; Win on 3 courses",
      ],
      warptank: [
        "WARPTANK: Beat Healing Sector with your tank color changed",
        {
          name: "WARPTANK: SLIM-TANK allowed; Beat sectors: {{warp_med}}, {{warp_med}}, {{warp_med}}",
          sort_tokens: "warptank_order",
        },
      ],
      waldorfsjourney: [
        "WALDORF'S JOURNEY: Open 2 chests in a run",
        "WALDORF'S JOURNEY: Have 50 shells at once before entering the palace",
      ],
      porgy: [
        "PORGY: Collect 4 torpedo upgrades",
        "PORGY: Return 3 items from the second depth level",
      ],
      oniondelivery: [
        "ONION DELIVERY: Complete day 3",
        "ONION DELIVERY: Show 12 deliveries made on the counter",
      ],
      caramelcaramel: [
        "CARAMEL CARAMEL: Beat the Egg",
        "CARAMEL CARAMEL: TEST-LENS allowed; Clear Dino Planet",
      ],
      partyhouse: [
        "PARTY HOUSE: Beat {{ph_all}}",
        "PARTY HOUSE: Use VIPS-ONLY; Beat seed {{dig1}}{{dig2}}{{dig3}}{{dig4}}{{dig5}}{{dig6}}",
      ],
      hotfoot: [
        "HOT FOOT: Win 2 games in a row without jumping using {{hf_char}} & {{hf_char}}",
        "HOT FOOT: Win 3 games in a tournament without using any jump specials, using {{hf_char}} & {{hf_char}}",
      ],
      divers: [
        "DIVERS: Open 3 chests that do not contain money",
        "DIVERS: Defeat 5 unique enemy types",
      ],
      railheist: [
        "RAIL HEIST: LAZY-COPS allowed; Beat Vengeance! & The Final Score",
        "RAIL HEIST: GOOD-SPUR allowed; beat Fowl Business with all chickens and lawmen killed",
      ],
      vainger: [
        "VAINGER: Beat 3 bosses",
        "VAINGER: Collect 5 items",
        "VAINGER: Obtain a Keycode from a major boss",
      ],
      rockonisland: ["ROCK ON! ISLAND: CLUB-PASS allowed; beat {{roi_level}}"],
      pingolf: [
        "PINGOLF: Finish hole 9 in first place",
        "PINGOLF: Par or better on 6 courses without dunking",
      ],
      mortolii: [
        "MORTOL II: Have 8 keys at once",
        "MORTOL II: In one run, get eaten by all 4 worms",
      ],
      fisthell: [
        "FIST HELL: Beat the 2nd scare",
        "FIST HELL: Have $50 at once as {{fh_char}}",
      ],
      overbold: [
        "OVERBOLD: Complete a wave with $1000+ stakes without using bombs",
        "OVERBOLD: Complete a wave with $800+ stakes without shooting",
      ],
      campanella2: [
        "CAMPANELLA 2: Obtain the Friendship Bracelet",
        "CAMPANELLA 2: Obtain the Talisman (Cross) item",
      ],
      hypercontender: [
        "HYPER CONTENDER: Beat Draft Mode (Default ring settings)",
        "HYPER CONTENDER: Use PAST-RULE; beat Tournament Mode",
      ],
      valbrace: [
        "VALBRACE: Clear Floor 1",
        "VALBRACE: Use up a throne without defeating the Crone",
      ],
      rakshasa: [
        "RAKSHASA: Beat the first stage",
        "RAKSHASA: Beat the green bridge mini-boss by arriving w/ 4+ skulls",
      ],
      starwaspir: [
        "STAR WASPIR: Have a 30x multiplier",
        "STAR WASPIR: Score 50,000+ points",
      ],
      grimstone: [
        "GRIMSTONE: Collect the money from the burned house",
        "GRIMSTONE: Have 3 Skills learned at once",
      ],
      lordsofdiskonia: [
        "LORDS OF DISKONIA: Beat Narrow Pass",
        "LORDS OF DISKONIA: Win a Quick Battle",
      ],
      nightmanor: [
        "NIGHT MANOR: Collect the {{gemstone}}",
        "NIGHT MANOR: Make Fungicide",
      ],
      elfazarshat: [
        "ELFAZAR'S HAT: Clear Stage 1 without dying",
        "ELFAZAR'S HAT: Clear stages 1 & 2 without upgrades or healing",
      ],
      pilotquest: [
        "PILOT QUEST: Defeat 6 different enemy types",
        "PILOT QUEST: Defeat Unktomi (Spider boss)",
      ],
      miniandmax: [
        "MINI & MAX: Collect the full reward for saving the brainwashed mouse near the portrait",
        "MINI & MAX: Return the stolen Termite Egg to the outlet",
      ],
      combatants: [
        {
          name: "COMBATANTS: ANTS-ANTS allowed; Beat {{ants_med}} & {{ants_med}}",
          sort_tokens: "combatants_order",
        },
      ],
      quibblerace: [
        "QUIBBLE RACE: WILD-BETS allowed; have $25,000+",
        "QUIBBLE RACE: Win 5 bets",
      ],
      seasidedrive: [
        "SEASIDE DRIVE: Beat Stage 2",
        "SEASIDE DRIVE: Score 70,000+ points",
      ],
      campanella3: [
        "CAMPANELLA 3: Beat Robopoke (Stage B Boss)",
        "CAMPANELLA 3: Clear 6 waves 100%",
      ],
      cyberowls: [
        "CYBER OWLS: Defeat 2 bosses",
        "CYBER OWLS: GETM-EOUT allowed; Beat a random rescue game using each owl",
      ],
    },
    hard: {
      barbuta: [
        "BARBUTA: Defeat the Mimic",
        "BARBUTA: Obtain the Rod and Blood Sword",
      ],
      bughunter: [
        "BUG HUNTER: Complete a job with your energy maxed out",
        "BUG HUNTER: WORK-LESS allowed; complete Job {{bughunterjob}}",
      ],
      ninpek: ["NINPEK: Collect 3 crowns", "NINPEK: Score 18,000+ points"],
      paintchase: [
        "PAINT CHASE: EVEN-COAT allowed; Pass courses 18-25",
        "PAINT CHASE: Score 180+ points",
      ],
      magicgarden: [
        "MAGIC GARDEN: Gold disk",
        "MAGIC GARDEN: Obtain a score multiplier of 8x",
      ],
      mortol: [
        "MORTOL: OPEN-TOMB allowed; clear all world 2 levels",
        "MORTOL: OPEN-TOMB allowed; clear any 3 levels with +12 lives or better on each",
      ],
      velgress: [
        "VELGRESS: Collect all 3 keys in a run",
        "VELGRESS: Gold disk with 50+ coins held",
      ],
      planetzoldath: [
        "PLANET ZOLDATH: Collect the dungeon Map Piece",
        "PLANET ZOLDATH: Collect the trade Map Piece",
      ],
      attactics: [
        "ATTACTICS: Score 1000+ points in Survival Mode",
        "ATTACTICS: Use SLOW-DOWN; win a rank 160 battle after spawning at least 2 heroes",
      ],
      devilition: [
        "DEVILITION: Beat 5 rounds in a run, destroying all demons and humans each round",
        "DEVILITION: Clear the screen of demons with at least 18 pieces remaining",
      ],
      kickclub: [
        "KICK CLUB: Defeat the Goalie, then the Net in Ice World",
        "KICK CLUB: Have 5 extra lives at once",
      ],
      avianos: [
        "AVIANOS: BLUE-BEAK allowed; Win the Adult campaign game with a Blessing from each Ancestor",
        "AVIANOS: BLUE-BEAK allowed; Beat Trial 4",
      ],
      mooncat: [
        "MOONCAT: Gold disk",
        "MOONCAT: Beat a room that contains a spear thrower and one that contains a gray spider",
      ],
      bushidoball: [
        "BUSHIDO BALL: Win the first match as every character",
        "BUSHIDO BALL: Win 3 matches in a tournament as {{bushido_all}} (laws on, 8+ points)",
      ],
      blockkoala: [
        {
          name: "BLOCK KOALA: WORM-1234 allowed; Beat levels {{bk_hard}}, {{bk_hard}}, {{bk_hard}}",
          sort_tokens: "$numeric",
        },
      ],
      camouflage: [
        {
          name: "CAMOUFLAGE: FORM-ELDA allowed; Escape with 2/3 collectibles on: {{camo_two_ez}}, {{camo_two_ez}}, {{camo_two_long}}, {{camo_two_long}}, {{camo_two_long}}",
          sort_tokens: "$numeric",
        },
        {
          name: "CAMOUFLAGE: FORM-ELDA allowed; Escape with 3/3 collectibles on: {{camo_easy}}, {{camo_three}}, {{camo_three}}, {{camo_three}}",
          sort_tokens: "$numeric",
        },
      ],
      campanella: [
        "CAMPANELLA: Finish Stage C only earning points from bosses and bonus stages in the run",
        "CAMPANELLA: Have 25+ lives",
      ],
      golfaria: [
        "GOLFARIA: Show 20%+ completion in the library",
        "GOLFARIA: Collect 2 Holy Tee pieces",
      ],
      thebigbellrace: [
        "THE BIG BELL RACE: Complete a full lap in reverse and win on 4 separate tracks",
        "THE BIG BELL RACE: Reach 45+ points",
      ],
      warptank: [
        "WARPTANK: Collect 4 coffees outside the starting room",
        {
          name: "WARPTANK: SLIM-TANK allowed; beat sectors: {{warp_hard}}, {{warp_hard}}, and {{warp_hard}}",
          sort_tokens: "warptank_order",
        },
      ],
      waldorfsjourney: [
        "WALDORF'S JOURNEY: Cherry disk",
        "WALDORF'S JOURNEY: Beat the game without collecting any puffins",
      ],
      porgy: [
        "PORGY: Defeat a boss",
        "PORGY: Return 4 fish eggs to their mother",
      ],
      oniondelivery: [
        "ONION DELIVERY: Complete 4 days in a run with 7+ deliveries",
        "ONION DELIVERY: Complete 2 days in a run with 10+ deliveries",
      ],
      caramelcaramel: [
        "CARAMEL CARAMEL: Score 50,000+ points",
        "CARAMEL CARAMEL: TEST-LENS allowed; beat Ghost Planet without using the camera before the boss",
      ],
      partyhouse: [
        "PARTY HOUSE: Beat {{ph_all}} with your popularity maxed out",
        "PARTY HOUSE: Beat {{ph_all}} with at least one of each guest purchased in the shop",
      ],
      hotfoot: [
        "HOT FOOT: Beat round 4 using {{hf_char}} & {{hf_char}}",
        "HOT FOOT: Get 3 blowouts in one tournament using {{hf_char}} & {{hf_char}}",
      ],
      divers: ["DIVERS: Obtain a Lance weapon", "DIVERS: Pull 2 levers"],
      railheist: [
        {
          name: "RAIL HEIST: LAZY-COPS allowed; Beat levels with a money crate in tact: {{rail_easy}}, {{rail_crate}}, {{rail_crate}}, {{rail_crate}}",
          sort_tokens: "railheist_order",
        },
        {
          name: "RAIL HEIST: LAZY-COPS allowed; Beat levels with 3/3 stars: {{rail_easy}}, {{rail_stars}}, {{rail_stars}}",
          sort_tokens: "railheist_order",
        },
      ],
      vainger: [
        "VAINGER: Obtain the Multi Mod from Latom Sector",
        "VAINGER: Obtain the Force Mod from Verde Sector",
      ],
      rockonisland: [
        "ROCK ON! ISLAND: CLUB-PASS allowed; beat {{roi_level}} without chickens",
        "ROCK ON! ISLAND: CLUB-PASS allowed; survive the first 5 waves of The Four Emperors w/o losing health",
      ],
      pingolf: [
        "PINGOLF: Hole-in-one on 3 different courses",
        "PINGOLF: Par or better on 7 courses with no purple objects remaining",
      ],
      mortolii: [
        "MORTOL II: Gold disk without blowing anything up",
        "MORTOL II: Defeat all three mini bosses without damaging them as Bomber",
      ],
      fisthell: [
        "FIST HELL: Beat the 3rd Scare",
        "FIST HELL: Reach wave 10 in the gym using {{fh_char}}",
      ],
      overbold: [
        "OVERBOLD: Clear a round with $1600+ stakes",
        "OVERBOLD: Gold disk",
      ],
      campanella2: [
        "CAMPANELLA 2: Clear Moire Woods II or Rink II",
        "CAMPANELLA 2: Collect two scrolls in one run",
      ],
      hypercontender: [
        "HYPER CONTENDER: Gold disk as {{hc_char}} or {{hc_char}}",
        "HYPER CONTENDER: Win 3 fights in one run on Hyper difficulty (default ring settings)",
      ],
      valbrace: [
        "VALBRACE: Obtain the Zweihander",
        "VALBRACE: Solve 2 gem puzzles",
      ],
      rakshasa: [
        "RAKSHASA: Beat the second stage",
        "RAKSHASA: Score 30,000+ points",
      ],
      starwaspir: [
        "STAR WASPIR: Score 125,000+ points using the {{waspir_ship}} ship",
        "STAR WASPIR: Clear waves 1 and 2 without using powerups (EEE, GGG, GEE)",
      ],
      grimstone: [
        "GRIMSTONE: Have 4 items equipped to everyone in a posse of 4",
        "GRIMSTONE: Reach Level 4 with any character",
      ],
      lordsofdiskonia: [
        "LORDS OF DISKONIA: Win 2 battles in a Full War",
        "LORDS OF DISKONIA: Win 1 battle in a Full War on Commander difficulty",
      ],
      nightmanor: [
        "NIGHT MANOR: Win the hiding minigame in five different places",
        "NIGHT MANOR: Show 60%+ items found in the library",
      ],
      elfazarshat: [
        "ELFAZAR'S HAT: Clear Stage 3",
        "ELFAZAR'S HAT: Collect 6 tickets in a run",
      ],
      pilotquest: [
        "PILOT QUEST: Activate 2 teleporters",
        "PILOT QUEST: Obtain the Blaster",
      ],
      miniandmax: [
        "MINI & MAX: Collect a big shiny",
        "MINI & MAX: Have 150+ shinies at once without obtaining the Shrink Potion",
      ],
      combatants: [
        {
          name: "COMBATANTS: ANTS-ANTS allowed; beat {{ants_hard}} & {{ants_hard}}",
          sort_tokens: "combatants_order",
        },
        "COMBATANTS: ANTS-ANTS allowed; Slay a spider on 2 different levels",
      ],
      quibblerace: [
        "QUIBBLE RACE: Gold disk",
        "QUIBBLE RACE: Win 3 bets on Quibbles with a 5:1 or higher payout",
      ],
      seasidedrive: [
        "SEASIDE DRIVE: Destroy the UFO in stage 3",
        "SEASIDE DRIVE: Use WEAK-SHOT; beat stage 2",
      ],
      campanella3: [
        "CAMPANELLA 3: Earn 3 star waves in Stage C",
        "CAMPANELLA 3: Defeat Robopoke with 2+ continues",
      ],
      cyberowls: [
        "CYBER OWLS: Clear Moscow with 1200+ score",
        "CYBER OWLS: Show 2000+ points at HQ without playing Congo",
      ],
    },
    veryhard: {
      barbuta: ["BARBUTA: Pay the hammer man to destroy the wall"],
      bughunter: ["BUG HUNTER: Gold disk"],
      ninpek: ["NINPEK: Use HARD-LOOP; Score 22,000+ points"],
      paintchase: ["PAINT CHASE: Score 350+ points"],
      magicgarden: ["MAGIC GARDEN: Win with a score of 50,000+"],
      mortol: ["MORTOL: OPEN-TOMB allowed; beat all World 3 & World 4 levels"],
      velgress: ["VELGRESS: Cherry disk without Upgrades or Jump Pads"],
      planetzoldath: [
        "PLANET ZOLDATH: Use TROT-TERS; Beat seed {{dig1}}{{dig2}}{{dig3}}{{dig4}}{{dig5}}{{dig6}}",
      ],
      attactics: ["ATTACTICS: Reach Lord (100+) in Ranked Mode"],
      devilition: ["DEVILITION: Reach round 8"],
      kickclub: ["KICK CLUB: Score 150,000+ points or gold disk"],
      avianos: ["AVIANOS: Gold disk"],
      mooncat: ["MOONCAT: Find 2 of 3 eggs"],
      bushidoball: [
        "BUSHIDO BALL: Gold disk as {{bushido_gold}} (laws on, 8+ points)",
      ],
      blockkoala: [
        {
          name: "BLOCK KOALA: WORM-1234 allowed; Beat levels {{bk_easy}}, {{bk_easy}}, {{bk_easy}}, {{bk_med}}, {{bk_med}}, {{bk_hard}}, {{bk_hard}}, {{bk_vhard}}",
          sort_tokens: "$numeric",
        },
      ],
      camouflage: ["CAMOUFLAGE: Show 70%+ Completion in the library"],
      campanella: ["CAMPANELLA: Gold disk"],
      golfaria: ["GOLFARIA: Collect 5 clubs & the Sand Roll in one run"],
      thebigbellrace: ["THE BIG BELL RACE: Gold disk with no deaths"],
      warptank: ["WARPTANK: Beat any 9 sectors and speak to 3 NPCs"],
      waldorfsjourney: ["WALDORF'S JOURNEY: Enter the palace with 6 Puffins"],
      porgy: ["PORGY: Show 20%+ Completion in the library"],
      oniondelivery: ["ONION DELIVERY: Gold disk"],
      caramelcaramel: ["CARAMEL CARAMEL: Score 100,000+ points or Gold disk"],
      partyhouse: ["PARTY HOUSE: Beat 2 random scenarios in a row"],
      hotfoot: ["HOT FOOT: Gold disk using {{hf_gold}} & {{hf_gold}}"],
      divers: ["DIVERS: Win a fight against Piranhas"],
      railheist: ["RAIL HEIST: Collect 9 Devil Stars"],
      vainger: ["VAINGER: Show 25%+ Completion in the library"],
      rockonisland: ["ROCK ON! ISLAND: CLUB-PASS allowed; perfect {{roi_vh}}"],
      pingolf: [
        "PINGOLF: Cherry disk without going over par on more than two holes",
      ],
      mortolii: [
        "MORTOL II: Activate all three switches without using portals or double jumps",
      ],
      fisthell: ["FIST HELL: Clear the 4th scare"],
      overbold: ["OVERBOLD: Cherry Disk"],
      campanella2: [
        "CAMPANELLA 2: Obtain 6 power-up items in one run (square icons on left of screen)",
      ],
      hypercontender: [
        "HYPER CONTENDER: Gold disk on Hard or Hyper Difficulty",
      ],
      valbrace: [
        "VALBRACE: Level up at two thrones & defeat the Phantom Knight on Floor 2",
      ],
      rakshasa: ["RAKSHASA: Gold disk"],
      starwaspir: ["STAR WASPIR: Clear wave 3"],
      grimstone: [
        "GRIMSTONE: With a posse of 4 all at level 3+, see 1500 teeth in your bank account",
      ],
      lordsofdiskonia: [
        "LORDS OF DISKONIA: Win a Full War on Knight+ Difficulty",
      ],
      nightmanor: ["NIGHT MANOR: Cherry disk"],
      elfazarshat: ["ELFAZAR'S HAT: Clear Stage 4"],
      pilotquest: ["PILOT QUEST: Return a ship part to the crash site"],
      miniandmax: ["MINI & MAX: Have 350+ shinies at once"],
      combatants: ["COMBATANTS: ANTS-ANTS allowed; beat This Is It"],
      quibblerace: ["QUIBBLE RACE: Cherry disk"],
      seasidedrive: ["SEASIDE DRIVE: Score 200,000+ points or gold disk"],
      campanella3: ["CAMPANELLA 3: Earn 2 star waves in Stage D"],
      cyberowls: ["CYBER OWLS: HAWK-BASE allowed; beat Antarctica"],
    },
    general: {
      gift: ["Collect {{gift_count}} gifts from games on this card"],
      goldcherry: [
        "Cherry disk {{cherry_count}} games on this card",
        "Gold disk {{gold_count}} games on this card",
      ],
      bosslevel: [
        "Defeat 7 bosses from games on this card",
        {
          name: "Defeat a boss in 5 games on this card",
          restriction: {
            count: 8,
            options: [
              "barbuta",
              "ninpek",
              "velgress",
              "kickclub",
              "mooncat",
              "campanella",
              "porgy",
              "caramelcaramel",
              "hotfoot",
              "vainger",
              "mortolii",
              "fisthell",
              "overbold",
              "campanella2",
              "rakshasa",
              "starwaspir",
              "elfazarshat",
              "miniandmax",
              "seasidedrive",
              "campanella3",
              "cyberowls",
            ],
            fallback: "Defeat a boss in 5 games",
          },
        },
        {
          name: "Defeat 2 bosses in 3 games on this card",
          restriction: {
            count: 6,
            options: [
              "kickclub",
              "mooncat",
              "campanella",
              "porgy",
              "caramelcaramel",
              "hotfoot",
              "vainger",
              "mortolii",
              "fisthell",
              "campanella2",
              "rakshasa",
              "starwaspir",
              "elfazarshat",
              "miniandmax",
              "seasidedrive",
              "campanella3",
              "cyberowls",
            ],
            fallback: "Defeat 2 bosses in 3 games",
          },
        },
        {
          name: "Beat 2 levels in 6 games on this card",
          restriction: {
            count: 9,
            options: [
              "paintchase",
              "mortol",
              "velgress",
              "attactics",
              "devilition",
              "kickclub",
              "mooncat",
              "bushidoball",
              "blockkoala",
              "camouflage",
              "campanella",
              "thebigbellrace",
              "warptank",
              "oniondelivery",
              "caramelcaramel",
              "hotfoot",
              "railheist",
              "pingolf",
              "fisthell",
              "overbold",
              "campanella2",
              "starwaspir",
              "elfazarshat",
              "combatants",
              "campanella3",
              "cyberowls",
            ],
            fallback: "Beat 2 levels in 6 games",
          },
        },
        {
          name: "Beat 4 levels in 5 games on this card",
          restriction: {
            count: 8,
            options: [
              "paintchase",
              "velgress",
              "attactics",
              "devilition",
              "kickclub",
              "mooncat",
              "bushidoball",
              "blockkoala",
              "camouflage",
              "campanella",
              "thebigbellrace",
              "warptank",
              "oniondelivery",
              "hotfoot",
              "railheist",
              "pingolf",
              "overbold",
              "campanella2",
              "combatants",
              "campanella3",
            ],
            fallback: "Beat 4 levels in 5 games",
          },
        },
        {
          name: "Beat 8 levels in 3 games on this card",
          restriction: {
            count: 5,
            options: [
              "paintchase",
              "attactics",
              "kickclub",
              "mooncat",
              "blockkoala",
              "camouflage",
              "campanella",
              "thebigbellrace",
              "warptank",
              "railheist",
              "pingolf",
              "overbold",
              "campanella2",
              "campanella3",
            ],
            fallback: "Beat 8 levels in 3 games",
          },
        },
      ],
      collectathon: [
        "Buy an item from 2 unique shops in one run in 6 games",
        "Increase your base HP twice in 4 games",
        "Open 2 chests in 5 games",
        "Earn 2 extra lives in 5 games",
        "Collect 2 keys in 5 games",
        "Surpass the top 5 score from 4 arcade leaderboards",
        "Defeat 6 different enemy types in 6 games",
      ],
      theme: [
        {
          name: "CAMPANELLA TRILOGY: Beat 5 total worlds across Campanella 1, 2, and 3",
          restriction: {
            count: 1,
            options: ["campanella", "campanella2", "campanella3"],
            fallback:
              "CAMPANELLA TRILOGY: Beat 5 total worlds across Campanella 1, 2, and 3",
          },
        },
        {
          name: "SHOOTER: Beat 5 waves/stages across Elfazar's Hat, Seaside Drive, and Caramel Caramel",
          restriction: {
            count: 1,
            options: ["elfazarshat", "seasidedrive", "caramelcaramel"],
            fallback:
              "SHOOTER: Beat 5 waves/stages across Elfazar's Hat, Seaside Drive, and Caramel Caramel",
          },
        },
        {
          name: "DAY JOB: Beat 9 levels across Rail Heist, Onion Delivery, and Bug Hunter",
          restriction: {
            count: 1,
            options: ["railheist", "oniondelivery", "bughunter"],
            fallback:
              "DAY JOB: Beat 9 levels across Rail Heist, Onion Delivery, and Bug Hunter",
          },
        },
        {
          name: "RACER: Win 12 races across Paint Chase, The Big Bell Race, and Quibble Race",
          restriction: {
            count: 1,
            options: ["paintchase", "thebigbellrace", "quibblerace"],
            fallback:
              "RACER: Win 12 races across Paint Chase, The Big Bell Race, and Quibble Race",
          },
        },
        {
          name: "PUZZLER: Beat 15 levels across Block Koala, Devilition, and Warptank",
          restriction: {
            count: 1,
            options: ["blockkoala", "devilition", "warptank"],
            fallback:
              "PUZZLER: Beat 15 levels across Block Koala, Devilition, and Warptank",
          },
        },
        {
          name: "AMY: Beat 5 levels across Party House, Fist Hell, and Hot Foot",
          restriction: {
            count: 1,
            options: ["partyhouse", "fisthell", "hotfoot"],
            fallback:
              "AMY: Beat 5 levels across Party House, Fist Hell, and Hot Foot",
          },
        },
        {
          name: "WAR IS BAD: Win 9 battles across Attactics, Avianos, and Combatants",
          restriction: {
            count: 1,
            options: ["attactics", "avianos", "combatants"],
            fallback:
              "WAR IS BAD: Win 9 battles across Attactics, Avianos, and Combatants",
          },
        },
        {
          name: "METROIDVANIA: Collect 6 abilities across Porgy, Vainger, and Golfaria",
          restriction: {
            count: 1,
            options: ["porgy", "vainger", "golfaria"],
            fallback:
              "METROIDVANIA: Collect 6 abilities across Porgy, Vainger, and Golfaria",
          },
        },
        {
          name: "ROLE PLAYER: Level up all your characters 6 total times across Grimstone, Divers, Valbrace",
          restriction: {
            count: 1,
            options: ["grimstone", "divers", "valbrace"],
            fallback:
              "ROLE PLAYER: Level up all your characters 6 total times across Grimstone, Divers, Valbrace",
          },
        },
      ],
    },
  },
  tokens: {
    gift_count: ["6", "7", "8"],
    cherry_count: ["2", "3"],
    gold_count: ["3", "4"],
    bughunterjob: ["7", "8", "9"],
    ancestor: ["Stegnar", "Brontor", "Trilock", "Quetzal", "Rexadon"],
    bushido_all: ["Kotaro", "Raizo", "Yamada", "Ayumi", "Tomoe", "Chiyome"],
    bushido_gold: ["Kotaro", "Yamada", "Ayumi", "Tomoe", "Chiyome"],
    bk_easy: ["7", "17", "34", "38", "42", "46", "49"],
    bk_med: [
      "4",
      "6",
      "10",
      "11",
      "12",
      "18",
      "26",
      "27",
      "29",
      "30",
      "35",
      "36",
      "44",
      "48",
    ],
    bk_hard: ["9", "16", "20", "21", "25", "28", "31", "37", "39", "47"],
    bk_vhard: [
      "3",
      "8",
      "13",
      "14",
      "15",
      "19",
      "22",
      "23",
      "24",
      "32",
      "33",
      "41",
      "43",
      "45",
      "50",
    ],
    camo_easy: ["2", "3", "4", "5", "6", "7"],
    camo_two_ez: ["1", "2", "3", "8"],
    camo_two_long: ["4", "7", "9", "10", "11", "12", "13", "14"],
    camo_three: ["8", "9", "10", "11", "12", "13", "14"],
    warp_easy: ["Crust", "Bomb", "Stare", "Orb", "Form", "Sore", "Garl"],
    warp_med: [
      "Tower",
      "Mazurka",
      "Nest",
      "Deep",
      "Nugget",
      "Axon",
      "Sacrum",
      "Dyad",
    ],
    warp_hard: ["Port", "Shock", "Soft", "Kraft", "Riot"],
    porgy_upgrade: ["Buster Torpedoes", "Super Booster (Motor)"],
    ph_scenario: [
      "High or Low",
      "Best Wishes",
      "Money Management",
      "A Magical Night",
    ],
    ph_all: [
      "Alien Invitation",
      "High or Low",
      "Best Wishes",
      "Money Management",
      "A Magical Night",
    ],
    hf_char: [
      "Jerry",
      "Amy",
      "Chandar",
      "Benjy",
      "Rizzik",
      "Bea",
      "Yoka",
      "Suze",
      "Marc",
      "Mascot",
      "July",
    ],
    hf_gold: [
      "Jerry",
      "Amy",
      "Chandar",
      "Benjy",
      "Rizzik",
      "Bea",
      "Yoka",
      "Suze",
      "Marc",
      "Mascot",
    ],
    rail_easy: ["A Simple Heist", "Roof Assault", "Cargo Ambush", "High Alert"],
    rail_crate: [
      "Guarded by Gat",
      "Shifting Gears",
      "Vault Robbery",
      "Winging It",
      "Daring Duo",
      "Root Around",
      "Cow Poke",
    ],
    rail_stars: [
      "Fowl Business",
      "Guarded by Gat",
      "Shifting Gears",
      "Vault Robbery",
      "Winging It",
      "Daring Duo",
      "Root Around",
      "Cow Poke",
      "Rescue Mission",
      "Long Haul",
      "Resupply",
      "Sitting Ducks",
    ],
    roi_level: [
      "The Oasis",
      "Underbrush",
      "Jungle Rush",
      "Wasteland",
      "The Spiral",
      "Crossroads",
    ],
    roi_vh: ["Wasteland", "Jungle Rush", "Terror Overhead", "Crossroads"],
    fh_char: ["Jay", "Victor", "Cat", "Amy"],
    hc_char: [
      "Elka",
      "Sephy",
      "Reck",
      "Voltana",
      "Brazz",
      "Gilroy",
      "Yogo",
      "Donkus",
    ],
    waspir_ship: ["Gray", "Yellow", "Red"],
    gemstone: ["Emerald", "Diamond", "Topaz"],
    ants_med: ["Spidernest", "Commando", "Surprise!"],
    ants_hard: ["Open Field", "Pincered", "Ambush"],
    owls: ["Congo", "Chicago", "Moscow", "Hong Kong"],
    dig1: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    dig2: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    dig3: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    dig4: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    dig5: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    dig6: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  },
  category_counts: {
    easy: 5,
    medium: 7,
    hard: 6,
    veryhard: 2,
    general: 5,
  },
  sort_orders: {
    railheist_order: [
      "A Simple Heist",
      "Roof Assault",
      "Cargo Ambush",
      "High Alert",
      "Fowl Business",
      "Guarded by Gat",
      "Shifting Gears",
      "Vault Robbery",
      "Winging It",
      "Daring Duo",
      "Root Around",
      "Cow Poke",
      "Rescue Mission",
      "Long Haul",
      "Resupply",
      "Armored Up",
      "Powder Keg",
      "Sitting Ducks",
      "Vengeance!",
      "The Final Score",
    ],
    warptank_order: [
      "Crust",
      "Yard",
      "Piston",
      "Jr",
      "Bomb",
      "Meal",
      "Stare",
      "Healing",
      "Tower",
      "Mazurka",
      "Nest",
      "Orb",
      "Form",
      "Sore",
      "Deep",
      "Nugget",
      "Garl",
      "Axon",
      "Sacrum",
      "Dyad",
      "Port",
      "Shock",
      "Soft",
      "Kraft",
      "Guide",
      "Riot",
    ],
    combatants_order: [
      "First Blood",
      "Skirmish",
      "Surprise!",
      "Commando",
      "Ambush",
      "Pincered",
      "Commando 2",
      "Spidernest",
      "Open Field",
      "The Push",
      "Deathsdoor",
      "This Is It",
    ],
  },
  draft: {
    excluded_categories: ["general"],
    category_counts: [
      { easy: 3, medium: 3, hard: 3, veryhard: 3 },
      { easy: 4, medium: 4, hard: 3, veryhard: 2 },
    ],
  },
} as const;
