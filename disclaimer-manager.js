// Politrade.com Disclaimer Manager
// Handles stock trading disclaimer acknowledgments and compliance

class DisclaimerManager {
    constructor() {
        this.DISCLAIMER_KEY = 'politrade_disclaimer_acknowledgment';
        this.DISCLAIMER_VERSION = '1.0';
        this.REQUIRED_ACKNOWLEDGMENT_INTERVAL = 30; // days
        this.init();
    }

    init() {
        // Check disclaimer status on page load
        this.checkDisclaimerStatus();
        
        // Add disclaimer link to navigation if needed
        this.addDisclaimerLink();
        
        // Set up periodic verification
        this.setupPeriodicCheck();
    }

    checkDisclaimerStatus() {
        const acknowledgment = this.getAcknowledgment();
        
        if (!acknowledgment || !this.isValidAcknowledgment(acknowledgment)) {
            this.showDisclaimerModal();
            return false;
        }
        
        console.log('Disclaimer acknowledged:', acknowledgment.timestamp);
        return true;
    }

    getAcknowledgment() {
        try {
            const stored = localStorage.getItem(this.DISCLAIMER_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error reading disclaimer acknowledgment:', error);
            return null;
        }
    }

    isValidAcknowledgment(acknowledgment) {
        if (!acknowledgment || !acknowledgment.acknowledged || !acknowledgment.timestamp) {
            return false;
        }

        // Check if acknowledgment is still valid (not expired)
        const acknowledgmentDate = new Date(acknowledgment.timestamp);
        const currentDate = new Date();
        const daysSinceAcknowledgment = (currentDate - acknowledgmentDate) / (1000 * 60 * 60 * 24);
        
        return daysSinceAcknowledgment <= this.REQUIRED_ACKNOWLEDGMENT_INTERVAL;
    }

    showDisclaimerModal() {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'disclaimer-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 15px;
            padding: 40px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        modalContent.innerHTML = `
            <h2 style="color: #1e3c72; margin-bottom: 20px; text-align: center;">
                ⚠️ Important Stock Trading Disclaimer
            </h2>
            
            <div style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                <p><strong>This is not investment advice.</strong> Politrade.com provides congressional trading data for informational purposes only.</p>
                <ul style="margin: 15px 0; padding-left: 20px;">
                    <li>All investing involves risk including possible loss of principal</li>
                    <li>Congressional trading data may be delayed or incomplete</li>
                    <li>Past performance does not guarantee future results</li>
                    <li>Consult qualified professionals before investing</li>
                </ul>
                <p style="margin-top: 15px;"><strong>By continuing, you acknowledge these risks and confirm you will conduct your own research.</strong></p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: flex; align-items: center; cursor: pointer; margin-bottom: 10px;">
                    <input type="checkbox" id="quick-ack" style="margin-right: 10px; transform: scale(1.2);">
                    <span style="color: #333;">I understand the risks and acknowledge this is not investment advice</span>
                </label>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="accept-quick" disabled 
                    style="padding: 12px 30px; background: #28a745; color: white; border: none; border-radius: 50px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                    Accept & Continue
                </button>
                <button id="view-full" 
                    style="padding: 12px 30px; background: #1e3c72; color: white; border: none; border-radius: 50px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                    View Full Disclaimer
                </button>
                <button id="decline-quick" 
                    style="padding: 12px 30px; background: #dc3545; color: white; border: none; border-radius: 50px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                    Decline
                </button>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <a href="disclaimer.html" style="color: #1e3c72; text-decoration: none; font-size: 0.9rem;">
                    Read complete disclaimer terms →
                </a>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Add event listeners
        const checkbox = document.getElementById('quick-ack');
        const acceptBtn = document.getElementById('accept-quick');
        const fullBtn = document.getElementById('view-full');
        const declineBtn = document.getElementById('decline-quick');

        checkbox.addEventListener('change', () => {
            acceptBtn.disabled = !checkbox.checked;
            if (checkbox.checked) {
                acceptBtn.style.background = '#28a745';
                acceptBtn.style.cursor = 'pointer';
            } else {
                acceptBtn.style.background = '#ccc';
                acceptBtn.style.cursor = 'not-allowed';
            }
        });

        acceptBtn.addEventListener('click', () => {
            this.saveAcknowledgment();
            this.removeModal();
        });

        fullBtn.addEventListener('click', () => {
            window.location.href = 'disclaimer.html';
        });

        declineBtn.addEventListener('click', () => {
            this.handleDecline();
        });

        // Add hover effects
        [acceptBtn, fullBtn, declineBtn].forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (!btn.disabled) {
                    btn.style.transform = 'translateY(-2px)';
                    btn.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                }
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
            });
        });
    }

    removeModal() {
        const modal = document.getElementById('disclaimer-modal');
        if (modal) {
            modal.remove();
        }
    }

    saveAcknowledgment() {
        const acknowledgmentData = {
            acknowledged: true,
            timestamp: new Date().toISOString(),
            version: this.DISCLAIMER_VERSION,
            userAgent: navigator.userAgent,
            page: window.location.pathname
        };

        try {
            localStorage.setItem(this.DISCLAIMER_KEY, JSON.stringify(acknowledgmentData));
            console.log('Disclaimer acknowledgment saved:', acknowledgmentData.timestamp);
            
            // Trigger custom event
            window.dispatchEvent(new CustomEvent('disclaimerAcknowledged', {
                detail: acknowledgmentData
            }));
        } catch (error) {
            console.error('Error saving disclaimer acknowledgment:', error);
        }
    }

    handleDecline() {
        this.removeModal();
        
        // Show decline message
        const declineMessage = document.createElement('div');
        declineMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
            z-index: 10001;
        `;
        
        declineMessage.innerHTML = `
            <h3 style="color: #dc3545; margin-bottom: 15px;">Disclaimer Declined</h3>
            <p style="color: #666; margin-bottom: 20px;">You must accept the disclaimer to use Politrade.com services.</p>
            <button onclick="window.location.href='https://www.google.com'" 
                style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Leave Site
            </button>
        `;
        
        document.body.appendChild(declineMessage);
    }

    addDisclaimerLink() {
        // Add disclaimer link to footer if it exists
        const footerSection = document.querySelector('.footer-section ul');
        if (footerSection) {
            const disclaimerLi = document.createElement('li');
            disclaimerLi.innerHTML = '<a href="disclaimer.html" style="color: #ccc; text-decoration: none;">Disclaimer</a>';
            footerSection.appendChild(disclaimerLi);
        }
    }

    setupPeriodicCheck() {
        // Check disclaimer status every hour
        setInterval(() => {
            const acknowledgment = this.getAcknowledgment();
            if (acknowledgment && !this.isValidAcknowledgment(acknowledgment)) {
                console.log('Disclaimer acknowledgment expired, showing modal again');
                this.showDisclaimerModal();
            }
        }, 60 * 60 * 1000); // 1 hour
    }

    // Public method to force disclaimer check
    forceCheck() {
        this.checkDisclaimerStatus();
    }

    // Public method to clear acknowledgment
    clearAcknowledgment() {
        localStorage.removeItem(this.DISCLAIMER_KEY);
        this.checkDisclaimerStatus();
    }
}

// Initialize disclaimer manager
const disclaimerManager = new DisclaimerManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DisclaimerManager;
}

// Make available globally
window.DisclaimerManager = DisclaimerManager;
window.disclaimerManager = disclaimerManager;