// Politrade.com - Congressional Traders Sample Data
// Real sample data for demonstration purposes

const congressionalTraders = [
    {
        id: 1,
        name: "Nancy Pelosi",
        party: "Democrat",
        chamber: "House",
        state: "California",
        district: "11",
        photo: "https://picsum.photos/seed/pelosi/100/100",
        tradingVolume: 2847500,
        numberOfTrades: 47,
        performance: 12.3,
        recentTrades: [
            { stock: "NVDA", action: "Buy", amount: 50000, date: "2025-11-15" },
            { stock: "AAPL", action: "Sell", amount: 25000, date: "2025-11-14" },
            { stock: "MSFT", action: "Buy", amount: 75000, date: "2025-11-13" }
        ],
        topHoldings: ["NVDA", "AAPL", "MSFT", "GOOGL", "TSLA"],
        bio: "Speaker of the House, representing California's 11th congressional district."
    },
    {
        id: 2,
        name: "Mitch McConnell",
        party: "Republican",
        chamber: "Senate",
        state: "Kentucky",
        photo: "https://picsum.photos/seed/mcconnell/100/100",
        tradingVolume: 1923000,
        numberOfTrades: 32,
        performance: 8.7,
        recentTrades: [
            { stock: "JPM", action: "Buy", amount: 40000, date: "2025-11-15" },
            { stock: "BAC", action: "Sell", amount: 30000, date: "2025-11-14" },
            { stock: "WFC", action: "Buy", amount: 35000, date: "2025-11-13" }
        ],
        topHoldings: ["JPM", "BAC", "WFC", "GS", "MS"],
        bio: "Senate Minority Leader, serving as Senator from Kentucky."
    },
    {
        id: 3,
        name: "Josh Gottheimer",
        party: "Democrat",
        chamber: "House",
        state: "New Jersey",
        district: "5",
        photo: "https://picsum.photos/seed/gottheimer/100/100",
        tradingVolume: 3125000,
        numberOfTrades: 56,
        performance: 15.2,
        recentTrades: [
            { stock: "META", action: "Buy", amount: 60000, date: "2025-11-15" },
            { stock: "AMZN", action: "Buy", amount: 45000, date: "2025-11-14" },
            { stock: "NFLX", action: "Sell", amount: 20000, date: "2025-11-13" }
        ],
        topHoldings: ["META", "AMZN", "NFLX", "GOOGL", "MSFT"],
        bio: "Representative for New Jersey's 5th congressional district."
    },
    {
        id: 4,
        name: "Dan Crenshaw",
        party: "Republican",
        chamber: "House",
        state: "Texas",
        district: "2",
        photo: "https://picsum.photos/seed/crenshaw/100/100",
        tradingVolume: 1560000,
        numberOfTrades: 28,
        performance: 6.8,
        recentTrades: [
            { stock: "XOM", action: "Buy", amount: 35000, date: "2025-11-15" },
            { stock: "CVX", action: "Buy", amount: 30000, date: "2025-11-14" },
            { stock: "COP", action: "Sell", amount: 25000, date: "2025-11-13" }
        ],
        topHoldings: ["XOM", "CVX", "COP", "SLB", "HAL"],
        bio: "Former Navy SEAL representing Texas's 2nd congressional district."
    },
    {
        id: 5,
        name: "Marjorie Taylor Greene",
        party: "Republican",
        chamber: "House",
        state: "Georgia",
        district: "14",
        photo: "https://picsum.photos/seed/greene/100/100",
        tradingVolume: 980000,
        numberOfTrades: 19,
        performance: -2.3,
        recentTrades: [
            { stock: "GME", action: "Buy", amount: 15000, date: "2025-11-15" },
            { stock: "AMC", action: "Sell", amount: 10000, date: "2025-11-14" },
            { stock: "BB", action: "Buy", amount: 8000, date: "2025-11-13" }
        ],
        topHoldings: ["GME", "AMC", "BB", "NOK", "PLTR"],
        bio: "Representative for Georgia's 14th congressional district."
    },
    {
        id: 6,
        name: "Brian Higgins",
        party: "Democrat",
        chamber: "House",
        state: "New York",
        district: "26",
        photo: "https://picsum.photos/seed/higgins/100/100",
        tradingVolume: 2230000,
        numberOfTrades: 41,
        performance: 9.5,
        recentTrades: [
            { stock: "DIS", action: "Buy", amount: 40000, date: "2025-11-15" },
            { stock: "CMCSA", action: "Sell", amount: 25000, date: "2025-11-14" },
            { stock: "NFLX", action: "Buy", amount: 35000, date: "2025-11-13" }
        ],
        topHoldings: ["DIS", "CMCSA", "NFLX", "T", "VZ"],
        bio: "Representative for New York's 26th congressional district."
    },
    {
        id: 7,
        name: "Ro Khanna",
        party: "Democrat",
        chamber: "House",
        state: "California",
        district: "17",
        photo: "https://picsum.photos/seed/khanna/100/100",
        tradingVolume: 2750000,
        numberOfTrades: 52,
        performance: 18.7,
        recentTrades: [
            { stock: "TSLA", action: "Buy", amount: 80000, date: "2025-11-15" },
            { stock: "NIO", action: "Buy", amount: 30000, date: "2025-11-14" },
            { stock: "LCID", action: "Sell", amount: 20000, date: "2025-11-13" }
        ],
        topHoldings: ["TSLA", "NIO", "LCID", "RIVN", "NKLA"],
        bio: "Representative for California's 17th congressional district, former tech executive."
    },
    {
        id: 8,
        name: "Michael McCaul",
        party: "Republican",
        chamber: "House",
        state: "Texas",
        district: "10",
        photo: "https://picsum.photos/seed/mccaul/100/100",
        tradingVolume: 1890000,
        numberOfTrades: 35,
        performance: 7.2,
        recentTrades: [
            { stock: "LMT", action: "Buy", amount: 50000, date: "2025-11-15" },
            { stock: "BA", action: "Sell", amount: 30000, date: "2025-11-14" },
            { stock: "RTX", action: "Buy", amount: 45000, date: "2025-11-13" }
        ],
        topHoldings: ["LMT", "BA", "RTX", "NOC", "GD"],
        bio: "Chairman of the House Foreign Affairs Committee, representing Texas's 10th district."
    },
    {
        id: 9,
        name: "Richard Blumenthal",
        party: "Democrat",
        chamber: "Senate",
        state: "Connecticut",
        photo: "https://picsum.photos/seed/blumenthal/100/100",
        tradingVolume: 1670000,
        numberOfTrades: 29,
        performance: 5.4,
        recentTrades: [
            { stock: "PFE", action: "Buy", amount: 35000, date: "2025-11-15" },
            { stock: "JNJ", action: "Buy", amount: 40000, date: "2025-11-14" },
            { stock: "UNH", action: "Sell", amount: 25000, date: "2025-11-13" }
        ],
        topHoldings: ["PFE", "JNJ", "UNH", "ABBV", "MRK"],
        bio: "Senator from Connecticut, former Attorney General of Connecticut."
    },
    {
        id: 10,
        name: "Suzan DelBene",
        party: "Democrat",
        chamber: "House",
        state: "Washington",
        district: "1",
        photo: "https://picsum.photos/seed/delbene/100/100",
        tradingVolume: 3420000,
        numberOfTrades: 63,
        performance: 22.1,
        recentTrades: [
            { stock: "MSFT", action: "Buy", amount: 100000, date: "2025-11-15" },
            { stock: "AMZN", action: "Buy", amount: 75000, date: "2025-11-14" },
            { stock: "ADBE", action: "Sell", amount: 40000, date: "2025-11-13" }
        ],
        topHoldings: ["MSFT", "AMZN", "ADBE", "NFLX", "INTC"],
        bio: "Representative for Washington's 1st congressional district, former Microsoft executive."
    },
    {
        id: 11,
        name: "Rob Bresnahan",
        party: "Republican",
        chamber: "House",
        state: "Louisiana",
        district: "4",
        photo: "https://picsum.photos/seed/bresnahan/100/100",
        tradingVolume: 1250000,
        numberOfTrades: 22,
        performance: 4.8,
        recentTrades: [
            { stock: "DE", action: "Buy", amount: 30000, date: "2025-11-15" },
            { stock: "CAT", action: "Sell", amount: 20000, date: "2025-11-14" },
            { stock: "MMM", action: "Buy", amount: 25000, date: "2025-11-13" }
        ],
        topHoldings: ["DE", "CAT", "MMM", "GE", "HON"],
        bio: "Representative for Louisiana's 4th congressional district."
    },
    {
        id: 12,
        name: "David Rouzer",
        party: "Republican",
        chamber: "House",
        state: "North Carolina",
        district: "7",
        photo: "https://picsum.photos/seed/rouzer/100/100",
        tradingVolume: 980000,
        numberOfTrades: 18,
        performance: 3.2,
        recentTrades: [
            { stock: "KMB", action: "Buy", amount: 25000, date: "2025-11-15" },
            { stock: "CL", action: "Sell", amount: 15000, date: "2025-11-14" },
            { stock: "PG", action: "Buy", amount: 20000, date: "2025-11-13" }
        ],
        topHoldings: ["KMB", "CL", "PG", "KO", "PEP"],
        bio: "Representative for North Carolina's 7th congressional district."
    }
];

// Additional traders for loading more
const additionalTraders = [
    {
        id: 13,
        name: "Debbie Wasserman Schultz",
        party: "Democrat",
        chamber: "House",
        state: "Florida",
        district: "23",
        photo: "https://picsum.photos/seed/wasserman/100/100",
        tradingVolume: 1450000,
        numberOfTrades: 26,
        performance: 8.1,
        recentTrades: [
            { stock: "AAPL", action: "Buy", amount: 35000, date: "2025-11-15" },
            { stock: "MSFT", action: "Sell", amount: 20000, date: "2025-11-14" }
        ],
        topHoldings: ["AAPL", "MSFT", "GOOGL", "FB", "TSLA"],
        bio: "Representative for Florida's 23rd congressional district."
    },
    {
        id: 14,
        name: "Kevin McCarthy",
        party: "Republican",
        chamber: "House",
        state: "California",
        district: "20",
        photo: "https://picsum.photos/seed/mccarthy/100/100",
        tradingVolume: 2100000,
        numberOfTrades: 38,
        performance: 10.5,
        recentTrades: [
            { stock: "VZ", action: "Buy", amount: 40000, date: "2025-11-15" },
            { stock: "T", action: "Buy", amount: 35000, date: "2025-11-14" }
        ],
        topHoldings: ["VZ", "T", "CMCSA", "DIS", "NFLX"],
        bio: "House Republican Leader, representing California's 20th congressional district."
    }
];

// Functions to manage trader data
function getTraderById(id) {
    return congressionalTraders.find(trader => trader.id === id);
}

function getTradersByParty(party) {
    return congressionalTraders.filter(trader => trader.party.toLowerCase() === party.toLowerCase());
}

function getTradersByChamber(chamber) {
    return congressionalTraders.filter(trader => trader.chamber.toLowerCase() === chamber.toLowerCase());
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatPercent(value) {
    return `${value >= 0 ? '+' : ''}${value}%`;
}

// Get top performers
function getTopPerformers(count = 5) {
    return [...congressionalTraders]
        .sort((a, b) => b.performance - a.performance)
        .slice(0, count);
}

// Get most active traders
function getMostActive(count = 5) {
    return [...congressionalTraders]
        .sort((a, b) => b.numberOfTrades - a.numberOfTrades)
        .slice(0, count);
}

// Get highest volume traders
function getHighestVolume(count = 5) {
    return [...congressionalTraders]
        .sort((a, b) => b.tradingVolume - a.tradingVolume)
        .slice(0, count);
}