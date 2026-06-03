// ── Currency ───────────────────────────────────────────────────
// All expenses are STORED in ZAR (the base). Other currencies are
// display-only — converted via live rates from rates.js.
// Only currencies Frankfurter supports are listed here.
export const CURRENCIES = {
  ZAR: { symbol: 'R',   name: 'South African Rand' },
  USD: { symbol: '$',   name: 'US Dollar'           },
  EUR: { symbol: '€',   name: 'Euro'                },
  GBP: { symbol: '£',   name: 'British Pound'       },
  AUD: { symbol: 'A$',  name: 'Australian Dollar'   },
  CAD: { symbol: 'C$',  name: 'Canadian Dollar'     },
  INR: { symbol: '₹',   name: 'Indian Rupee'        },
  JPY: { symbol: '¥',   name: 'Japanese Yen'        },
};

const CURRENCY_KEY = 'expense-currency';

export function getCurrencyCode()   { return localStorage.getItem(CURRENCY_KEY) ?? 'ZAR'; }
export function getCurrencySymbol() { return CURRENCIES[getCurrencyCode()]?.symbol ?? 'R'; }
export function setCurrency(code)   { localStorage.setItem(CURRENCY_KEY, code); }

// current conversion rate (target units per 1 ZAR) — set once rates load
let _rate = 1;
export function setRate(rate) { _rate = rate || 1; }

// converts a ZAR amount into the active currency (for display)
export function convert(zar) { return zar * _rate; }

// converts an active-currency amount back into ZAR (for saving inputs)
export function toZAR(amount) { return amount / _rate; }

// full display string: symbol + converted + formatted, e.g. "R1,234.50"
// JPY has no minor unit, so we drop decimals for it
export function money(zar) {
  const decimals = getCurrencyCode() === 'JPY' ? 0 : 2;
  const value    = convert(zar).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${getCurrencySymbol()}${value}`;
}

export const CATEGORIES = {
  food:          { label: 'Food & Dining',  icon: '🍔', color: '#f59e0b' },
  transport:     { label: 'Transport',       icon: '🚌', color: '#3b82f6' },
  entertainment: { label: 'Entertainment',   icon: '🎬', color: '#8b5cf6' },
  shopping:      { label: 'Shopping',        icon: '🛍️', color: '#ec4899' },
  health:        { label: 'Health',          icon: '💊', color: '#22c55e' },
  other:         { label: 'Other',           icon: '📦', color: '#64748b' },
};

export const DEFAULT_BUDGETS = {
  food:          500,
  transport:     200,
  entertainment: 150,
  shopping:      300,
  health:        100,
  other:         200,
};

// sample expenses seeded on first load so charts show immediately
export const SAMPLE_EXPENSES = [
  { category: 'food',          description: 'Weekly groceries',     amount: 87.43,  daysAgo: 2  },
  { category: 'food',          description: 'Restaurant dinner',    amount: 54.00,  daysAgo: 5  },
  { category: 'food',          description: 'Coffee & pastry',      amount: 8.50,   daysAgo: 1  },
  { category: 'food',          description: 'Takeaway lunch',       amount: 14.99,  daysAgo: 8  },
  { category: 'transport',     description: 'Monthly bus pass',     amount: 89.00,  daysAgo: 3  },
  { category: 'transport',     description: 'Ride share',           amount: 18.75,  daysAgo: 6  },
  { category: 'transport',     description: 'Fuel',                 amount: 65.00,  daysAgo: 12 },
  { category: 'entertainment', description: 'Streaming subscription',amount: 15.99, daysAgo: 4  },
  { category: 'entertainment', description: 'Cinema tickets',       amount: 28.00,  daysAgo: 10 },
  { category: 'shopping',      description: 'New shoes',            amount: 89.99,  daysAgo: 7  },
  { category: 'shopping',      description: 'Online order',         amount: 67.50,  daysAgo: 14 },
  { category: 'health',        description: 'Pharmacy',             amount: 34.20,  daysAgo: 9  },
  { category: 'health',        description: 'Gym membership',       amount: 45.00,  daysAgo: 2  },
  { category: 'other',         description: 'Electricity bill',     amount: 120.00, daysAgo: 11 },
  { category: 'other',         description: 'Internet bill',        amount: 55.00,  daysAgo: 15 },
  { category: 'food',          description: 'Grocery run',          amount: 92.10,  daysAgo: 35 },
  { category: 'transport',     description: 'Parking',              amount: 12.00,  daysAgo: 38 },
  { category: 'entertainment', description: 'Video game',           amount: 44.99,  daysAgo: 42 },
  { category: 'shopping',      description: 'Clothing',             amount: 156.00, daysAgo: 40 },
  { category: 'food',          description: 'Dinner out',           amount: 67.00,  daysAgo: 65 },
  { category: 'health',        description: 'Vitamins',             amount: 22.50,  daysAgo: 68 },
  { category: 'transport',     description: 'Train ticket',         amount: 34.00,  daysAgo: 70 },
  { category: 'other',         description: 'Books',                amount: 28.00,  daysAgo: 72 },
  { category: 'shopping',      description: 'Electronics',          amount: 210.00, daysAgo: 75 },
  { category: 'entertainment', description: 'Concert ticket',       amount: 85.00,  daysAgo: 78 },
];
