// Comprehensive Trading Engine for Politrade Pro
// Real-time stock trading with one-click execution

class ComprehensiveTradingEngine {
    constructor() {
        this.userPortfolio = [];
        this.transactionHistory = [];
        this.watchlist = [];
        this.realTimePrices = new Map();
        this.tradeQueue = [];
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        this.loadUserPortfolio();
        this.startRealTimePriceUpdates();
        this.setupTradeProcessing();
    }

    loadUserPortfolio() {
        // Load user's existing portfolio from localStorage
        const saved = localStorage.getItem('userPortfolio');
        if (saved) {
            this.userPortfolio = JSON.parse(saved);
        } else {
            this.userPortfolio = this.getDefaultPortfolio();
        }
    }

    getDefaultPortfolio() {
        return [
            { symbol: 'CASH', shares: 1, value: 100000, costBasis: 100000 },
            { symbol: 'SPY', shares: 100, value: 45000, costBasis: 42000 },
            { symbol: 'VOO', shares: 50, value: 20000, costBasis: 19000 }
        ];
    }

    startRealTimePriceUpdates() {
        // Simulate real-time price updates every 5 seconds
        setInterval(() => {
            this.updateStockPrices();
            this.notifyPriceChanges();
        }, 5000);
    }

    updateStockPrices() {
        const stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'NFLX', 'JPM', 'BAC'];
        
        stocks.forEach(symbol => {
            const currentPrice = this.realTimePrices.get(symbol) || this.getInitialPrice(symbol);
            const change = (Math.random() - 0.5) * 2; // ±1% change
            const newPrice = currentPrice * (1 + change / 100);
            
            this.realTimePrices.set(symbol, {
                price: newPrice,
                change: change,
                timestamp: Date.now()
            });
        });
    }

    getInitialPrice(symbol) {
        const prices = {
            'AAPL': 178.25,
            'MSFT': 378.50,
            'GOOGL': 138.90,
            'AMZN': 150.10,
            'NVDA': 145.50,
            'META': 271.00,
            'TSLA': 325.80,
            'NFLX': 369.00,
            'JPM': 198.50,
            'BAC': 37.25
        };
        return prices[symbol] || 100;
    }

    // One-Click Trading Functions
    async executeOneClickTrade(symbol, action, shares, traderId = null) {
        try {
            const price = this.getRealTimePrice(symbol);
            const totalValue = price * shares;
            
            // Validate user has sufficient funds/shares
            const validation = await this.validateTrade(symbol, action, shares, totalValue);
            if (!validation.valid) {
                throw new Error(validation.message);
            }

            // Create trade order
            const order = {
                id: this.generateOrderId(),
                symbol: symbol,
                action: action, // 'buy' or 'sell'
                shares: shares,
                price: price,
                totalValue: totalValue,
                timestamp: Date.now(),
                status: 'pending',
                copiedFrom: traderId,
                userId: this.getCurrentUserId()
            };

            // Queue for processing
            this.tradeQueue.push(order);
            
            // Process immediately for one-click trading
            const result = await this.processTrade(order);
            
            if (result.success) {
                this.recordTransaction(result);
                this.updatePortfolio(result);
                this.showTradeConfirmation(result);
                
                // If copied from a trader, show attribution
                if (traderId) {
                    this.showTraderAttribution(traderId, symbol, action, shares);
                }
                
                return result;
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            this.showTradeError(error.message);
            throw error;
        }
    }

    async validateTrade(symbol, action, shares, totalValue) {
        const cashPosition = this.userPortfolio.find(p => p.symbol === 'CASH');
        
        if (action === 'buy') {
            if (cashPosition.value < totalValue) {
                return { valid: false, message: 'Insufficient funds for this trade' };
            }
        } else if (action === 'sell') {
            const position = this.userPortfolio.find(p => p.symbol === symbol);
            if (!position || position.shares < shares) {
                return { valid: false, message: 'Insufficient shares for this trade' };
            }
        }
        
        return { valid: true };
    }

    async processTrade(order) {
        // Simulate trade execution with realistic delays
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));
        
        // Random success rate (98% success)
        if (Math.random() > 0.02) {
            order.status = 'executed';
            order.executedPrice = order.price * (1 + (Math.random() - 0.5) * 0.001); // ±0.05% slippage
            order.executedValue = order.executedPrice * order.shares;
            order.commission = Math.max(1, order.executedValue * 0.001); // $1 minimum or 0.1%
            
            return { success: true, order: order };
        } else {
            order.status = 'failed';
            order.error = 'Trade execution failed - market conditions';
            return { success: false, error: order.error, order: order };
        }
    }

    updatePortfolio(tradeResult) {
        const order = tradeResult.order;
        
        if (order.action === 'buy') {
            // Update cash position
            const cashPosition = this.userPortfolio.find(p => p.symbol === 'CASH');
            cashPosition.value -= (order.executedValue + order.commission);
            
            // Add or update stock position
            const existingPosition = this.userPortfolio.find(p => p.symbol === order.symbol);
            if (existingPosition) {
                const totalShares = existingPosition.shares + order.shares;
                const totalCost = (existingPosition.shares * existingPosition.costBasis) + (order.executedValue + order.commission);
                existingPosition.shares = totalShares;
                existingPosition.value = totalShares * order.executedPrice;
                existingPosition.costBasis = totalCost / totalShares;
            } else {
                this.userPortfolio.push({
                    symbol: order.symbol,
                    shares: order.shares,
                    value: order.executedValue,
                    costBasis: (order.executedValue + order.commission) / order.shares
                });
            }
            
        } else if (order.action === 'sell') {
            // Update stock position
            const position = this.userPortfolio.find(p => p.symbol === order.symbol);
            if (position) {
                const remainingShares = position.shares - order.shares;
                if (remainingShares > 0) {
                    position.shares = remainingShares;
                    position.value = remainingShares * order.executedPrice;
                } else {
                    // Remove position completely
                    const index = this.userPortfolio.indexOf(position);
                    this.userPortfolio.splice(index, 1);
                }
            }
            
            // Update cash position
            const cashPosition = this.userPortfolio.find(p => p.symbol === 'CASH');
            cashPosition.value += (order.executedValue - order.commission);
        }
        
        // Save to localStorage
        localStorage.setItem('userPortfolio', JSON.stringify(this.userPortfolio));
    }

    recordTransaction(tradeResult) {
        const order = tradeResult.order;
        
        this.transactionHistory.unshift({
            id: order.id,
            symbol: order.symbol,
            action: order.action,
            shares: order.shares,
            price: order.executedPrice,
            value: order.executedValue,
            commission: order.commission,
            timestamp: order.timestamp,
            status: order.status,
            copiedFrom: order.copiedFrom
        });
        
        // Keep only last 100 transactions
        if (this.transactionHistory.length > 100) {
            this.transactionHistory = this.transactionHistory.slice(0, 100);
        }
        
        localStorage.setItem('transactionHistory', JSON.stringify(this.transactionHistory));
    }

    // Copy Trader Portfolio Functions
    async copyTraderPortfolio(traderId) {
        try {
            const trader = window.comprehensiveTradersData.find(t => t.id === traderId);
            if (!trader || !trader.currentPortfolio) {
                throw new Error('Trader portfolio not available');
            }
            
            const results = [];
            const portfolio = trader.currentPortfolio.slice(0, 5); // Copy top 5 positions
            
            for (const position of portfolio) {
                try {
                    const shares = Math.min(position.shares, 100); // Limit to 100 shares max
                    const result = await this.executeOneClickTrade(
                        position.stock, 
                        'buy', 
                        shares, 
                        traderId
                    );
                    results.push(result);
                    
                    // Small delay between trades
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                } catch (error) {
                    console.error(`Failed to copy ${position.stock}:`, error.message);
                }
            }
            
            this.showCopyResults(results, trader.name);
            return results;
            
        } catch (error) {
            this.showTradeError(error.message);
            throw error;
        }
    }

    // Quick Trade from Recent Activity
    async executeQuickTrade(traderId, symbol, suggestedAction, suggestedShares) {
        // Execute trade with pre-filled trader data
        return await this.executeOneClickTrade(symbol, suggestedAction, suggestedShares, traderId);
    }

    // Get real-time price
    getRealTimePrice(symbol) {
        const priceData = this.realTimePrices.get(symbol);
        return priceData ? priceData.price : this.getInitialPrice(symbol);
    }

    // Portfolio Analytics
    getPortfolioValue() {
        return this.userPortfolio.reduce((total, position) => total + position.value, 0);
    }

    getPortfolioPerformance() {
        const totalValue = this.getPortfolioValue();
        const totalCost = this.userPortfolio.reduce((total, position) => {
            return total + (position.shares * position.costBasis);
        }, 0);
        
        return {
            totalReturn: totalValue - totalCost,
            totalReturnPercent: ((totalValue - totalCost) / totalCost) * 100,
            dayChange: this.calculateDayChange(),
            totalValue: totalValue
        };
    }

    calculateDayChange() {
        let totalChange = 0;
        
        this.userPortfolio.forEach(position => {
            if (position.symbol !== 'CASH') {
                const priceData = this.realTimePrices.get(position.symbol);
                if (priceData) {
                    const previousValue = position.value / (1 + priceData.change / 100);
                    totalChange += position.value - previousValue;
                }
            }
        });
        
        return totalChange;
    }

    // UI Helper Functions
    showTradeConfirmation(tradeResult) {
        const order = tradeResult.order;
        const message = `✅ Trade Executed!\n${order.action.toUpperCase()} ${order.shares} shares of ${order.symbol}\n@ $${order.executedPrice.toFixed(2)}\nTotal: $${order.executedValue.toFixed(2)}`;
        
        this.showNotification(message, 'success');
    }

    showTraderAttribution(traderId, symbol, action, shares) {
        const trader = window.comprehensiveTradersData.find(t => t.id === traderId);
        if (trader) {
            const message = `📊 Copied from ${trader.name}\n${action.toUpperCase()} ${shares} shares of ${symbol}`;
            this.showNotification(message, 'info');
        }
    }

    showCopyResults(results, traderName) {
        const successful = results.filter(r => r.success).length;
        const message = `📋 Copied ${successful}/${results.length} trades from ${traderName}`;
        this.showNotification(message, successful === results.length ? 'success' : 'warning');
    }

    showTradeError(error) {
        this.showNotification(`❌ Trade Failed: ${error}`, 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `trade-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${message.replace(/\n/g, '<br>')}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Utility Functions
    generateOrderId() {
        return 'TRD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    getCurrentUserId() {
        return 'current-user'; // In real app, get from authentication
    }

    setupTradeProcessing() {
        // Process queued trades
        setInterval(() => {
            if (this.tradeQueue.length > 0 && !this.isProcessing) {
                this.processTradeQueue();
            }
        }, 1000);
    }

    async processTradeQueue() {
        this.isProcessing = true;
        
        while (this.tradeQueue.length > 0) {
            const order = this.tradeQueue.shift();
            try {
                await this.processTrade(order);
            } catch (error) {
                console.error('Trade processing error:', error);
            }
        }
        
        this.isProcessing = false;
    }

    notifyPriceChanges() {
        // Check for significant price changes on user's portfolio
        this.userPortfolio.forEach(position => {
            if (position.symbol !== 'CASH') {
                const priceData = this.realTimePrices.get(position.symbol);
                if (priceData && Math.abs(priceData.change) > 2) {
                    const message = `${position.symbol}: ${priceData.change > 0 ? '📈' : '📉'} ${priceData.change.toFixed(2)}%`;
                    this.showNotification(message, priceData.change > 0 ? 'success' : 'warning');
                }
            }
        });
    }

    // Get transaction history
    getTransactionHistory() {
        return this.transactionHistory;
    }

    // Get portfolio summary
    getPortfolioSummary() {
        const performance = this.getPortfolioPerformance();
        const positions = this.userPortfolio.filter(p => p.symbol !== 'CASH');
        
        return {
            totalValue: performance.totalValue,
            totalReturn: performance.totalReturn,
            totalReturnPercent: performance.totalReturnPercent,
            dayChange: performance.dayChange,
            positions: positions.map(p => ({
                symbol: p.symbol,
                shares: p.shares,
                value: p.value,
                costBasis: p.costBasis,
                unrealizedPL: p.value - (p.shares * p.costBasis),
                unrealizedPLPercent: ((p.value - (p.shares * p.costBasis)) / (p.shares * p.costBasis)) * 100
            })),
            cash: this.userPortfolio.find(p => p.symbol === 'CASH').value
        };
    }
}

// Initialize trading engine
window.comprehensiveTradingEngine = new ComprehensiveTradingEngine();

// Add CSS for notifications
const notificationStyles = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .trade-notification {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.4;
    }
    
    .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }
    
    .notification-message {
        flex: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        opacity: 0.8;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

console.log('Comprehensive Trading Engine initialized with one-click trading capabilities');