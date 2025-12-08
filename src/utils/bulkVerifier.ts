import { ethers } from 'ethers';

// EIP-712 Domain Configuration (matching eip712.ts)
const domain = {
    name: 'CertificateSigning',
    version: '1',
    chainId: 11155111, // Sepolia
    verifyingContract: '0x8e79C63173070B907b36544bB00355EFB4B69c48',
} as const;

// Certificate Type Definition
const types = {
    Certificate: [
        { name: 'certId', type: 'string' },
        { name: 'learner', type: 'address' },
        { name: 'course', type: 'string' },
        { name: 'marks', type: 'string' },
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
        name: 'isApprovedInstitute',
        inputs: [{ name: 'wallet', type: 'address', internalType: 'address' }],
        outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
        stateMutability: 'view',
    },
];

export interface CertData {
    certId: string;
    learner: string;
    course: string;
    marks: string;
    signature: string;
    expectedIssuer?: string;
}

export interface VerificationResult {
    valid: boolean;
    signer: string | null;
    error: string | null;
}

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
        // Validate required fields
        if (!certData.certId || !certData.learner || !certData.course || !certData.marks || !certData.signature) {
            return {
                valid: false,
                signer: null,
                error: 'Missing required fields (certId, learner, course, marks, signature)',
            };
        }

        // Validate Ethereum address format
        if (!ethers.utils.isAddress(certData.learner)) {
            return {
                valid: false,
                signer: null,
                error: `Invalid learner address: ${certData.learner}`,
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
            certId: certData.certId,
            learner: certData.learner,
            course: certData.course,
            marks: certData.marks,
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

        // Initialize provider and contract
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(contractAddress, VERIFIER_ABI, provider);

        // Check if signer is a registered and active institute
        let isRegistered = false;
        try {
            isRegistered = await contract.isApprovedInstitute(recoveredSigner);
        } catch (error: any) {
            return {
                valid: false,
                signer: recoveredSigner,
                error: `Contract call failed: ${error.message}`,
            };
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
