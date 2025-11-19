// Comprehensive 256-Bit Encryption System for Politrade Pro
// AES-256 encryption for all sensitive data

class ComprehensiveEncryption {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
        this.ivLength = 12; // 96 bits for GCM
        this.saltLength = 16;
        this.tagLength = 16;
        this.masterKey = null;
        
        this.init();
    }

    async init() {
        await this.initializeMasterKey();
        this.setupSecurityHeaders();
    }

    async initializeMasterKey() {
        // Generate or retrieve master key from secure storage
        const storedKey = localStorage.getItem('politrade_master_key');
        
        if (storedKey) {
            // Derive key from stored encrypted data
            this.masterKey = await this.deriveKey(storedKey);
        } else {
            // Generate new master key
            this.masterKey = await this.generateMasterKey();
            const encryptedKey = await this.encryptMasterKey(this.masterKey);
            localStorage.setItem('politrade_master_key', encryptedKey);
        }
    }

    async generateMasterKey() {
        return await window.crypto.subtle.generateKey(
            {
                name: this.algorithm,
                length: this.keyLength
            },
            true,
            ['encrypt', 'decrypt']
        );
    }

    async deriveKey(password) {
        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        return await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode('politrade_salt_2024'),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            {
                name: this.algorithm,
                length: this.keyLength
            },
            true,
            ['encrypt', 'decrypt']
        );
    }

    // Encrypt Trade Data
    async encryptTrade(tradeData) {
        try {
            const tradeString = JSON.stringify(tradeData);
            const encoder = new TextEncoder();
            const data = encoder.encode(tradeString);
            
            // Generate random IV
            const iv = window.crypto.getRandomValues(new Uint8Array(this.ivLength));
            
            // Encrypt data
            const encryptedData = await window.crypto.subtle.encrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                this.masterKey,
                data
            );
            
            // Combine IV + encrypted data + auth tag
            const combined = new Uint8Array(iv.length + encryptedData.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encryptedData), iv.length);
            
            // Convert to base64 for storage
            return this.arrayBufferToBase64(combined);
            
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt trade data');
        }
    }

    // Decrypt Trade Data
    async decryptTrade(encryptedData) {
        try {
            const combined = this.base64ToArrayBuffer(encryptedData);
            
            // Extract IV and encrypted data
            const iv = combined.slice(0, this.ivLength);
            const data = combined.slice(this.ivLength);
            
            // Decrypt data
            const decryptedData = await window.crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                this.masterKey,
                data
            );
            
            const decoder = new TextDecoder();
            const tradeString = decoder.decode(decryptedData);
            
            return JSON.parse(tradeString);
            
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt trade data');
        }
    }

    // Encrypt User Data
    async encryptUserData(userData) {
        const sensitiveData = {
            portfolio: userData.portfolio || [],
            transactions: userData.transactions || [],
            personalInfo: {
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || ''
            },
            timestamp: Date.now()
        };

        return await this.encryptTrade(sensitiveData);
    }

    // Decrypt User Data
    async decryptUserData(encryptedUserData) {
        try {
            const decryptedData = await this.decryptTrade(encryptedUserData);
            
            // Validate data integrity
            if (!this.validateUserData(decryptedData)) {
                throw new Error('Invalid user data structure');
            }
            
            return decryptedData;
        } catch (error) {
            console.error('User data decryption error:', error);
            throw new Error('Failed to decrypt user data');
        }
    }

    // Encrypt Payment Information
    async encryptPaymentInfo(paymentInfo) {
        const sanitizedData = {
            cardType: paymentInfo.cardType || '',
            lastFour: paymentInfo.lastFour || '',
            expiryMonth: paymentInfo.expiryMonth || '',
            expiryYear: paymentInfo.expiryYear || '',
            billingZip: paymentInfo.billingZip || '',
            token: paymentInfo.token || '', // For stored payment methods
            timestamp: Date.now()
        };

        return await this.encryptTrade(sanitizedData);
    }

    // Decrypt Payment Information
    async decryptPaymentInfo(encryptedPaymentInfo) {
        try {
            const decryptedData = await this.decryptTrade(encryptedPaymentInfo);
            
            if (!this.validatePaymentInfo(decryptedData)) {
                throw new Error('Invalid payment data structure');
            }
            
            return decryptedData;
        } catch (error) {
            console.error('Payment info decryption error:', error);
            throw new Error('Failed to decrypt payment information');
        }
    }

    // Hash Passwords (for authentication)
    async hashPassword(password, salt = null) {
        if (!salt) {
            salt = window.crypto.getRandomValues(new Uint8Array(this.saltLength));
        }

        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        const hash = await window.crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            256
        );

        return {
            hash: this.arrayBufferToBase64(hash),
            salt: this.arrayBufferToBase64(salt)
        };
    }

    // Verify Password
    async verifyPassword(password, hashedPassword, salt) {
        const saltArray = this.base64ToArrayBuffer(salt);
        const { hash: computedHash } = await this.hashPassword(password, saltArray);
        
        // Constant-time comparison
        const hash1 = this.base64ToArrayBuffer(hashedPassword);
        const hash2 = this.base64ToArrayBuffer(computedHash);
        
        if (hash1.byteLength !== hash2.byteLength) {
            return false;
        }

        const view1 = new Uint8Array(hash1);
        const view2 = new Uint8Array(hash2);
        
        let result = 0;
        for (let i = 0; i < view1.length; i++) {
            result |= view1[i] ^ view2[i];
        }
        
        return result === 0;
    }

    // Generate Secure Tokens
    generateSecureToken(length = 32) {
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        return this.arrayBufferToBase64(array);
    }

    // Generate Session ID
    generateSessionId() {
        return 'session_' + this.generateSecureToken(24);
    }

    // Validate Data Integrity
    validateUserData(data) {
        return data && 
               typeof data === 'object' &&
               Array.isArray(data.portfolio) &&
               Array.isArray(data.transactions) &&
               typeof data.personalInfo === 'object' &&
               typeof data.timestamp === 'number';
    }

    validatePaymentInfo(data) {
        return data &&
               typeof data === 'object' &&
               typeof data.lastFour === 'string' &&
               data.lastFour.length === 4 &&
               typeof data.timestamp === 'number';
    }

    // Security Headers and CSRF Protection
    setupSecurityHeaders() {
        // Add security meta tags
        const securityMeta = document.createElement('meta');
        securityMeta.httpEquiv = 'Content-Security-Policy';
        securityMeta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' https:; frame-ancestors 'none';";
        document.head.appendChild(securityMeta);

        // Add other security headers via meta tags
        const xssProtection = document.createElement('meta');
        xssProtection.httpEquiv = 'X-XSS-Protection';
        xssProtection.content = '1; mode=block';
        document.head.appendChild(xssProtection);

        const contentType = document.createElement('meta');
        contentType.httpEquiv = 'X-Content-Type-Options';
        contentType.content = 'nosniff';
        document.head.appendChild(contentType);

        const frameOptions = document.createElement('meta');
        frameOptions.httpEquiv = 'X-Frame-Options';
        frameOptions.content = 'DENY';
        document.head.appendChild(frameOptions);
    }

    // Secure Storage Functions
    async secureSetItem(key, data) {
        try {
            const encrypted = await this.encryptTrade(data);
            localStorage.setItem('secure_' + key, encrypted);
            return true;
        } catch (error) {
            console.error('Secure storage error:', error);
            return false;
        }
    }

    async secureGetItem(key) {
        try {
            const encrypted = localStorage.getItem('secure_' + key);
            if (!encrypted) return null;
            
            return await this.decryptTrade(encrypted);
        } catch (error) {
            console.error('Secure retrieval error:', error);
            return null;
        }
    }

    secureRemoveItem(key) {
        localStorage.removeItem('secure_' + key);
    }

    // Audit Logging (encrypted)
    async logSecurityEvent(eventType, details) {
        const logEntry = {
            eventType,
            details,
            timestamp: Date.now(),
            sessionId: this.getSessionId(),
            userAgent: navigator.userAgent,
            ip: await this.getClientIP()
        };

        try {
            const encrypted = await this.encryptTrade(logEntry);
            const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
            logs.push(encrypted);
            
            // Keep only last 100 logs
            if (logs.length > 100) {
                logs.shift();
            }
            
            localStorage.setItem('security_logs', JSON.stringify(logs));
        } catch (error) {
            console.error('Security logging error:', error);
        }
    }

    // Utility Functions
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    base64ToArrayBuffer(base64) {
        const binary = window.atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = this.generateSessionId();
            sessionStorage.setItem('session_id', sessionId);
        }
        return sessionId;
    }

    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    // Encryption Key Rotation (for enhanced security)
    async rotateEncryptionKey() {
        try {
            const newKey = await this.generateMasterKey();
            
            // Re-encrypt all sensitive data with new key
            const sensitiveKeys = ['userPortfolio', 'transactions', 'paymentInfo'];
            
            for (const key of sensitiveKeys) {
                const encryptedData = localStorage.getItem('secure_' + key);
                if (encryptedData) {
                    const decryptedData = await this.decryptTrade(encryptedData);
                    const reencryptedData = await this.encryptTrade(decryptedData);
                    localStorage.setItem('secure_' + key, reencryptedData);
                }
            }
            
            this.masterKey = newKey;
            await this.logSecurityEvent('key_rotation', { timestamp: Date.now() });
            
            return true;
        } catch (error) {
            console.error('Key rotation error:', error);
            return false;
        }
    }

    // Security Health Check
    async performSecurityHealthCheck() {
        const health = {
            encryption: true,
            keyRotation: false,
            secureStorage: false,
            securityHeaders: true,
            overall: 'unknown'
        };

        try {
            // Test encryption/decryption
            const testData = { test: 'encryption_health_check' };
            const encrypted = await this.encryptTrade(testData);
            const decrypted = await this.decryptTrade(encrypted);
            
            if (JSON.stringify(decrypted) !== JSON.stringify(testData)) {
                health.encryption = false;
            }

            // Test secure storage
            const storageTest = await this.secureSetItem('health_test', testData);
            const retrievedTest = await this.secureGetItem('health_test');
            
            if (storageTest && JSON.stringify(retrievedTest) === JSON.stringify(testData)) {
                health.secureStorage = true;
            }

            // Check last key rotation (should be done periodically)
            const lastRotation = localStorage.getItem('last_key_rotation');
            if (!lastRotation || (Date.now() - parseInt(lastRotation)) > 30 * 24 * 60 * 60 * 1000) {
                health.keyRotation = false;
            }

            // Overall health
            health.overall = Object.values(health).every(v => v === true) ? 'healthy' : 'warning';

            await this.logSecurityEvent('health_check', health);
            return health;

        } catch (error) {
            console.error('Security health check error:', error);
            health.overall = 'error';
            return health;
        }
    }
}

// Initialize encryption system
window.comprehensiveEncryption = new ComprehensiveEncryption();

console.log('Comprehensive 256-bit encryption system initialized');