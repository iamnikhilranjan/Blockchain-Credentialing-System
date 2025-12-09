import { ethers } from 'ethers';

// EIP-712 Domain Configuration (matching eip712.ts)
const domain = {
    name: 'CertificateSigning',
    version: '1',
    chainId: 11155111, // Sepolia
    verifyingContract: '0xf6F77A8A8131B8a4fD01473bB4430C663d8cc606',
} as const;

// Certificate Type Definition
// Certificate Type Definition
const types = {
    Certificate: [
        { name: 'certificateNumber', type: 'string' },
        { name: 'candidateFullName', type: 'string' },
        { name: 'dateOfBirth', type: 'string' },
        { name: 'qualificationName', type: 'string' },
        { name: 'nsqfLevel', type: 'uint8' },
        { name: 'assessmentResult', type: 'string' },
        { name: 'dateOfIssue', type: 'string' },
        { name: 'awardingBodyName', type: 'string' },
        { name: 'trainingProviderName', type: 'string' },
        { name: 'ncvetRecognitionStatus', type: 'string' },
    ],
};

// Verifier Contract ABI (minimal - only what we need)
const VERIFIER_ABI = [
    {
        type: 'function',
        name: 'institutes',
        inputs: [{ name: 'wallet', type: 'address', internalType: 'address' }],
        outputs: [
            { name: 'id', type: 'uint256', internalType: 'uint256' },
            { name: 'name', type: 'string', internalType: 'string' },
            { name: 'wallet', type: 'address', internalType: 'address' },
            { name: 'isActive', type: 'bool', internalType: 'bool' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'isInstituteActive',
        inputs: [{ name: 'account', type: 'address', internalType: 'address' }],
        outputs: [{ name: 'isActive', type: 'bool', internalType: 'bool' }],
        stateMutability: 'view',
    },
];

export interface CertData {
    certificateNumber: string;
    candidateFullName: string;
    dateOfBirth: string;
    qualificationName: string;
    nsqfLevel: number;
    assessmentResult: string;
    dateOfIssue: string;
    awardingBodyName: string;
    trainingProviderName: string;
    ncvetRecognitionStatus: string;
    signature: string;
    expectedIssuer?: string;
}

export interface VerificationResult {
    valid: boolean;
    signer: string | null;
    error: string | null;
}

// Institute Status Cache: Address -> Boolean
const instituteStatusCache: Record<string, boolean> = {};

/**
 * Verify a certificate's ECDSA signature on-chain using EIP-712 typed data
 * @param contractAddress - Address of the verifier contract
 * @param rpcUrl - RPC endpoint URL
 * @param certData - Certificate data including signature
 * @returns Verification result with validity, signer address, and any errors
 */
export const verifyCertificateOnChain = async (
    contractAddress: string,
    rpcUrl: string,
    certData: CertData
): Promise<VerificationResult> => {
    try {
        // Validate required fields (basic check)
        if (!certData.certificateNumber || !certData.candidateFullName || !certData.signature) {
            return {
                valid: false,
                signer: null,
                error: 'Missing required fields (certificateNumber, candidateFullName, signature)',
            };
        }

        // Validate signature format
        if (!certData.signature.startsWith('0x') || certData.signature.length !== 132) {
            return {
                valid: false,
                signer: null,
                error: 'Invalid signature format (must be 0x-prefixed hex string, 132 characters)',
            };
        }

        // Prepare the message for signature verification
        const message = {
            certificateNumber: certData.certificateNumber,
            candidateFullName: certData.candidateFullName,
            dateOfBirth: certData.dateOfBirth,
            qualificationName: certData.qualificationName,
            nsqfLevel: certData.nsqfLevel,
            assessmentResult: certData.assessmentResult,
            dateOfIssue: certData.dateOfIssue,
            awardingBodyName: certData.awardingBodyName,
            trainingProviderName: certData.trainingProviderName,
            ncvetRecognitionStatus: certData.ncvetRecognitionStatus,
        };

        // Recover signer address from signature using ethers.js
        let recoveredSigner: string;
        try {
            recoveredSigner = ethers.utils.verifyTypedData(
                domain,
                types,
                message,
                certData.signature
            );
        } catch (error: any) {
            return {
                valid: false,
                signer: null,
                error: `Signature verification failed: ${error.message}`,
            };
        }

        // Check if signer is a registered and active institute (Cached Strategy)
        const signerAddress = recoveredSigner.toLowerCase();
        let isRegistered = false;

        if (instituteStatusCache[signerAddress] !== undefined) {
            // Use Cached Value
            isRegistered = instituteStatusCache[signerAddress];
        } else {
            // Fetch from Blockchain
            try {
                const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
                const contract = new ethers.Contract(contractAddress, VERIFIER_ABI, provider);
                isRegistered = await contract.isInstituteActive(recoveredSigner);

                // Update Cache
                instituteStatusCache[signerAddress] = isRegistered;
            } catch (error: any) {
                return {
                    valid: false,
                    signer: recoveredSigner,
                    error: `Contract call failed: ${error.message}`,
                };
            }
        }

        // If expectedIssuer is provided, verify it matches the recovered signer
        if (certData.expectedIssuer && certData.expectedIssuer !== '0x0000000000000000000000000000000000000000') {
            if (recoveredSigner.toLowerCase() !== certData.expectedIssuer.toLowerCase()) {
                return {
                    valid: false,
                    signer: recoveredSigner,
                    error: `Signer mismatch: expected ${certData.expectedIssuer}, got ${recoveredSigner}`,
                };
            }
        }

        // Final validation: signature is valid AND signer is registered
        if (isRegistered) {
            return {
                valid: true,
                signer: recoveredSigner,
                error: null,
            };
        } else {
            return {
                valid: false,
                signer: recoveredSigner,
                error: 'Signer not registered as active institute',
            };
        }
    } catch (error: any) {
        return {
            valid: false,
            signer: null,
            error: error.message || 'Unknown error occurred during verification',
        };
    }
};

/**
 * Verify multiple certificates in parallel
 * @param contractAddress - Address of the verifier contract
 * @param rpcUrl - RPC endpoint URL
 * @param certificates - Array of certificate data
 * @returns Array of verification results
 */
export const verifyBulkCertificates = async (
    contractAddress: string,
    rpcUrl: string,
    certificates: CertData[]
): Promise<VerificationResult[]> => {
    const promises = certificates.map((cert) =>
        verifyCertificateOnChain(contractAddress, rpcUrl, cert)
    );

    return Promise.all(promises);
};
