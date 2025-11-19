// Politrade.com - Main JavaScript File
// Congressional Stock Trading Platform

// Global variables
let currentUser = null;
let displayedTraders = [];
let allTraders = [...congressionalTraders100];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    checkUserSession();
    loadTraders();
    initializeNavigation();
    initializeFormHandlers();
    startLiveDataUpdates();
    updateLiveStats();
}

// User Session Management
function checkUserSession() {
    const userData = sessionStorage.getItem('politrade_user');
    if (userData) {
        currentUser = JSON.parse(userData);
        updateUserInterface();
    }
}

function updateUserInterface() {
    if (currentUser) {
        document.getElementById('registerLink').style.display = 'none';
        document.getElementById('loginLink').style.display = 'none';
        document.getElementById('profileLink').style.display = 'block';
        document.getElementById('userSessionBar').style.display = 'block';
        document.getElementById('userName').textContent = currentUser.fullName || currentUser.email;
        document.getElementById('dashboard').style.display = 'block';
        loadUserDashboard();
    } else {
        document.getElementById('registerLink').style.display = 'block';
        document.getElementById('loginLink').style.display = 'block';
        document.getElementById('profileLink').style.display = 'none';
        document.getElementById('userSessionBar').style.display = 'none';
        document.getElementById('dashboard').style.display = 'none';
    }
}

function logout() {
    sessionStorage.removeItem('politrade_user');
    currentUser = null;
    updateUserInterface();
    showNotification('You have been logged out successfully', 'success');
}

// Navigation
function initializeNavigation() {
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Active navigation highlighting
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-menu a').forEach(li => {
            li.classList.remove('active');
            if (li.getAttribute('href').slice(1) === current) {
                li.classList.add('active');
            }
        });
    });
}

// Traders Display Functions
function loadTraders() {
    displayedTraders = [...congressionalTraders];
    renderTraders(displayedTraders);
}

function renderTraders(traders) {
    const tradersGrid = document.getElementById('tradersGrid');
    if (!tradersGrid) return;

    tradersGrid.innerHTML = '';
    
    traders.forEach(trader => {
        const traderCard = createTraderCard(trader);
        tradersGrid.appendChild(traderCard);
    });
}

function createTraderCard(trader) {
    const card = document.createElement('div');
    card.className = 'trader-card';
    const familyCount = trader.familyMembers ? trader.familyMembers.length : 0;
    const performance5Year = trader.performance5Year || trader.performance || 0;
    
    card.innerHTML = `
        <div class="trader-header">
            <img src="${trader.photo}" alt="${trader.name}" class="trader-photo">
            <div class="trader-info">
                <h3 class="trader-name">${trader.name}</h3>
                <p class="trader-title">${trader.party} - ${trader.chamber}</p>
                <p class="trader-location">${trader.state}${trader.district ? ' - District ' + trader.district : ''}</p>
                <div class="trader-badges">
                    <span class="badge family-badge" title="Family Members">
                        <i class="fas fa-users"></i> ${familyCount}
                    </span>
                    <span class="badge sector-badge" title="Top Sector">
                        ${trader.sectorFocus ? trader.sectorFocus[0] : 'Mixed'}
                    </span>
                </div>
            </div>
        </div>
        <div class="trader-stats">
            <div class="stat">
                <span class="stat-value">${formatCurrency(trader.tradingVolume)}</span>
                <span class="stat-label">5Y Volume</span>
            </div>
            <div class="stat">
                <span class="stat-value">${trader.numberOfTrades}</span>
                <span class="stat-label">Total Trades</span>
            </div>
            <div class="stat">
                <span class="stat-value ${performance5Year >= 0 ? 'positive' : 'negative'}">${formatPercent(performance5Year)}</span>
                <span class="stat-label">5Y Performance</span>
            </div>
        </div>
        <div class="trader-recent-trades">
            <h4>Recent Trades</h4>
            <div class="recent-trades-list">
                ${trader.recentTrades.slice(0, 3).map(trade => `
                    <div class="trade-item ${trade.action.toLowerCase()}">
                        <span class="trade-stock">${trade.stock}</span>
                        <span class="trade-action">${trade.action}</span>
                        <span class="trade-amount">${formatCurrency(trade.amount)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        ${familyCount > 0 ? `
        <div class="family-summary">
            <h4>Family Trading</h4>
            <p>${familyCount} family members • ${formatCurrency(trader.familyMembers.reduce((sum, m) => sum + m.tradingVolume, 0))} volume</p>
        </div>
        ` : ''}
        <div class="trader-actions">
            <button class="btn btn-primary" onclick="viewTraderDetails(${trader.id})">View Details</button>
            <button class="btn btn-secondary" onclick="view5YearHistory(${trader.id})">5Y History</button>
            <button class="btn btn-secondary" onclick="addToWatchlist(${trader.id})">
                <i class="fas fa-eye"></i> Watch
            </button>
        </div>
    `;
    return card;
}

// Filter and Search Functions
function filterTraders() {
    const partyFilter = document.getElementById('partyFilter').value;
    const chamberFilter = document.getElementById('chamberFilter').value;
    
    displayedTraders = allTraders.filter(trader => {
        const partyMatch = partyFilter === 'all' || trader.party.toLowerCase() === partyFilter;
        const chamberMatch = chamberFilter === 'all' || trader.chamber.toLowerCase() === chamberFilter;
        return partyMatch && chamberMatch;
    });
    
    renderTraders(displayedTraders);
}

function sortTraders() {
    const sortBy = document.getElementById('sortBy').value;
    
    displayedTraders.sort((a, b) => {
        switch(sortBy) {
            case 'volume':
                return b.tradingVolume - a.tradingVolume;
            case 'trades':
                return b.numberOfTrades - a.numberOfTrades;
            case 'performance':
                return b.performance - a.performance;
            default:
                return 0;
        }
    });
    
    renderTraders(displayedTraders);
}

function searchTraders() {
    const searchTerm = document.getElementById('searchTrader').value.toLowerCase();
    
    if (!searchTerm) {
        renderTraders(displayedTraders);
        return;
    }
    
    const filtered = displayedTraders.filter(trader => 
        trader.name.toLowerCase().includes(searchTerm) ||
        trader.state.toLowerCase().includes(searchTerm) ||
        trader.party.toLowerCase().includes(searchTerm) ||
        trader.topHoldings.some(holding => holding.toLowerCase().includes(searchTerm))
    );
    
    renderTraders(filtered);
}

function loadMoreTraders() {
    const newTraders = additionalTraders.slice(0, 2);
    allTraders.push(...newTraders);
    displayedTraders = [...allTraders];
    renderTraders(displayedTraders);
    
    // Remove the load more button if no more traders
    if (allTraders.length >= 14) {
        document.querySelector('.load-more-container').style.display = 'none';
    }
}

// Trader Details
function viewTraderDetails(traderId) {
    const trader = getTraderById(traderId);
    if (!trader) return;
    
    const familyAnalysis = getFamilyTradingAnalysis(traderId);
    const sectorAnalysis = getSectorAnalysis(traderId);
    const performance5Year = trader.performance5Year || trader.performance || 0;
    
    // Create modal with trader details
    const modal = document.createElement('div');
    modal.className = 'trader-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${trader.name} - Complete Trading Profile</h2>
                <button class="close-btn" onclick="this.closest('.trader-details-modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="trader-detail-info">
                    <img src="${trader.photo}" alt="${trader.name}" class="detail-photo">
                    <div class="detail-info">
                        <p><strong>Party:</strong> ${trader.party}</p>
                        <p><strong>Chamber:</strong> ${trader.chamber}</p>
                        <p><strong>State:</strong> ${trader.state}${trader.district ? ' - District ' + trader.district : ''}</p>
                        <p><strong>Bio:</strong> ${trader.bio}</p>
                        <p><strong>Sector Focus:</strong> ${trader.sectorFocus ? trader.sectorFocus.join(', ') : 'Mixed'}</p>
                    </div>
                </div>
                <div class="trader-detail-stats">
                    <div class="detail-stat">
                        <h3>${formatCurrency(trader.tradingVolume)}</h3>
                        <p>5Y Volume</p>
                    </div>
                    <div class="detail-stat">
                        <h3>${trader.numberOfTrades}</h3>
                        <p>5Y Trades</p>
                    </div>
                    <div class="detail-stat">
                        <h3 class="${performance5Year >= 0 ? 'positive' : 'negative'}">${formatPercent(performance5Year)}</h3>
                        <p>5Y Performance</p>
                    </div>
                </div>
                
                ${familyAnalysis ? `
                <div class="family-analysis">
                    <h3>Family Trading Analysis</h3>
                    <div class="family-stats">
                        <div class="family-stat-item">
                            <span class="stat-label">Family Members:</span>
                            <span class="stat-value">${familyAnalysis.memberCount}</span>
                        </div>
                        <div class="family-stat-item">
                            <span class="stat-label">Family Volume:</span>
                            <span class="stat-value">${formatCurrency(familyAnalysis.familyVolume)}</span>
                        </div>
                        <div class="family-stat-item">
                            <span class="stat-label">Family Percentage:</span>
                            <span class="stat-value">${familyAnalysis.familyPercentage}%</span>
                        </div>
                    </div>
                    <div class="family-members">
                        <h4>Family Members Activity</h4>
                        ${trader.familyMembers.map(member => `
                            <div class="family-member">
                                <strong>${member.name}</strong> (${member.relationship})
                                <span>${formatCurrency(member.tradingVolume)} volume, ${member.trades} trades</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${sectorAnalysis && sectorAnalysis.length > 0 ? `
                <div class="sector-analysis">
                    <h3>Sector Analysis (5 Years)</h3>
                    <div class="sector-breakdown">
                        ${sectorAnalysis.slice(0, 5).map(sector => `
                            <div class="sector-item">
                                <div class="sector-header">
                                    <strong>${sector.sector}</strong>
                                    <span class="sector-percentage">${sector.percentage}%</span>
                                </div>
                                <div class="sector-stats">
                                    <span>${formatCurrency(sector.volume)}</span>
                                    <span>${sector.trades} trades</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="top-holdings">
                    <h3>Top Holdings</h3>
                    <div class="holdings-list">
                        ${trader.topHoldings.map(holding => `<span class="holding-tag">${holding}</span>`).join('')}
                    </div>
                </div>
                <div class="all-trades">
                    <h3>Recent Trades</h3>
                    <table class="trades-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Stock</th>
                                <th>Action</th>
                                <th>Amount</th>
                                <th>Price</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${trader.recentTrades.map(trade => `
                                <tr class="${trade.action.toLowerCase()}">
                                    <td>${trade.date}</td>
                                    <td>${trade.stock}</td>
                                    <td>${trade.action}</td>
                                    <td>${formatCurrency(trade.amount)}</td>
                                    <td>$${trade.price ? trade.price.toFixed(2) : 'N/A'}</td>
                                    <td>${formatCurrency(trade.amount * (trade.price || 100))}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// View 5-Year History
function view5YearHistory(traderId) {
    const trader = getTraderById(traderId);
    if (!trader || !trader.fiveYearHistory) {
        showNotification('No historical data available for this trader', 'info');
        return;
    }
    
    const performanceHistory = getTraderPerformanceHistory(traderId);
    
    const modal = document.createElement('div');
    modal.className = 'trader-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${trader.name} - 5 Year Trading History</h2>
                <button class="close-btn" onclick="this.closest('.trader-details-modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="history-overview">
                    <h3>Performance Overview (2020-2025)</h3>
                    <div class="yearly-performance">
                        ${performanceHistory.map(year => `
                            <div class="year-data">
                                <h4>${year.year}</h4>
                                <div class="year-stats">
                                    <p><strong>Volume:</strong> ${formatCurrency(year.totalVolume)}</p>
                                    <p><strong>Trades:</strong> ${year.trades.length}</p>
                                    <p><strong>Buy Volume:</strong> ${formatCurrency(year.buyVolume)}</p>
                                    <p><strong>Sell Volume:</strong> ${formatCurrency(year.sellVolume)}</p>
                                    <p><strong>Net:</strong> ${formatCurrency(year.sellVolume - year.buyVolume)}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="historical-trades">
                    <h3>All Historical Trades (Last 50)</h3>
                    <div class="trades-table-container">
                        <table class="trades-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Stock</th>
                                    <th>Action</th>
                                    <th>Amount</th>
                                    <th>Price</th>
                                    <th>Value</th>
                                    <th>Sector</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${trader.fiveYearHistory.slice(0, 50).map(trade => `
                                    <tr class="${trade.action.toLowerCase()}">
                                        <td>${trade.date}</td>
                                        <td>${trade.stock}</td>
                                        <td>${trade.action}</td>
                                        <td>${formatCurrency(trade.amount)}</td>
                                        <td>$${trade.price.toFixed(2)}</td>
                                        <td>${formatCurrency(trade.value)}</td>
                                        <td><span class="sector-tag">${trade.sector}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ${trader.fiveYearHistory.length > 50 ? `
                        <p class="trades-note">Showing 50 of ${trader.fiveYearHistory.length} total trades</p>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Watchlist Management
function addToWatchlist(traderId) {
    if (!currentUser) {
        showNotification('Please create an account to add traders to your watchlist', 'error');
        return;
    }
    
    let watchlist = JSON.parse(localStorage.getItem('politrade_watchlist') || '[]');
    if (!watchlist.includes(traderId)) {
        watchlist.push(traderId);
        localStorage.setItem('politrade_watchlist', JSON.stringify(watchlist));
        showNotification('Trader added to watchlist', 'success');
    } else {
        showNotification('Trader already in watchlist', 'info');
    }
}

function getWatchlist() {
    return JSON.parse(localStorage.getItem('politrade_watchlist') || '[]');
}

// User Dashboard
function loadUserDashboard() {
    if (!currentUser) return;
    
    loadWatchlistData();
    loadUserAlerts();
    loadPerformanceChart();
}

function loadWatchlistData() {
    const watchlistIds = getWatchlist();
    const watchlistContainer = document.getElementById('watchlist');
    if (!watchlistContainer) return;
    
    if (watchlistIds.length === 0) {
        watchlistContainer.innerHTML = '<p>No traders in your watchlist yet</p>';
        return;
    }
    
    const watchlistTraders = watchlistIds.map(id => getTraderById(id)).filter(Boolean);
    watchlistContainer.innerHTML = watchlistTraders.map(trader => `
        <div class="watchlist-item">
            <img src="${trader.photo}" alt="${trader.name}" class="watchlist-photo">
            <div class="watchlist-info">
                <strong>${trader.name}</strong>
                <span class="${trader.performance >= 0 ? 'positive' : 'negative'}">${formatPercent(trader.performance)}</span>
            </div>
        </div>
    `).join('');
}

function loadUserAlerts() {
    const alertsContainer = document.getElementById('alerts');
    if (!alertsContainer) return;
    
    const sampleAlerts = [
        { type: 'buy', trader: 'Nancy Pelosi', stock: 'NVDA', time: '2 hours ago' },
        { type: 'sell', trader: 'Josh Gottheimer', stock: 'AAPL', time: '4 hours ago' },
        { type: 'buy', trader: 'Suzan DelBene', stock: 'MSFT', time: '6 hours ago' }
    ];
    
    alertsContainer.innerHTML = sampleAlerts.map(alert => `
        <div class="alert-item ${alert.type}">
            <i class="fas fa-${alert.type === 'buy' ? 'arrow-up' : 'arrow-down'}"></i>
            <div class="alert-content">
                <strong>${alert.trader}</strong> ${alert.type} ${alert.stock}
                <small>${alert.time}</small>
            </div>
        </div>
    `).join('');
}

function loadPerformanceChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    // Simple line chart simulation
    const data = [100, 105, 103, 108, 112, 109, 115, 118];
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e3c72';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const stepX = canvas.width / (data.length - 1);
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue;
    
    data.forEach((value, index) => {
        const x = index * stepX;
        const y = canvas.height - ((value - minValue) / range) * canvas.height * 0.8 - 10;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
}

// Live Data Updates
function startLiveDataUpdates() {
    // Update live stats every 30 seconds
    setInterval(updateLiveStats, 30000);
    
    // Update trades every minute
    setInterval(updateTrades, 60000);
}

function updateLiveStats() {
    // Simulate live data updates
    const tradesVolume = document.getElementById('liveTrades');
    const activeTraders = document.getElementById('activeTraders');
    const lastUpdate = document.getElementById('lastUpdate');
    
    if (tradesVolume) {
        const currentVolume = parseFloat(tradesVolume.textContent.replace('$', '').replace('M', ''));
        const newVolume = currentVolume + (Math.random() * 0.5 - 0.1);
        tradesVolume.textContent = `$${newVolume.toFixed(1)}M`;
    }
    
    if (activeTraders) {
        const currentActive = parseInt(activeTraders.textContent);
        const newActive = currentActive + Math.floor(Math.random() * 5 - 2);
        activeTraders.textContent = Math.max(40, Math.min(60, newActive));
    }
    
    if (lastUpdate) {
        lastUpdate.textContent = 'Live';
    }
}

function updateTrades() {
    // Simulate adding new trades
    const traders = document.querySelectorAll('.trader-card');
    if (traders.length > 0) {
        const randomTrader = traders[Math.floor(Math.random() * traders.length)];
        const recentTrades = randomTrader.querySelector('.recent-trades-list');
        
        // Add a pulse animation to show update
        randomTrader.style.animation = 'pulse 1s ease-in-out';
        setTimeout(() => {
            randomTrader.style.animation = '';
        }, 1000);
    }
}

// Form Handlers
function initializeFormHandlers() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Check disclaimer acknowledgment first
            const acknowledgment = disclaimerManager.getAcknowledgment();
            if (!acknowledgment || !disclaimerManager.isValidAcknowledgment(acknowledgment)) {
                showNotification('You must acknowledge the stock trading disclaimer before submitting this form.', 'error');
                disclaimerManager.showDisclaimerModal();
                return;
            }
            
            // Get form data
            const formData = new FormData(this);
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const subject = this.querySelector('input[placeholder="Investment Focus"]').value;
            const message = this.querySelector('textarea').value;
            
            // Simple validation
            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Add disclaimer acknowledgment to form data
            const submissionData = {
                name,
                email,
                subject,
                message,
                disclaimerAcknowledged: acknowledgment.acknowledged,
                disclaimerTimestamp: acknowledgment.timestamp,
                submittedAt: new Date().toISOString()
            };
            
            console.log('Form submission with disclaimer:', submissionData);
            
            // Simulate form submission
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            this.reset();
        });
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        min-width: 300px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: 10px;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Utility Functions
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

// Parallax Effect for Hero Section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    if (hero && heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - scrolled / 800;
    }
});

// Advanced analytics functions for expanded database
function getTraderPerformanceHistory(traderId) {
    const trader = getTraderById(traderId);
    if (!trader || !trader.fiveYearHistory) return [];
    
    // Group trades by year
    const yearlyData = {};
    trader.fiveYearHistory.forEach(trade => {
        const year = new Date(trade.date).getFullYear();
        if (!yearlyData[year]) {
            yearlyData[year] = {
                year: year,
                totalVolume: 0,
                trades: [],
                buyVolume: 0,
                sellVolume: 0,
                sectors: {}
            };
        }
        
        yearlyData[year].totalVolume += trade.value;
        yearlyData[year].trades.push(trade);
        
        if (trade.action === 'Buy') {
            yearlyData[year].buyVolume += trade.value;
        } else {
            yearlyData[year].sellVolume += trade.value;
        }
        
        if (!yearlyData[year].sectors[trade.sector]) {
            yearlyData[year].sectors[trade.sector] = 0;
        }
        yearlyData[year].sectors[trade.sector] += trade.value;
    });
    
    return Object.values(yearlyData);
}

function getFamilyTradingAnalysis(traderId) {
    const trader = getTraderById(traderId);
    if (!trader || !trader.familyMembers) return null;
    
    const familyVolume = trader.familyMembers.reduce((sum, member) => sum + member.tradingVolume, 0);
    const totalVolume = trader.tradingVolume + familyVolume;
    
    return {
        traderVolume: trader.tradingVolume,
        familyVolume: familyVolume,
        totalVolume: totalVolume,
        familyPercentage: (familyVolume / totalVolume * 100).toFixed(1),
        memberCount: trader.familyMembers.length,
        mostActiveMember: trader.familyMembers.reduce((max, member) => 
            member.tradingVolume > max.tradingVolume ? member : max, trader.familyMembers[0])
    };
}

function getSectorAnalysis(traderId) {
    const trader = getTraderById(traderId);
    if (!trader || !trader.fiveYearHistory) return null;
    
    const sectors = {};
    trader.fiveYearHistory.forEach(trade => {
        if (!sectors[trade.sector]) {
            sectors[trade.sector] = {
                volume: 0,
                trades: 0,
                buys: 0,
                sells: 0
            };
        }
        
        sectors[trade.sector].volume += trade.value;
        sectors[trade.sector].trades += 1;
        
        if (trade.action === 'Buy') {
            sectors[trade.sector].buys += 1;
        } else {
            sectors[trade.sector].sells += 1;
        }
    });
    
    return Object.entries(sectors)
        .map(([sector, data]) => ({
            sector,
            ...data,
            percentage: ((data.volume / trader.tradingVolume) * 100).toFixed(1)
        }))
        .sort((a, b) => b.volume - a.volume);
}

function getTopTradersByPerformance(year = 2025, count = 10) {
    return allTraders
        .map(trader => ({
            ...trader,
            recentPerformance: calculateRecentPerformance(trader, year)
        }))
        .sort((a, b) => b.recentPerformance - a.recentPerformance)
        .slice(0, count);
}

function calculateRecentPerformance(trader, year) {
    if (!trader.fiveYearHistory) return trader.performance5Year;
    
    const yearTrades = trader.fiveYearHistory.filter(trade => 
        new Date(trade.date).getFullYear() === year
    );
    
    if (yearTrades.length === 0) return 0;
    
    // Simple performance calculation based on buy/sell patterns
    const buyVolume = yearTrades.filter(t => t.action === 'Buy').reduce((sum, t) => sum + t.value, 0);
    const sellVolume = yearTrades.filter(t => t.action === 'Sell').reduce((sum, t) => sum + t.value, 0);
    
    return ((sellVolume - buyVolume) / buyVolume * 100) || 0;
}

function getTradingTrends(period = '6months') {
    const endDate = new Date();
    const startDate = new Date();
    
    switch(period) {
        case '3months':
            startDate.setMonth(endDate.getMonth() - 3);
            break;
        case '6months':
            startDate.setMonth(endDate.getMonth() - 6);
            break;
        case '1year':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
        default:
            startDate.setMonth(endDate.getMonth() - 6);
    }
    
    const trends = allTraders.map(trader => {
        const recentTrades = trader.fiveYearHistory ? trader.fiveYearHistory.filter(trade => 
            new Date(trade.date) >= startDate && new Date(trade.date) <= endDate
        ) : [];
        
        return {
            name: trader.name,
            recentTradeCount: recentTrades.length,
            recentVolume: recentTrades.reduce((sum, trade) => sum + trade.value, 0),
            party: trader.party,
            chamber: trader.chamber
        };
    });
    
    return trends.sort((a, b) => b.recentVolume - a.recentVolume).slice(0, 20);
}

console.log('Politrade.com website loaded successfully! 📈');
console.log(`Database expanded to ${allTraders.length} congressional traders with 5-year history`);