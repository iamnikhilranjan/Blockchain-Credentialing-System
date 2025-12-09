import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'BlockchainDB';
const COLLECTION_NAME = 'certificates';

let mongoClient;
let db;

// Connect to MongoDB
async function connectMongoDB() {
    try {
        mongoClient = new MongoClient(MONGODB_URI);
        await mongoClient.connect();
        db = mongoClient.db(DB_NAME);
        console.log('✅ Connected to MongoDB:', DB_NAME);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
    }
}

connectMongoDB();


// Contract addresses (matching frontend blockchain.ts)
const CONTRACT_ADDRESSES = {
    certAgency: "0x18F3040088d9933C55722474daFfd273E1d562dD",
    certifier: "0xAECe4998324626df3ae58b80169ff8238C48EDAe",
    certTemplate: "0x418d3d74c39CB1150201AA46110a5C7064bA0Ec3",
    receiver: "0x3164d3D3a32c4541681aA47065Ec5Cf7563C7Cca",
    certificates: "0xb2E8d5D2ED3c0C30AdB6A6062f93A1fB91078e7f"
};

// RPC URL - try environment variable first, then use a default
// You can set VITE_RPC_URL in .env file or it will use the default Sepolia RPC
const RPC_URL = process.env.VITE_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo';

console.log('📡 Using RPC URL:', RPC_URL);
console.log('📜 Certificates Contract:', CONTRACT_ADDRESSES.certificates);

// Initialize provider
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

// Certificates contract ABI (minimal required functions)
const CERTIFICATES_ABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "name": "certificates",
        "outputs": [
            { "internalType": "bytes32", "name": "idHash", "type": "bytes32" },
            { "internalType": "uint256", "name": "learnerId", "type": "uint256" },
            { "internalType": "uint256", "name": "templateId", "type": "uint256" },
            { "internalType": "uint256", "name": "staffId", "type": "uint256" },
            { "internalType": "uint256", "name": "instituteId", "type": "uint256" },
            { "internalType": "uint256", "name": "issuedAt", "type": "uint256" },
            { "internalType": "uint256", "name": "validUntil", "type": "uint256" },
            { "internalType": "bool", "name": "revoked", "type": "bool" },
            { "internalType": "bytes32", "name": "dataHash", "type": "bytes32" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Helper function to create Keccak-256 hash (same as blockchain)
function createHash(data) {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(data));
}

// POST /api/verify-certificate
app.post('/api/verify-certificate', async (req, res) => {
    try {
        const { certificateId, learnerName, courseName } = req.body;

        console.log('Verification request received:', { certificateId, learnerName, courseName });

        // Validation
        if (!certificateId) {
            return res.status(400).json({
                success: false,
                error: 'Certificate ID is required'
            });
        }

        if (!learnerName || !courseName) {
            return res.status(400).json({
                success: false,
                error: 'Learner name and course name are required for verification'
            });
        }

        // Connect to contract
        const certificatesContract = new ethers.Contract(
            CONTRACT_ADDRESSES.certificates,
            CERTIFICATES_ABI,
            provider
        );

        console.log('Fetching certificate data from blockchain...');

        // Get certificate data from blockchain
        const certData = await certificatesContract.certificates(parseInt(certificateId));

        console.log('Certificate data retrieved:', {
            idHash: certData.idHash,
            learnerId: certData.learnerId.toString(),
            dataHash: certData.dataHash
        });

        // Check if certificate exists
        if (!certData.idHash || certData.idHash === ethers.constants.HashZero) {
            return res.status(404).json({
                success: false,
                error: 'Certificate not found on blockchain'
            });
        }

        // Create hash from provided data (must match the format used during issuance)
        // NEW FORMAT: templateName, learnerName, learnerId
        const verificationData = {
            templateName: courseName,  // User provides expected course name
            learnerName: learnerName,
            learnerId: certData.learnerId.toString()  // From blockchain
        };
        const calculatedHash = createHash(JSON.stringify(verificationData));

        console.log('Hash comparison:', {
            calculatedHash,
            storedHash: certData.dataHash,
            match: calculatedHash === certData.dataHash,
            verificationData
        });

        // Compare hashes
        const hashMatches = calculatedHash === certData.dataHash;

        if (!hashMatches) {
            return res.status(400).json({
                success: false,
                verified: false,
                error: 'Certificate data does not match. Please verify the learner name and course name are exactly as they were during issuance.'
            });
        }

        // Return verification result
        return res.status(200).json({
            success: true,
            verified: true,
            data: {
                certificateId: certificateId,
                learnerId: certData.learnerId.toString(),
                templateId: certData.templateId.toString(),
                staffId: certData.staffId.toString(),
                instituteId: certData.instituteId.toString(),
                issuedAt: new Date(certData.issuedAt.toNumber() * 1000).toISOString(),
                validUntil: certData.validUntil.toNumber() === 0
                    ? 'Lifetime'
                    : new Date(certData.validUntil.toNumber() * 1000).toISOString(),
                revoked: certData.revoked,
                status: certData.revoked ? 'revoked' : 'authentic',
                dataHash: certData.dataHash,
                learnerName: learnerName,
                courseName: courseName
            }
        });

    } catch (error) {
        console.error('=== VERIFICATION ERROR ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('=== END ERROR ===');

        // Provide more specific error messages
        let errorMessage = error.message || 'An error occurred during verification';

        if (error.message?.includes('could not detect network')) {
            errorMessage = 'Cannot connect to blockchain. Please check VITE_RPC_URL in .env file';
        } else if (error.message?.includes('invalid address')) {
            errorMessage = 'Invalid contract address. Please check VITE_CERTIFICATES_CONTRACT_ADDRESS in .env file';
        } else if (error.code === 'NETWORK_ERROR') {
            errorMessage = 'Network error: Unable to connect to blockchain RPC endpoint';
        }

        return res.status(500).json({
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/certificate/:id (Quick lookup without verification)
app.get('/api/certificate/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log('Certificate lookup request:', id);

        const certificatesContract = new ethers.Contract(
            CONTRACT_ADDRESSES.certificates,
            CERTIFICATES_ABI,
            provider
        );

        const certData = await certificatesContract.certificates(parseInt(id));

        if (!certData.idHash || certData.idHash === ethers.constants.HashZero) {
            return res.status(404).json({
                success: false,
                error: 'Certificate not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                certificateId: id,
                learnerId: certData.learnerId.toString(),
                templateId: certData.templateId.toString(),
                staffId: certData.staffId.toString(),
                instituteId: certData.instituteId.toString(),
                issuedAt: new Date(certData.issuedAt.toNumber() * 1000).toISOString(),
                validUntil: certData.validUntil.toNumber() === 0
                    ? 'Lifetime'
                    : new Date(certData.validUntil.toNumber() * 1000).toISOString(),
                revoked: certData.revoked,
                dataHash: certData.dataHash
            }
        });

    } catch (error) {
        console.error('Lookup error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'An error occurred during lookup'
        });
    }
});

// GET /api/mongo-certificates/:walletAddress
app.get('/api/mongo-certificates/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;

        console.log('MongoDB certificates request for wallet:', walletAddress);

        if (!db) {
            return res.status(500).json({
                success: false,
                error: 'MongoDB not connected'
            });
        }

        const collection = db.collection(COLLECTION_NAME);
        const certificates = await collection.find({ walletAddress }).toArray();

        console.log(`Found ${certificates.length} MongoDB certificates for wallet:`, walletAddress);

        return res.status(200).json({
            success: true,
            data: certificates
        });

    } catch (error) {
        console.error('MongoDB certificates fetch error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'An error occurred while fetching MongoDB certificates'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        blockchain: {
            rpcUrl: process.env.VITE_RPC_URL ? 'configured' : 'not configured',
            certificatesContract: CONTRACT_ADDRESSES.certificates || 'not configured'
        },
        mongodb: {
            connected: !!db,
            database: DB_NAME
        }
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ API server running on http://localhost:${PORT}`);
    console.log(`📡 RPC URL: ${process.env.VITE_RPC_URL || 'NOT CONFIGURED'}`);
    console.log(`📜 Certificates Contract: ${CONTRACT_ADDRESSES.certificates || 'NOT CONFIGURED'}`);
    console.log('\nAvailable endpoints:');
    console.log(`  POST http://localhost:${PORT}/api/verify-certificate`);
    console.log(`  GET  http://localhost:${PORT}/api/certificate/:id`);
    console.log(`  GET  http://localhost:${PORT}/api/health`);
});
