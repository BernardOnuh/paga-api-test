// Load environment variables
require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

// Validate required environment variables
const requiredEnvVars = [
    'PAGA_BASE_URL',
    'PAGA_PRINCIPAL', 
    'PAGA_CREDENTIALS',
    'PAGA_HASH_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease check your .env file and ensure all variables are set.');
    process.exit(1);
}

// Paga API configuration from environment variables
const PAGA_CONFIG = {
    baseUrl: process.env.PAGA_BASE_URL,
    principal: process.env.PAGA_PRINCIPAL,
    credentials: process.env.PAGA_CREDENTIALS,
    hashKey: process.env.PAGA_HASH_KEY
};

// Function to generate SHA-512 hash
function generateHash(hashString) {
    return crypto.createHash('sha512').update(hashString).digest('hex');
}

// Function to generate unique reference number
function generateReferenceNumber(prefix = 'paga-api') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Function to check account balance - FIXED VERSION
async function checkAccountBalance(accountPrincipal, accountCredentials) {
    try {
        // Validate required parameters
        if (!accountPrincipal || !accountCredentials) {
            throw new Error('accountPrincipal and accountCredentials are required for balance check');
        }
        
        // Generate reference number
        const referenceNumber = generateReferenceNumber('balance');
        
        // Generate hash: referenceNumber + hashKey
        const hashString = referenceNumber + PAGA_CONFIG.hashKey;
        const hash = generateHash(hashString);
        
        // Request payload with actual account details
        const requestData = {
            referenceNumber: referenceNumber,
            accountPrincipal: accountPrincipal,
            sourceOfFunds: accountPrincipal,
            accountCredentials: accountCredentials,
            locale: process.env.PAGA_LOCALE || "en"
        };
        
        // Request headers
        const headers = {
            'principal': PAGA_CONFIG.principal,
            'credentials': PAGA_CONFIG.credentials,
            'hash': hash,
            'Content-Type': 'application/json'
        };
        
        console.log('🔍 Checking account balance...');
        console.log('Reference Number:', referenceNumber);
        console.log('Account Principal:', accountPrincipal);
        console.log('Environment:', PAGA_CONFIG.baseUrl.includes('sandbox') ? 'SANDBOX' : 'LIVE');
        console.log('---');
        
        // Make API request
        const response = await axios.post(
            `${PAGA_CONFIG.baseUrl}/paga-webservices/business-rest/secured/accountBalance`,
            requestData,
            { headers }
        );
        
        console.log('✅ Account Balance Response:');
        console.log('Response Code:', response.data.responseCode);
        console.log('Message:', response.data.message);
        console.log('Total Balance:', response.data.totalBalance);
        console.log('Available Balance:', response.data.availableBalance);
        console.log('Currency:', response.data.currency);
        console.log('Balance Date:', response.data.balanceDateTimeUTC);
        
        return response.data;
        
    } catch (error) {
        console.error('❌ Error checking balance:');
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error:', error.message);
        }
        
        throw error;
    }
}

// Function to check business account balance
async function checkBusinessAccountBalance() {
    try {
        const referenceNumber = generateReferenceNumber('business-balance');
        const hashString = referenceNumber + PAGA_CONFIG.hashKey;
        const hash = generateHash(hashString);
        
        const requestData = {
            referenceNumber: referenceNumber,
            accountPrincipal: PAGA_CONFIG.principal,
            sourceOfFunds: PAGA_CONFIG.principal,
            accountCredentials: PAGA_CONFIG.credentials,
            locale: process.env.PAGA_LOCALE || "en"
        };
        
        const headers = {
            'principal': PAGA_CONFIG.principal,
            'credentials': PAGA_CONFIG.credentials,
            'hash': hash,
            'Content-Type': 'application/json'
        };
        
        console.log('🔍 Checking business account balance...');
        console.log('Reference Number:', referenceNumber);
        console.log('Environment:', PAGA_CONFIG.baseUrl.includes('sandbox') ? 'SANDBOX' : 'LIVE');
        console.log('---');
        
        const response = await axios.post(
            `${PAGA_CONFIG.baseUrl}/paga-webservices/business-rest/secured/accountBalance`,
            requestData,
            { headers }
        );
        
        console.log('✅ Business Account Balance Response:');
        console.log('Response Code:', response.data.responseCode);
        console.log('Message:', response.data.message);
        console.log('Total Balance:', response.data.totalBalance);
        console.log('Available Balance:', response.data.availableBalance);
        console.log('Currency:', response.data.currency);
        
        return response.data;
        
    } catch (error) {
        console.error('❌ Error checking business balance:', error.response?.data || error.message);
        throw error;
    }
}

// Function to get list of banks
async function getBanks() {
    try {
        const referenceNumber = generateReferenceNumber('banks');
        const hashString = referenceNumber + PAGA_CONFIG.hashKey;
        const hash = generateHash(hashString);
        
        const requestData = {
            referenceNumber: referenceNumber,
            locale: process.env.PAGA_LOCALE || "en"
        };
        
        const headers = {
            'principal': PAGA_CONFIG.principal,
            'credentials': PAGA_CONFIG.credentials,
            'hash': hash,
            'Content-Type': 'application/json'
        };
        
        console.log('🏦 Getting list of banks...');
        
        const response = await axios.post(
            `${PAGA_CONFIG.baseUrl}/paga-webservices/business-rest/secured/getBanks`,
            requestData,
            { headers }
        );
        
        console.log('✅ Banks Response:');
        console.log('Response Code:', response.data.responseCode);
        console.log('Message:', response.data.message);
        console.log('Number of Banks:', response.data.banks?.length || 0);
        
        if (response.data.banks && response.data.banks.length > 0) {
            console.log('First 5 Banks:');
            response.data.banks.slice(0, 5).forEach((bank, index) => {
                console.log(`${index + 1}. ${bank.name} (UUID: ${bank.uuid})`);
            });
        }
        
        return response.data;
        
    } catch (error) {
        console.error('❌ Error getting banks:', error.response?.data || error.message);
        throw error;
    }
}

// Function to validate environment configuration
function validateEnvironment() {
    console.log('🔧 Environment Configuration:');
    console.log('Base URL:', PAGA_CONFIG.baseUrl);
    console.log('Principal:', PAGA_CONFIG.principal);
    console.log('Credentials:', PAGA_CONFIG.credentials ? '***HIDDEN***' : 'NOT SET');
    console.log('Hash Key:', PAGA_CONFIG.hashKey ? '***HIDDEN***' : 'NOT SET');
    console.log('Locale:', process.env.PAGA_LOCALE || 'en (default)');
    console.log('Environment Type:', PAGA_CONFIG.baseUrl.includes('sandbox') ? 'SANDBOX' : 'LIVE');
    
    if (!PAGA_CONFIG.baseUrl.includes('sandbox')) {
        console.log('⚠️  WARNING: You are using the LIVE environment - real money transactions!');
    }
    
    console.log('=====================================');
}

// Main function to run tests
async function main() {
    console.log('🚀 Starting Paga API Tests...');
    
    // Validate environment
    validateEnvironment();
    
    try {
        // Test 1: Check business account balance
        await checkBusinessAccountBalance();
        
        console.log('\n=====================================');
        
        // Test 2: Get banks list
        await getBanks();
        
        console.log('\n✅ All tests completed successfully!');
        
    } catch (error) {
        console.log('\n❌ Tests failed. Please check your credentials and network connection.');
        console.error('Error details:', error.message);
    }
}

// Export functions for use in other files
module.exports = {
    checkAccountBalance,
    checkBusinessAccountBalance,
    getBanks,
    generateHash,
    generateReferenceNumber,
    PAGA_CONFIG,
    validateEnvironment
};

// Run the script if called directly
if (require.main === module) {
    main();
}