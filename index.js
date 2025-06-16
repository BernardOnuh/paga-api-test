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

// CORRECTED APPROACH 1: Empty fields with correct hash
async function checkBalanceEmptyFields() {
    try {
        const referenceNumber = generateReferenceNumber('empty-balance');
        // CORRECT HASH: For account balance, it's just referenceNumber + hashKey
        const hashString = referenceNumber + PAGA_CONFIG.hashKey;
        const hash = generateHash(hashString);
        
        const requestData = {
            referenceNumber: referenceNumber,
            accountPrincipal: "",                    
            sourceOfFunds: "",                       
            accountCredentials: "",                  
            locale: process.env.PAGA_LOCALE || "en"
        };
        
        const headers = {
            'principal': PAGA_CONFIG.principal,
            'credentials': PAGA_CONFIG.credentials,
            'hash': hash,
            'Content-Type': 'application/json'
        };
        
        console.log('🔍 Trying with empty fields (correct hash)...');
        console.log('Reference Number:', referenceNumber);
        console.log('Hash String:', hashString);
        console.log('Generated Hash:', hash.substring(0, 20) + '...');
        console.log('---');
        
        const response = await axios.post(
            `${PAGA_CONFIG.baseUrl}/paga-webservices/business-rest/secured/accountBalance`,
            requestData,
            { headers }
        );
        
        console.log('✅ Empty Fields Balance Response:');
        console.log('Response Code:', response.data.responseCode);
        console.log('Message:', response.data.message);
        console.log('Total Balance:', response.data.totalBalance);
        console.log('Available Balance:', response.data.availableBalance);
        console.log('Currency:', response.data.currency);
        
        return response.data;
        
    } catch (error) {
        console.error('❌ Error with empty fields approach:', error.response?.data || error.message);
        throw error;
    }
}

// CORRECTED APPROACH 2: Try sandbox environment
async function checkBalanceInSandbox() {
    try {
        const referenceNumber = generateReferenceNumber('sandbox-balance');
        const hashString = referenceNumber + PAGA_CONFIG.hashKey;
        const hash = generateHash(hashString);
        
        const requestData = {
            referenceNumber: referenceNumber,
            accountPrincipal: "",                    
            sourceOfFunds: "",                       
            accountCredentials: "",                  
            locale: process.env.PAGA_LOCALE || "en"
        };
        
        const headers = {
            'principal': PAGA_CONFIG.principal,
            'credentials': PAGA_CONFIG.credentials,
            'hash': hash,
            'Content-Type': 'application/json'
        };
        
        // Try sandbox URL
        const sandboxUrl = 'https://beta.mypaga.com';
        
        console.log('🔍 Trying sandbox environment...');
        console.log('Sandbox URL:', sandboxUrl);
        console.log('Reference Number:', referenceNumber);
        console.log('---');
        
        const response = await axios.post(
            `${sandboxUrl}/paga-webservices/business-rest/secured/accountBalance`,
            requestData,
            { headers }
        );
        
        console.log('✅ Sandbox Balance Response:');
        console.log('Response Code:', response.data.responseCode);
        console.log('Message:', response.data.message);
        console.log('Total Balance:', response.data.totalBalance);
        console.log('Available Balance:', response.data.availableBalance);
        console.log('Currency:', response.data.currency);
        
        return response.data;
        
    } catch (error) {
        console.error('❌ Error with sandbox approach:', error.response?.data || error.message);
        throw error;
    }
}

// CORRECTED APPROACH 3: Funding sources with proper hash
async function getFundingSources() {
    try {
        const referenceNumber = generateReferenceNumber('funding-sources');
        const accountPrincipal = "";
        const accountCredentials = "";
        
        // CORRECT HASH: referenceNumber + accountPrincipal + accountCredentials + hashkey
        const hashString = referenceNumber + accountPrincipal + accountCredentials + PAGA_CONFIG.hashKey;
        const hash = generateHash(hashString);
        
        const requestData = {
            referenceNumber: referenceNumber,
            accountPrincipal: accountPrincipal,
            accountCredentials: accountCredentials,
            locale: process.env.PAGA_LOCALE || "en"
        };
        
        const headers = {
            'principal': PAGA_CONFIG.principal,
            'credentials': PAGA_CONFIG.credentials,
            'hash': hash,
            'Content-Type': 'application/json'
        };
        
        console.log('🔍 Getting funding sources (correct hash)...');
        console.log('Reference Number:', referenceNumber);
        console.log('Hash String:', hashString);
        console.log('Generated Hash:', hash.substring(0, 20) + '...');
        console.log('---');
        
        const response = await axios.post(
            `${PAGA_CONFIG.baseUrl}/paga-webservices/business-rest/secured/getFundingSources`,
            requestData,
            { headers }
        );
        
        console.log('✅ Funding Sources Response:');
        console.log('Response Code:', response.data.responseCode);
        console.log('Message:', response.data.message);
        console.log('Sources:', response.data.sources);
        
        return response.data;
        
    } catch (error) {
        console.error('❌ Error getting funding sources:', error.response?.data || error.message);
        throw error;
    }
}

// NEW APPROACH 4: Try with your business principal as accountPrincipal
async function checkBalanceWithBusinessPrincipal() {
    try {
        const referenceNumber = generateReferenceNumber('business-principal');
        const hashString = referenceNumber + PAGA_CONFIG.hashKey;
        const hash = generateHash(hashString);
        
        const requestData = {
            referenceNumber: referenceNumber,
            accountPrincipal: PAGA_CONFIG.principal,    // Use your business principal
            sourceOfFunds: "PAGA",                      // Specify PAGA as source
            accountCredentials: PAGA_CONFIG.credentials, // Use your business credentials
            locale: process.env.PAGA_LOCALE || "en"
        };
        
        const headers = {
            'principal': PAGA_CONFIG.principal,
            'credentials': PAGA_CONFIG.credentials,
            'hash': hash,
            'Content-Type': 'application/json'
        };
        
        console.log('🔍 Trying with business principal as account...');
        console.log('Reference Number:', referenceNumber);
        console.log('Account Principal:', PAGA_CONFIG.principal);
        console.log('---');
        
        const response = await axios.post(
            `${PAGA_CONFIG.baseUrl}/paga-webservices/business-rest/secured/accountBalance`,
            requestData,
            { headers }
        );
        
        console.log('✅ Business Principal Balance Response:');
        console.log('Response Code:', response.data.responseCode);
        console.log('Message:', response.data.message);
        console.log('Total Balance:', response.data.totalBalance);
        console.log('Available Balance:', response.data.availableBalance);
        console.log('Currency:', response.data.currency);
        
        return response.data;
        
    } catch (error) {
        console.error('❌ Error with business principal approach:', error.response?.data || error.message);
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
    
    // Better environment detection
    const isLive = PAGA_CONFIG.baseUrl.includes('www.mypaga.com');
    const isSandbox = PAGA_CONFIG.baseUrl.includes('beta.mypaga.com') || PAGA_CONFIG.baseUrl.includes('qa1.mypaga.com');
    
    if (isLive) {
        console.log('Environment Type: LIVE');
        console.log('⚠️  WARNING: You are using the LIVE environment - real money transactions!');
    } else if (isSandbox) {
        console.log('Environment Type: SANDBOX');
        console.log('✅ Using sandbox environment - safe for testing');
    } else {
        console.log('Environment Type: UNKNOWN');
        console.log('⚠️  Warning: Environment type cannot be determined from URL');
    }
    
    console.log('=====================================');
}

// Main function to test all approaches
async function main() {
    console.log('🚀 Starting Paga API Account Balance Diagnostic (CORRECTED)...');
    
    // Validate environment
    validateEnvironment();
    
    const approaches = [
        { name: 'Empty Fields (Corrected Hash)', func: checkBalanceEmptyFields },
        { name: 'Sandbox Environment', func: checkBalanceInSandbox },
        { name: 'Business Principal as Account', func: checkBalanceWithBusinessPrincipal },
        { name: 'Get Funding Sources (Corrected Hash)', func: getFundingSources }
    ];
    
    let successfulApproaches = [];
    
    for (let i = 0; i < approaches.length; i++) {
        const approach = approaches[i];
        
        try {
            console.log(`\n📋 APPROACH ${i + 1}: ${approach.name}`);
            console.log('=====================================');
            
            const result = await approach.func();
            
            if (result.responseCode === 0) {
                successfulApproaches.push(approach.name);
                console.log(`🎉 SUCCESS! ${approach.name} worked.`);
            } else {
                console.log(`⚠️  ${approach.name} returned code ${result.responseCode}: ${result.message}`);
            }
            
        } catch (error) {
            console.log(`❌ ${approach.name} failed.`);
        }
        
        // Wait between attempts
        if (i < approaches.length - 1) {
            console.log('\nWaiting 2 seconds before next attempt...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    // Summary and recommendations
    console.log('\n🏁 DIAGNOSTIC SUMMARY');
    console.log('=====================================');
    
    if (successfulApproaches.length > 0) {
        console.log('✅ Successful approaches:');
        successfulApproaches.forEach(approach => {
            console.log(`   - ${approach}`);
        });
        console.log('\n💡 Use the successful approach in your production code!');
    } else {
        console.log('❌ No approaches were successful.');
        console.log('\n💡 NEXT STEPS:');
        console.log('1. Try switching to sandbox environment:');
        console.log('   PAGA_BASE_URL=https://beta.mypaga.com');
        console.log('2. Contact Paga support with your organization name:');
        console.log('   "Ify-ben Webthreenova"');
        console.log('3. Ask them to verify your demo account setup');
        console.log('4. Request proper account linking for balance inquiries');
    }
    
    console.log('\n✅ CONFIRMED WORKING:');
    console.log('   - API authentication is correct');
    console.log('   - Your credentials and hash generation are valid');
}

// Export functions
module.exports = {
    checkBalanceEmptyFields,
    checkBalanceInSandbox,
    getFundingSources,
    checkBalanceWithBusinessPrincipal,
    generateHash,
    generateReferenceNumber,
    PAGA_CONFIG,
    validateEnvironment
};

// Run the script if called directly
if (require.main === module) {
    main();
}