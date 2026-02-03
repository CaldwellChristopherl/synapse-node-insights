// Fun, lighthearted personality questions - no war references!
export const QUESTIONS = [
  {
    id: 1,
    text: "Your pizza is taking FOREVER to arrive. What's your move? 🍕",
    dimension: "patience",
    weight: 1.0,
    options: [
      { text: "Already called twice and I'm hangry", value: -4 },
      { text: "Checking the app every 30 seconds", value: -1 },
      { text: "Made a snack, it'll get here when it gets here", value: 2 },
      { text: "Perfect time to reorganize my spice rack", value: 4 },
      { text: "I ordered 2 hours early specifically for this", value: 5 }
    ]
  },
  {
    id: 2,
    text: "Dream vacation style? ✈️",
    dimension: "collective",
    weight: 0.6,
    options: [
      { text: "Solo backpacking - just me and the unknown", value: -4 },
      { text: "Me plus one ride-or-die bestie", value: -1 },
      { text: "Small group of close friends", value: 2 },
      { text: "Big family reunion trip - the more the merrier!", value: 4 },
      { text: "Massive group tour - instant community!", value: 5 }
    ]
  },
  {
    id: 3,
    text: "Peek at your desk/workspace right now... 👀",
    dimension: "order",
    weight: 1.6,
    options: [
      { text: "Chaos is a ladder. I know where everything is... mostly", value: -5 },
      { text: "Creative clutter - organized mess", value: -2 },
      { text: "Reasonably tidy with a few piles", value: 1 },
      { text: "Everything has its designated spot", value: 3 },
      { text: "Color-coded, labeled, museum-level pristine", value: 5 }
    ]
  },
  {
    id: 4,
    text: "Your ideal smart home situation? 🏠",
    dimension: "tech",
    weight: 1.1,
    options: [
      { text: "Cabin in the woods, no wifi, bliss", value: -4 },
      { text: "Minimal tech - plants and natural light", value: -2 },
      { text: "Normal amount of gadgets I guess?", value: 1 },
      { text: "Voice-controlled everything, obviously", value: 3 },
      { text: "Full automation - my house basically runs itself", value: 5 }
    ]
  },
  {
    id: 5,
    text: "You're building a fantasy sports team. Strategy? 🏆",
    dimension: "elite",
    weight: 1.2,
    options: [
      { text: "Maximum roster depth - quantity has quality", value: -4 },
      { text: "Solid starters with lots of bench options", value: -1 },
      { text: "Balanced approach to stars and depth", value: 1 },
      { text: "Stack the starters, worry about depth later", value: 3 },
      { text: "ALL the superstars, bench who?", value: 5 }
    ]
  },
  {
    id: 6,
    text: "You find $100 on the ground with someone's ID nearby 💵",
    dimension: "honor",
    weight: 1.6,
    options: [
      { text: "Finders keepers, they should be more careful", value: -5 },
      { text: "Keep the cash, mail back the ID", value: -2 },
      { text: "Depends... do they look like they need it?", value: 0 },
      { text: "Return everything and feel great about it", value: 3 },
      { text: "Track them down personally to return it", value: 5 }
    ]
  },
  {
    id: 7,
    text: "How do you make big life decisions? 🤔",
    dimension: "faith",
    weight: 0.9,
    options: [
      { text: "Spreadsheets, pros/cons lists, data only", value: -3 },
      { text: "Research heavily, then decide logically", value: -1 },
      { text: "Mix of research and gut feeling", value: 1 },
      { text: "Trust my instincts - they haven't failed me", value: 3 },
      { text: "The universe guides me, I just listen", value: 5 }
    ]
  },
  {
    id: 8,
    text: "You need to tell a friend their new haircut is... not great 💇",
    dimension: "subtlety",
    weight: 1.4,
    options: [
      { text: "\"Wow, that's certainly... a choice you made\"", value: -4 },
      { text: "Be honest but gentle - they asked!", value: -1 },
      { text: "Focus on what DOES work about it", value: 1 },
      { text: "\"Have you tried styling it differently?\"", value: 3 },
      { text: "Compliment something else, change subject forever", value: 5 }
    ]
  },
  {
    id: 9,
    text: "Grandma's secret recipe - what do you do with it? 👵",
    dimension: "tradition",
    weight: 1.1,
    options: [
      { text: "Completely reinvent it with modern twists", value: -5 },
      { text: "Use it as inspiration for something new", value: -2 },
      { text: "Keep the base, add my own flair", value: 1 },
      { text: "Follow it closely with tiny improvements", value: 3 },
      { text: "Make it EXACTLY as written, it's sacred", value: 5 }
    ]
  },
  {
    id: 10,
    text: "Pineapple on pizza? 🍍",
    dimension: "purity",
    weight: 1.7,
    options: [
      { text: "Put anything on pizza! Chaos is delicious!", value: -5 },
      { text: "I'll try weird toppings, why not?", value: -2 },
      { text: "Not my thing but you do you", value: 0 },
      { text: "Pizza should stay relatively traditional", value: 3 },
      { text: "Absolutely not. Some things are sacred.", value: 5 }
    ]
  },
  {
    id: 11,
    text: "Morning routine vibes? ☀️",
    dimension: "speed",
    weight: 0.8,
    options: [
      { text: "Slow morning coffee ritual, no rushing", value: -3 },
      { text: "Steady and predictable, plenty of time", value: -1 },
      { text: "Depends on the day honestly", value: 1 },
      { text: "Quick and efficient, time is precious", value: 3 },
      { text: "Speed run every morning, sleep is priority", value: 5 }
    ]
  },
  {
    id: 12,
    text: "Your social media presence is... 📱",
    dimension: "mystery",
    weight: 1.0,
    options: [
      { text: "An open book - stories, posts, live updates", value: -2 },
      { text: "Pretty active, people know what I'm up to", value: 0 },
      { text: "Selective sharing of the highlights", value: 2 },
      { text: "Mostly lurking with occasional mysterious posts", value: 4 },
      { text: "Ghost mode - no photos, no info, no trace", value: 5 }
    ]
  },
  {
    id: 13,
    text: "At a buffet, you... 🍽️",
    dimension: "versatility",
    weight: 0.6,
    options: [
      { text: "Beeline to my ONE favorite thing, pile it high", value: -3 },
      { text: "Focus on a few dishes I know I love", value: -1 },
      { text: "Strategic variety - best of each station", value: 2 },
      { text: "Try a little of everything available", value: 4 },
      { text: "Must. Sample. EVERYTHING. Multiple trips.", value: 5 }
    ]
  },
  {
    id: 14,
    text: "If you could be any creature in a fantasy world? 🐉",
    dimension: "humanity",
    weight: 1.6,
    options: [
      { text: "Something truly alien - eldritch horror vibes", value: -5 },
      { text: "Dragon, giant spider, or kraken please", value: -2 },
      { text: "Centaur or merfolk - half and half", value: 0 },
      { text: "Elf, dwarf - humanoid but special", value: 2 },
      { text: "Human with cool magic powers", value: 5 }
    ]
  },
  {
    id: 15,
    text: "Group project time! You naturally... 📚",
    dimension: "leadership",
    weight: 0.8,
    options: [
      { text: "Do my part independently, merge at the end", value: -2 },
      { text: "Contribute ideas but let others organize", value: 0 },
      { text: "Take initiative when needed", value: 2 },
      { text: "Create the timeline and delegate tasks", value: 4 },
      { text: "I AM the project manager now", value: 5 }
    ]
  },
  {
    id: 16,
    text: "Playing board games with family... 🎲",
    dimension: "honor",
    weight: 1.6,
    options: [
      { text: "All's fair in love and Monopoly", value: -4 },
      { text: "Bend the rules creatively when I can", value: -1 },
      { text: "Play to win but keep it friendly", value: 1 },
      { text: "Strict rule follower - no house rules!", value: 3 },
      { text: "I'd rather lose than win unfairly", value: 5 }
    ]
  },
  {
    id: 17,
    text: "Your dream car vibes? 🚗",
    dimension: "tech",
    weight: 1.1,
    options: [
      { text: "Classic vintage, mechanical, soulful", value: -4 },
      { text: "Simple and reliable, no frills needed", value: -2 },
      { text: "Modern comfort with reasonable tech", value: 0 },
      { text: "Latest features, all the smart stuff", value: 3 },
      { text: "Fully autonomous, basically a spaceship", value: 5 }
    ]
  },
  {
    id: 18,
    text: "Friend is going through a breakup. You... 💔",
    dimension: "collective",
    weight: 0.6,
    options: [
      { text: "Send a supportive text, give them space", value: -3 },
      { text: "Check in but let them process solo", value: -1 },
      { text: "Offer to hang whenever they're ready", value: 2 },
      { text: "Show up with ice cream, no questions", value: 4 },
      { text: "Rally the whole friend group for support", value: 5 }
    ]
  },
  {
    id: 19,
    text: "You're stuck in a never-ending meeting... 😴",
    dimension: "patience",
    weight: 1.0,
    options: [
      { text: "Interrupt to wrap it up, we all have lives", value: -4 },
      { text: "Visibly checking my watch/phone", value: -1 },
      { text: "Mentally checked out but politely present", value: 1 },
      { text: "Finding something useful in the discussion", value: 3 },
      { text: "Genuinely engaged - meetings have value!", value: 5 }
    ]
  },
  {
    id: 20,
    text: "Horoscopes, tarot, fortune cookies? 🔮",
    dimension: "mystery",
    weight: 1.0,
    options: [
      { text: "Complete nonsense, show me the data", value: -2 },
      { text: "Fun but not something I take seriously", value: 0 },
      { text: "Interesting to think about sometimes", value: 2 },
      { text: "There's something to it, I pay attention", value: 4 },
      { text: "The universe speaks in mysterious ways", value: 5 }
    ]
  },
  {
    id: 21,
    text: "Shopping style for a special occasion outfit? 👔",
    dimension: "elite",
    weight: 1.2,
    options: [
      { text: "Thrift stores - treasure hunting is half the fun", value: -4 },
      { text: "Budget-friendly with one splurge piece", value: -1 },
      { text: "Mid-range, good quality for the price", value: 1 },
      { text: "Invest in quality pieces that last", value: 3 },
      { text: "Designer only - this is important!", value: 5 }
    ]
  },
  {
    id: 22,
    text: "Someone cuts in line right in front of you 😤",
    dimension: "subtlety",
    weight: 1.4,
    options: [
      { text: "\"HEY! End of the line, buddy!\"", value: -3 },
      { text: "Firmly but politely point out the line", value: -1 },
      { text: "Loudly mention to my friend how lines work", value: 1 },
      { text: "Strategic coughing and pointed staring", value: 3 },
      { text: "Silently judge while doing nothing", value: 4 }
    ]
  },
  {
    id: 23,
    text: "How do you feel about people who don't recycle? ♻️",
    dimension: "purity",
    weight: 1.7,
    options: [
      { text: "To each their own, not my business", value: -4 },
      { text: "I notice but don't say anything", value: -1 },
      { text: "I recycle but won't preach about it", value: 1 },
      { text: "I'd gently encourage better habits", value: 3 },
      { text: "HOW CAN THEY LIVE WITH THEMSELVES", value: 5 }
    ]
  },
  {
    id: 24,
    text: "What keeps you going through tough times? 💪",
    dimension: "faith",
    weight: 0.9,
    options: [
      { text: "Logic and problem-solving - emotions later", value: -3 },
      { text: "Making a plan and executing it", value: 0 },
      { text: "Support from friends and family", value: 2 },
      { text: "Believing things happen for a reason", value: 4 },
      { text: "Faith that the universe has my back", value: 5 }
    ]
  },
  {
    id: 25,
    text: "Texting style? 📲",
    dimension: "speed",
    weight: 0.8,
    options: [
      { text: "I'll respond when I respond, no rush", value: -3 },
      { text: "Usually reply within a few hours", value: -1 },
      { text: "Depends who's texting honestly", value: 1 },
      { text: "Pretty quick, I like staying connected", value: 3 },
      { text: "Instant reply gang - phone in hand 24/7", value: 5 }
    ]
  },
  {
    id: 26,
    text: "The restaurant you've been going to for years changes the menu 📋",
    dimension: "tradition",
    weight: 1.1,
    options: [
      { text: "Finally! Time to try new things!", value: -4 },
      { text: "Excited to explore the new options", value: -1 },
      { text: "Hope they kept some classics", value: 1 },
      { text: "Low-key upset, I had my order perfected", value: 3 },
      { text: "Devastated. Why fix what isn't broken?!", value: 5 }
    ]
  },
  {
    id: 27,
    text: "Planning a party - your approach? 🎉",
    dimension: "order",
    weight: 1.6,
    options: [
      { text: "Wing it! Best parties are spontaneous", value: -4 },
      { text: "Basic plan but go with the flow", value: -1 },
      { text: "Have a structure with room for flexibility", value: 2 },
      { text: "Detailed timeline and backup plans", value: 4 },
      { text: "Spreadsheet with contingencies for everything", value: 5 }
    ]
  },
  {
    id: 28,
    text: "At a restaurant, ordering is... 🍜",
    dimension: "versatility",
    weight: 0.6,
    options: [
      { text: "The same thing I always get, perfection found", value: -2 },
      { text: "Rotate between my top 3 favorites", value: 0 },
      { text: "Depends on my mood that day", value: 3 },
      { text: "Always trying something new", value: 4 },
      { text: "\"What's the weirdest thing on the menu?\"", value: 5 }
    ]
  },
  {
    id: 29,
    text: "Lost in a new city with friends - you... 🗺️",
    dimension: "leadership",
    weight: 0.8,
    options: [
      { text: "Follow whoever seems confident", value: -1 },
      { text: "Offer suggestions but don't push", value: 1 },
      { text: "Take turns navigating with the group", value: 3 },
      { text: "Pull up maps and take charge", value: 4 },
      { text: "I'm the navigator now, follow me!", value: 5 }
    ]
  },
  {
    id: 30,
    text: "Your pet (or dream pet) would be... 🐾",
    dimension: "humanity",
    weight: 1.6,
    options: [
      { text: "Something exotic - tarantula, snake, scorpion", value: -4 },
      { text: "Unusual but cool - ferret, hedgehog, lizard", value: -1 },
      { text: "Classic but interesting - bird, rabbit, fish", value: 2 },
      { text: "Cat - independent but affectionate", value: 3 },
      { text: "Dog - loyal best friend energy", value: 5 }
    ]
  }
];