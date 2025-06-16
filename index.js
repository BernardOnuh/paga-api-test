const axios = require('axios');
const crypto = require('crypto');

// Your Paga API credentials
const PAGA_CONFIG = {
    baseUrl: 'https://www.mypaga.com', // Live/Mainnet environment
    principal: '8593CE7A-6D1B-48AB-82B1-57FD879EF3E7',
    credentials: 'jS8#xwKvP6N*3CD',
    hashKey: '390fd3c1d7c04bb285c7c21f74d380c9b901320792534685919ee06dba87a2f59cad388022d848748489185669be1a805d790dabc2104a13bd97106453de233c'
};

// Function to generate SHA-512 hash
function generateHash(hashString) {
    return crypto.createHash('sha512').update(hashString).digest('hex');
}

// Function to generate unique reference number
function generateReferenceNumber() {
    return `balance-test-${Date.now()}`;
}

// Function to check account balance
async function checkAccountBalance() {
    try {
        // Generate reference number
        const referenceNumber = generateReferenceNumber();
        
        // Generate hash: referenceNumber + hashKey
        const hashString = referenceNumber + PAGA_CONFIG.hashKey;
        const hash = generateHash(hashString);
        
        // Request payload
        const requestData = {
            referenceNumber: referenceNumber,
            accountPrincipal: "",
            sourceOfFunds: "",
            accountCredentials: "",
            locale: ""
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
        console.log('Hash String:', hashString);
        console.log('Generated Hash:', hash);
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
            // Server responded with error status
            console.error('Status:', error.response.status);
            console.error('Response:', error.response.data);
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response received:', error.request);
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }
        
        throw error;
    }
}

// Function to get list of banks (useful for transfers)
async function getBanks() {
    try {
        const referenceNumber = generateReferenceNumber();
        const hashString = referenceNumber + PAGA_CONFIG.hashKey;
        const hash = generateHash(hashString);
        
        const requestData = {
            referenceNumber: referenceNumber,
            locale: ""
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

// Main function to run tests
async function main() {
    console.log('🚀 Starting Paga API Tests...');
    console.log('Using LIVE Environment:', PAGA_CONFIG.baseUrl);
    console.log('Principal:', PAGA_CONFIG.principal);
    console.log('⚠️  WARNING: This is the LIVE environment - real money transactions!');
    console.log('=====================================');
    
    try {
        // Test 1: Check account balance
        await checkAccountBalance();
        
        console.log('\n=====================================');
        
        // Test 2: Get banks list
        await getBanks();
        
        console.log('\n✅ All tests completed successfully!');
        
    } catch (error) {
        console.log('\n❌ Tests failed. Please check your credentials and network connection.');
    }
}

// Export functions for use in other files
module.exports = {
    checkAccountBalance,
    getBanks,
    generateHash,
    PAGA_CONFIG
};

// Run the script if called directly
if (require.main === module) {
    main();
}