// Comprehensive Plaid Integration for Politrade Pro
// Real-time payment processing with ACH, debit card, and credit card support

class ComprehensivePlaid {
    constructor() {
        this.plaidClient = null;
        this.linkToken = null;
        this.paymentMethods = [];
        this.transactions = [];
        this.isConnected = false;
        this.apiKey = null;
        
        this.init();
    }

    async init() {
        await this.loadPlaidSDK();
        this.loadPaymentMethods();
        this.setupWebhookHandlers();
        this.initializeAPI();
    }

    async loadPlaidSDK() {
        // Load Plaid Link SDK
        return new Promise((resolve, reject) => {
            if (window.Plaid) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async initializeAPI() {
        // Initialize Plaid API with secure configuration
        this.apiKey = await this.getAPIKey();
        this.setupAPIClient();
    }

    async getAPIKey() {
        // In production, this would come from your secure backend
        // For demo, we'll use a sandbox key
        return 'sandbox_key_demo';
    }

    setupAPIClient() {
        // Configure API client for secure communication
        this.apiConfig = {
            env: 'sandbox', // or 'production'
            products: ['auth', 'transactions', 'identity'],
            countryCodes: ['US'],
            language: 'en',
            webhook: 'https://politrade.example.com/webhook'
        };
    }

    // Connect Bank Account
    async connectBankAccount() {
        try {
            const linkToken = await this.generateLinkToken();
            
            const handler = Plaid.create({
                token: linkToken,
                onSuccess: async (public_token, metadata) => {
                    await this.handleBankConnectionSuccess(public_token, metadata);
                },
                onLoad: () => {
                    console.log('Plaid Link loaded');
                },
                onExit: (err, metadata) => {
                    console.log('Plaid Link exited:', err, metadata);
                    if (err) {
                        this.showPlaidError(err.error_message);
                    }
                },
                onEvent: (eventName, metadata) => {
                    console.log('Plaid event:', eventName, metadata);
                    this.logPlaidEvent(eventName, metadata);
                }
            });

            handler.open();
            return true;

        } catch (error) {
            console.error('Bank connection error:', error);
            this.showPlaidError('Failed to connect bank account');
            return false;
        }
    }

    async generateLinkToken() {
        try {
            // In production, this calls your backend
            // For demo, we'll simulate the response
            const response = {
                link_token: 'link-sandbox-' + this.generateRandomToken()
            };
            
            this.linkToken = response.link_token;
            return response.link_token;

        } catch (error) {
            console.error('Link token generation error:', error);
            throw error;
        }
    }

    async handleBankConnectionSuccess(publicToken, metadata) {
        try {
            // Exchange public token for access token (in production, via backend)
            const accessToken = await this.exchangePublicToken(publicToken);
            
            // Save account information
            const paymentMethod = {
                id: this.generatePaymentMethodId(),
                type: 'bank',
                institution: metadata.institution.name,
                accountName: metadata.accounts[0].name,
                accountType: metadata.accounts[0].subtype,
                lastFour: metadata.accounts[0].mask,
                accessToken: accessToken,
                isActive: true,
                isDefault: this.paymentMethods.length === 0,
                addedDate: new Date().toISOString(),
                metadata: metadata
            };

            this.paymentMethods.push(paymentMethod);
            await this.savePaymentMethods();
            
            this.isConnected = true;
            this.showPaymentMethodAdded(paymentMethod);
            
            // Fetch initial transactions
            await this.fetchTransactions(accessToken);
            
            return paymentMethod;

        } catch (error) {
            console.error('Bank connection handling error:', error);
            this.showPlaidError('Failed to complete bank connection');
        }
    }

    async exchangePublicToken(publicToken) {
        // In production, this calls your backend API
        // For demo, we'll simulate the exchange
        return 'access-sandbox-' + this.generateRandomToken();
    }

    // Add Credit/Debit Card
    async addCard(cardData) {
        try {
            // Validate card data
            const validation = this.validateCardData(cardData);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }

            // Tokenize card (via Stripe or similar service)
            const tokenizedCard = await this.tokenizeCard(cardData);
            
            const paymentMethod = {
                id: this.generatePaymentMethodId(),
                type: cardData.type, // 'credit' or 'debit'
                brand: cardData.brand, // 'visa', 'mastercard', etc.
                lastFour: cardData.lastFour,
                expiryMonth: cardData.expiryMonth,
                expiryYear: cardData.expiryYear,
                token: tokenizedCard.id,
                isActive: true,
                isDefault: this.paymentMethods.length === 0,
                addedDate: new Date().toISOString(),
                billingZip: cardData.billingZip,
                metadata: cardData.metadata || {}
            };

            this.paymentMethods.push(paymentMethod);
            await this.savePaymentMethods();
            
            this.showPaymentMethodAdded(paymentMethod);
            return paymentMethod;

        } catch (error) {
            console.error('Card addition error:', error);
            this.showPlaidError('Failed to add card: ' + error.message);
            throw error;
        }
    }

    validateCardData(cardData) {
        // Basic validation
        if (!cardData.number || cardData.number.length < 13) {
            return { isValid: false, error: 'Invalid card number' };
        }
        
        if (!cardData.expiryMonth || !cardData.expiryYear) {
            return { isValid: false, error: 'Invalid expiry date' };
        }
        
        if (!cardData.cvc || cardData.cvc.length < 3) {
            return { isValid: false, error: 'Invalid CVC' };
        }
        
        if (!cardData.billingZip || cardData.billingZip.length < 5) {
            return { isValid: false, error: 'Invalid billing zip code' };
        }

        return { isValid: true };
    }

    async tokenizeCard(cardData) {
        // In production, this would use Stripe Elements or similar
        // For demo, we'll simulate tokenization
        return {
            id: 'card_token_' + this.generateRandomToken(),
            brand: this.detectCardBrand(cardData.number),
            lastFour: cardData.number.slice(-4),
            expiryMonth: cardData.expiryMonth,
            expiryYear: cardData.expiryYear
        };
    }

    detectCardBrand(cardNumber) {
        const number = cardNumber.replace(/\s/g, '');
        
        if (number.startsWith('4')) return 'visa';
        if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
        if (number.startsWith('3')) return 'amex';
        if (number.startsWith('6')) return 'discover';
        
        return 'unknown';
    }

    // Process Payment for Stock Trades
    async processPayment(paymentRequest) {
        try {
            // Encrypt payment data
            const encryptedData = await window.comprehensiveEncryption.encryptPaymentInfo({
                amount: paymentRequest.amount,
                currency: 'USD',
                type: paymentRequest.type, // 'stock_purchase' or 'stock_sale'
                symbol: paymentRequest.symbol,
                shares: paymentRequest.shares,
                timestamp: Date.now()
            });

            // Validate payment method
            const paymentMethod = this.getPaymentMethod(paymentRequest.paymentMethodId);
            if (!paymentMethod || !paymentMethod.isActive) {
                throw new Error('Invalid payment method');
            }

            // Process payment based on type
            let result;
            if (paymentMethod.type === 'bank') {
                result = await this.processACHPayment(paymentRequest, paymentMethod);
            } else if (paymentMethod.type === 'credit' || paymentMethod.type === 'debit') {
                result = await this.processCardPayment(paymentRequest, paymentMethod);
            } else {
                throw new Error('Unsupported payment method type');
            }

            // Record transaction
            await this.recordTransaction({
                ...result,
                encryptedData: encryptedData,
                paymentMethodId: paymentRequest.paymentMethodId,
                timestamp: Date.now()
            });

            return result;

        } catch (error) {
            console.error('Payment processing error:', error);
            throw error;
        }
    }

    async processACHPayment(paymentRequest, paymentMethod) {
        try {
            // Simulate ACH processing
            await this.simulateNetworkDelay(2000 + Math.random() * 3000);

            const result = {
                success: true,
                transactionId: 'ach_' + this.generateTransactionId(),
                amount: paymentRequest.amount,
                status: 'completed',
                processor: 'ach',
                fees: this.calculateACHFees(paymentRequest.amount),
                estimatedSettlement: this.calculateACHSettlement(),
                paymentMethod: {
                    type: 'bank',
                    institution: paymentMethod.institution,
                    lastFour: paymentMethod.lastFour
                }
            };

            this.showPaymentConfirmation(result);
            return result;

        } catch (error) {
            throw new Error('ACH payment failed: ' + error.message);
        }
    }

    async processCardPayment(paymentRequest, paymentMethod) {
        try {
            // Simulate card processing
            await this.simulateNetworkDelay(1000 + Math.random() * 2000);

            const result = {
                success: true,
                transactionId: 'card_' + this.generateTransactionId(),
                amount: paymentRequest.amount,
                status: 'completed',
                processor: 'card',
                fees: this.calculateCardFees(paymentRequest.amount, paymentMethod.type),
                paymentMethod: {
                    type: paymentMethod.type,
                    brand: paymentMethod.brand,
                    lastFour: paymentMethod.lastFour
                }
            };

            this.showPaymentConfirmation(result);
            return result;

        } catch (error) {
            throw new Error('Card payment failed: ' + error.message);
        }
    }

    // ACH Direct Deposit Setup
    async setupDirectDeposit(userId) {
        try {
            if (!this.isConnected) {
                throw new Error('No bank account connected');
            }

            const bankAccount = this.paymentMethods.find(pm => pm.type === 'bank' && pm.isActive);
            if (!bankAccount) {
                throw new Error('No active bank account found');
            }

            // Generate routing and account numbers for display
            const depositInfo = {
                routingNumber: '123456789', // In production, from Plaid
                accountNumber: '****' + bankAccount.lastFour,
                accountType: bankAccount.accountType,
                bankName: bankAccount.institution,
                isVerified: true
            };

            await this.saveDirectDepositInfo(userId, depositInfo);
            this.showDirectDepositSetup(depositInfo);

            return depositInfo;

        } catch (error) {
            console.error('Direct deposit setup error:', error);
            throw error;
        }
    }

    // Fetch Account Transactions
    async fetchTransactions(accessToken, startDate = null, endDate = null) {
        try {
            const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const end = endDate || new Date();

            // In production, this calls Plaid API
            // For demo, we'll simulate transactions
            const transactions = this.generateSampleTransactions(start, end);
            
            this.transactions = [...transactions, ...this.transactions];
            await this.saveTransactions();

            return transactions;

        } catch (error) {
            console.error('Transaction fetch error:', error);
            throw error;
        }
    }

    generateSampleTransactions(startDate, endDate) {
        const transactions = [];
        const daysBetween = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        for (let i = 0; i < Math.min(daysBetween, 20); i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const isDebit = Math.random() > 0.5;
            
            transactions.push({
                id: this.generateTransactionId(),
                date: date.toISOString(),
                name: isDebit ? 'Trade Purchase' : 'Trade Sale',
                amount: isDebit ? -(100 + Math.random() * 5000) : (100 + Math.random() * 5000),
                category: 'investment',
                pending: false
            });
        }
        
        return transactions;
    }

    // UI Helper Functions
    showPaymentMethodAdded(paymentMethod) {
        const message = `✅ ${paymentMethod.type === 'bank' ? 'Bank Account' : 'Card'} Added\n${paymentMethod.institution || paymentMethod.brand} ending in ${paymentMethod.lastFour}`;
        
        this.showNotification(message, 'success');
        this.updatePaymentMethodsUI();
    }

    showPaymentConfirmation(paymentResult) {
        const message = `💳 Payment Processed\nAmount: $${paymentResult.amount.toFixed(2)}\nTransaction ID: ${paymentResult.transactionId}\nStatus: ${paymentResult.status}`;
        
        this.showNotification(message, 'success');
    }

    showPlaidError(error) {
        this.showNotification(`❌ Payment Error: ${error}`, 'error');
    }

    showDirectDepositSetup(depositInfo) {
        const message = `🏦 Direct Deposit Setup\n${depositInfo.bankName}\nAccount: ${depositInfo.accountNumber}\nRouting: ${depositInfo.routingNumber}`;
        
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `plaid-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${message.replace(/\n/g, '<br>')}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    updatePaymentMethodsUI() {
        // Update UI with new payment methods
        const event = new CustomEvent('paymentMethodsUpdated', {
            detail: { paymentMethods: this.paymentMethods }
        });
        document.dispatchEvent(event);
    }

    // Utility Functions
    calculateACHFees(amount) {
        return Math.max(0.25, amount * 0.0008); // $0.25 minimum or 0.08%
    }

    calculateCardFees(amount, cardType) {
        if (cardType === 'debit') {
            return Math.max(0.21, amount * 0.0005); // $0.21 minimum or 0.05%
        } else {
            return Math.max(0.30, amount * 0.029); // $0.30 minimum or 2.9%
        }
    }

    calculateACHSettlement() {
        const settlementDate = new Date();
        settlementDate.setDate(settlementDate.getDate() + 2); // ACH settles in 2 business days
        return settlementDate.toISOString();
    }

    generatePaymentMethodId() {
        return 'pm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateTransactionId() {
        return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateRandomToken() {
        return Math.random().toString(36).substr(2, 16);
    }

    simulateNetworkDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getPaymentMethod(id) {
        return this.paymentMethods.find(pm => pm.id === id);
    }

    // Storage Functions
    async savePaymentMethods() {
        try {
            const encrypted = await window.comprehensiveEncryption.encryptPaymentInfo({
                methods: this.paymentMethods,
                timestamp: Date.now()
            });
            localStorage.setItem('plaid_payment_methods', encrypted);
        } catch (error) {
            console.error('Payment methods save error:', error);
        }
    }

    loadPaymentMethods() {
        const saved = localStorage.getItem('plaid_payment_methods');
        if (saved) {
            try {
                window.comprehensiveEncryption.decryptPaymentInfo(saved).then(data => {
                    this.paymentMethods = data.methods || [];
                    this.isConnected = this.paymentMethods.some(pm => pm.type === 'bank' && pm.isActive);
                });
            } catch (error) {
                console.error('Payment methods load error:', error);
            }
        }
    }

    async saveTransactions() {
        try {
            const encrypted = await window.comprehensiveEncryption.encryptPaymentInfo({
                transactions: this.transactions,
                timestamp: Date.now()
            });
            localStorage.setItem('plaid_transactions', encrypted);
        } catch (error) {
            console.error('Transactions save error:', error);
        }
    }

    async saveDirectDepositInfo(userId, depositInfo) {
        try {
            const encrypted = await window.comprehensiveEncryption.encryptPaymentInfo({
                userId: userId,
                depositInfo: depositInfo,
                timestamp: Date.now()
            });
            localStorage.setItem('direct_deposit_' + userId, encrypted);
        } catch (error) {
            console.error('Direct deposit save error:', error);
        }
    }

    logPlaidEvent(eventName, metadata) {
        // Log Plaid events for security and analytics
        console.log('Plaid Event:', eventName, metadata);
        
        // In production, send to your analytics/security service
        window.comprehensiveEncryption?.logSecurityEvent('plaid_event', {
            eventName,
            metadata,
            timestamp: Date.now()
        });
    }

    setupWebhookHandlers() {
        // Handle webhook events from Plaid
        // In production, this would be handled by your backend
        console.log('Plaid webhook handlers setup complete');
    }

    // Get Payment Methods Summary
    getPaymentMethodsSummary() {
        return {
            totalMethods: this.paymentMethods.length,
            bankAccounts: this.paymentMethods.filter(pm => pm.type === 'bank' && pm.isActive).length,
            cards: this.paymentMethods.filter(pm => (pm.type === 'credit' || pm.type === 'debit') && pm.isActive).length,
            isConnected: this.isConnected,
            defaultMethod: this.paymentMethods.find(pm => pm.isDefault)
        };
    }

    // Remove Payment Method
    async removePaymentMethod(paymentMethodId) {
        try {
            const index = this.paymentMethods.findIndex(pm => pm.id === paymentMethodId);
            if (index === -1) {
                throw new Error('Payment method not found');
            }

            const removedMethod = this.paymentMethods[index];
            this.paymentMethods.splice(index, 1);
            
            await this.savePaymentMethods();
            this.updatePaymentMethodsUI();
            
            this.showNotification(`Payment method ending in ${removedMethod.lastFour} removed`, 'info');
            return true;

        } catch (error) {
            console.error('Payment method removal error:', error);
            this.showNotification('Failed to remove payment method', 'error');
            return false;
        }
    }

    // Set Default Payment Method
    async setDefaultPaymentMethod(paymentMethodId) {
        try {
            const paymentMethod = this.getPaymentMethod(paymentMethodId);
            if (!paymentMethod) {
                throw new Error('Payment method not found');
            }

            // Remove default from all methods
            this.paymentMethods.forEach(pm => pm.isDefault = false);
            
            // Set new default
            paymentMethod.isDefault = true;
            
            await this.savePaymentMethods();
            this.updatePaymentMethodsUI();
            
            this.showNotification(`Default payment method updated`, 'success');
            return true;

        } catch (error) {
            console.error('Default payment method error:', error);
            this.showNotification('Failed to update default payment method', 'error');
            return false;
        }
    }
}

// Initialize Plaid integration
window.comprehensivePlaid = new ComprehensivePlaid();

// Add CSS for notifications
const plaidStyles = `
    @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    .plaid-notification {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.4;
    }
    
    .plaid-notification .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }
    
    .plaid-notification .notification-message {
        flex: 1;
    }
    
    .plaid-notification .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        opacity: 0.8;
    }
    
    .plaid-notification .notification-close:hover {
        opacity: 1;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = plaidStyles;
document.head.appendChild(styleSheet);

console.log('Comprehensive Plaid integration initialized with ACH, debit/credit card support');