// Politrade.com Analytics Dashboard Script
// Congressional Trading Analytics and Visualization

// Initialize analytics dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkUserSession();
    loadAnalyticsData();
    renderCharts();
});

function loadAnalyticsData() {
    // Load all analytics data
    loadTopPerformers();
    loadTopVolume();
    loadMostActive();
    loadPartyComparison();
    updateStatsOverview();
}

function loadTopPerformers() {
    const topPerformers = getTopTradersByPerformance(2025, 10);
    const container = document.getElementById('topPerformers');
    
    container.innerHTML = topPerformers.map((trader, index) => `
        <div class="top-trader-item">
            <div class="top-trader-rank">#${index + 1}</div>
            <div class="top-trader-info">
                <div class="top-trader-name">${trader.name}</div>
                <div class="top-trader-details">${trader.party} - ${trader.state}</div>
            </div>
            <div class="top-trader-performance">
                <div class="performance-value ${trader.recentPerformance >= 0 ? 'positive' : 'negative'}">
                    ${formatPercent(trader.recentPerformance)}
                </div>
                <div style="font-size: 0.85rem; color: #666;">
                    ${trader.numberOfTrades} trades
                </div>
            </div>
        </div>
    `).join('');
}

function loadTopVolume() {
    const topVolume = getHighestVolume(10);
    const container = document.getElementById('topVolume');
    
    container.innerHTML = topVolume.map((trader, index) => `
        <div class="top-trader-item">
            <div class="top-trader-rank">#${index + 1}</div>
            <div class="top-trader-info">
                <div class="top-trader-name">${trader.name}</div>
                <div class="top-trader-details">${trader.party} - ${trader.chamber}</div>
            </div>
            <div class="top-trader-performance">
                <div class="performance-value" style="color: #1e3c72;">
                    ${formatCurrency(trader.tradingVolume)}
                </div>
                <div style="font-size: 0.85rem; color: #666;">
                    ${formatPercent(trader.performance5Year)} 5Y
                </div>
            </div>
        </div>
    `).join('');
}

function loadMostActive() {
    const mostActive = getMostActive(10);
    const container = document.getElementById('mostActive');
    
    container.innerHTML = mostActive.map((trader, index) => `
        <div class="top-trader-item">
            <div class="top-trader-rank">#${index + 1}</div>
            <div class="top-trader-info">
                <div class="top-trader-name">${trader.name}</div>
                <div class="top-trader-details">${trader.state} - ${trader.district ? 'District ' + trader.district : ''}</div>
            </div>
            <div class="top-trader-performance">
                <div class="performance-value" style="color: #2a5298;">
                    ${trader.numberOfTrades}
                </div>
                <div style="font-size: 0.85rem; color: #666;">
                    trades total
                </div>
            </div>
        </div>
    `).join('');
}

function loadPartyComparison() {
    const democrats = allTraders.filter(t => t.party === 'Democrat');
    const republicans = allTraders.filter(t => t.party === 'Republican');
    
    const democratVolume = democrats.reduce((sum, t) => sum + t.tradingVolume, 0);
    const republicanVolume = republicans.reduce((sum, t) => sum + t.tradingVolume, 0);
    
    const democratPerformance = democrats.reduce((sum, t) => sum + (t.performance5Year || 0), 0) / democrats.length;
    const republicanPerformance = republicans.reduce((sum, t) => sum + (t.performance5Year || 0), 0) / republicans.length;
    
    const container = document.getElementById('partyComparison');
    container.innerHTML = `
        <div class="party-stats democrat">
            <h4>🔵 Democrats</h4>
            <div class="party-number">${democrats.length}</div>
            <div>Members</div>
            <div style="margin-top: 1rem; font-size: 1.2rem;">
                <div>${formatCurrency(democratVolume)}</div>
                <div style="font-size: 0.9rem;">Total Volume</div>
            </div>
            <div style="margin-top: 1rem;">
                <strong>${formatPercent(democratPerformance)}</strong>
                <div style="font-size: 0.9rem;">Avg Performance</div>
            </div>
        </div>
        <div class="party-stats republican">
            <h4>🔴 Republicans</h4>
            <div class="party-number">${republicans.length}</div>
            <div>Members</div>
            <div style="margin-top: 1rem; font-size: 1.2rem;">
                <div>${formatCurrency(republicanVolume)}</div>
                <div style="font-size: 0.9rem;">Total Volume</div>
            </div>
            <div style="margin-top: 1rem;">
                <strong>${formatPercent(republicanPerformance)}</strong>
                <div style="font-size: 0.9rem;">Avg Performance</div>
            </div>
        </div>
    `;
}

function updateStatsOverview() {
    const totalVolume = allTraders.reduce((sum, t) => sum + t.tradingVolume, 0);
    const totalTrades = allTraders.reduce((sum, t) => sum + t.numberOfTrades, 0);
    const avgPerformance = allTraders.reduce((sum, t) => sum + (t.performance5Year || 0), 0) / allTraders.length;
    
    document.getElementById('totalTraders').textContent = allTraders.length;
    document.getElementById('totalVolume').textContent = formatCurrency(totalVolume);
    document.getElementById('totalTrades').textContent = totalTrades.toLocaleString();
    document.getElementById('avgPerformance').textContent = formatPercent(avgPerformance);
}

function updateAnalytics(view) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show loading state
    document.getElementById('topPerformers').innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner"></i>
            <p>Loading ${view} data...</p>
        </div>
    `;
    
    // Simulate loading delay and update data
    setTimeout(() => {
        switch(view) {
            case 'performance':
                loadTopPerformers();
                break;
            case 'volume':
                loadTopVolume();
                break;
            case 'families':
                loadTopFamilies();
                break;
            case 'sectors':
                loadTopSectors();
                break;
            default:
                loadTopPerformers();
        }
    }, 500);
}

function loadTopFamilies() {
    const tradersWithFamilies = allTraders.filter(t => t.familyMembers && t.familyMembers.length > 0);
    const sortedByFamilyVolume = tradersWithFamilies
        .map(trader => ({
            ...trader,
            familyVolume: trader.familyMembers.reduce((sum, m) => sum + m.tradingVolume, 0),
            totalFamilyTrades: trader.familyMembers.reduce((sum, m) => sum + m.trades, 0)
        }))
        .sort((a, b) => b.familyVolume - a.familyVolume)
        .slice(0, 10);
    
    const container = document.getElementById('topPerformers');
    container.innerHTML = sortedByFamilyVolume.map((trader, index) => `
        <div class="top-trader-item">
            <div class="top-trader-rank">#${index + 1}</div>
            <div class="top-trader-info">
                <div class="top-trader-name">${trader.name}</div>
                <div class="top-trader-details">${trader.familyMembers.length} family members</div>
            </div>
            <div class="top-trader-performance">
                <div class="performance-value" style="color: #9c27b0;">
                    ${formatCurrency(trader.familyVolume)}
                </div>
                <div style="font-size: 0.85rem; color: #666;">
                    ${trader.totalFamilyTrades} family trades
                </div>
            </div>
        </div>
    `).join('');
}

function loadTopSectors() {
    const sectorData = {};
    
    allTraders.forEach(trader => {
        if (trader.sectorFocus) {
            trader.sectorFocus.forEach(sector => {
                if (!sectorData[sector]) {
                    sectorData[sector] = { traders: 0, totalVolume: 0, count: 0 };
                }
                sectorData[sector].traders++;
                sectorData[sector].totalVolume += trader.tradingVolume;
                sectorData[sector].count++;
            });
        }
    });
    
    const topSectors = Object.entries(sectorData)
        .map(([sector, data]) => ({ sector, ...data }))
        .sort((a, b) => b.totalVolume - a.totalVolume)
        .slice(0, 10);
    
    const container = document.getElementById('topPerformers');
    container.innerHTML = topSectors.map((sector, index) => `
        <div class="top-trader-item">
            <div class="top-trader-rank">#${index + 1}</div>
            <div class="top-trader-info">
                <div class="top-trader-name">${sector.sector}</div>
                <div class="top-trader-details">${sector.traders} traders focused</div>
            </div>
            <div class="top-trader-performance">
                <div class="performance-value" style="color: #ff9800;">
                    ${formatCurrency(sector.totalVolume)}
                </div>
                <div style="font-size: 0.85rem; color: #666;">
                    Total sector volume
                </div>
            </div>
        </div>
    `).join('');
}

function renderCharts() {
    renderTrendsChart();
    renderSectorChart();
}

function renderTrendsChart() {
    const canvas = document.getElementById('trendsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const trends = getTradingTrends('6months');
    
    // Simple line chart
    const padding = 40;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw axes
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw trend line
    ctx.strokeStyle = '#1e3c72';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const maxVolume = Math.max(...trends.map(t => t.recentVolume));
    const stepX = width / (trends.length - 1);
    
    trends.forEach((trend, index) => {
        const x = padding + index * stepX;
        const y = canvas.height - padding - (trend.recentVolume / maxVolume) * height;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // Draw point
        ctx.fillStyle = '#1e3c72';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw label
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(trend.name.substring(0, 8) + '...', x, canvas.height - 20);
    });
    
    ctx.stroke();
    
    // Title
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Trading Volume Trends (Last 6 Months)', canvas.width / 2, 20);
}

function renderSectorChart() {
    const canvas = document.getElementById('sectorChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Sector data
    const sectors = {
        'Technology': 35,
        'Finance': 25,
        'Healthcare': 15,
        'Energy': 12,
        'Defense': 8,
        'Other': 5
    };
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    let currentAngle = -Math.PI / 2;
    const colors = ['#1e3c72', '#2a5298', '#3498db', '#5dade2', '#85c1e9', '#aed6f1'];
    
    Object.entries(sectors).forEach(([sector, percentage], index) => {
        const angle = (percentage / 100) * Math.PI * 2;
        
        // Draw slice
        ctx.fillStyle = colors[index % colors.length];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle);
        ctx.closePath();
        ctx.fill();
        
        // Draw label
        const labelAngle = currentAngle + angle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${percentage}%`, labelX, labelY);
        
        // Draw sector name
        ctx.font = '12px Arial';
        ctx.fillText(sector, labelX, labelY + 15);
        
        currentAngle += angle;
    });
    
    // Title
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Trading Volume by Sector', canvas.width / 2, 20);
}

// Utility functions
function formatCurrency(amount) {
    if (amount >= 1e9) {
        return `$${(amount / 1e9).toFixed(1)}B`;
    } else if (amount >= 1e6) {
        return `$${(amount / 1e6).toFixed(1)}M`;
    } else if (amount >= 1e3) {
        return `$${(amount / 1e3).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
}

function formatPercent(value) {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// Check user session
function checkUserSession() {
    const userData = sessionStorage.getItem('politrade_user');
    if (userData) {
        // User is logged in
        console.log('Analytics dashboard accessed by logged in user');
    }
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
});

console.log('Analytics dashboard loaded successfully! 📊');