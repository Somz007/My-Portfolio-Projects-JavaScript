export const CATEGORIES = [
  { id: 9,  name: 'General Knowledge', icon: '🌍', short: 'General'  },
  { id: 18, name: 'Computers & Tech',  icon: '💻', short: 'Tech'     },
  { id: 17, name: 'Science & Nature',  icon: '🌿', short: 'Science'  },
  { id: 19, name: 'Mathematics',       icon: '🧮', short: 'Maths'    },
  { id: 15, name: 'Video Games',       icon: '🎮', short: 'Games'    },
  { id: 11, name: 'Film & TV',         icon: '🎬', short: 'Film'     },
  { id: 12, name: 'Music',             icon: '🎵', short: 'Music'    },
  { id: 21, name: 'Sports',            icon: '⚽', short: 'Sports'   },
];

export const DIFFICULTIES = {
  easy:   { label: 'Easy',   time: 30, multiplier: 1,   icon: '🟢', color: '#22c55e' },
  medium: { label: 'Medium', time: 20, multiplier: 1.5, icon: '🟡', color: '#f59e0b' },
  hard:   { label: 'Hard',   time: 12, multiplier: 2,   icon: '🔴', color: '#ef4444' },
};

export const QUESTIONS_PER_GAME = 10;
