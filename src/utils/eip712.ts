
import { ethers } from 'ethers';

// Domain Separator Configuration
const domain = {
    name: 'CertificateSigning',
    version: '1',
    chainId: 11155111, // Sepolia
    verifyingContract: '0xf6F77A8A8131B8a4fD01473bB4430C663d8cc606',
} as const;

// Types Definition (Ethers v5 format - excludes EIP712Domain)
// Types Definition (Ethers v6/v5 compatible format)
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

export interface CertificateData {
    certificateNumber: string;
    candidateFullName: string;
    dateOfBirth: string;
    qualificationName: string;
    nsqfLevel: number; // Will be converted to string or uint8 for signing
    assessmentResult: string;
    dateOfIssue: string;
    awardingBodyName: string;
    trainingProviderName: string;
    ncvetRecognitionStatus: string;
}

export const signCertificate = async (
    data: CertificateData,
    privateKey: string
): Promise<{ signature: string; credentialHash: string }> => {
    // Ethers handles the private key validation and 0x prefix logic internally
    const wallet = new ethers.Wallet(privateKey);

    // Ethers v5 _signTypedData (experimental in v5 but standard usage)
    // Note: _signTypedData expects (domain, types, value)
    // types should NOT include EIP712Domain
    const signature = await wallet._signTypedData(domain, types, data);

    // Calculate the Struct Hash (credentialHash)
    // This is the hash of the data that was actually signed (excluding domain separator for just the struct hash, 
    // but usually 'credentialHash' implies availability of the integrity proof. 
    // Executive summary says: "credentialHash (Integrity Checksum) to lock the row's data".
    // We will use the EIP-712 hashing mechanism for the struct.
    const credentialHash = ethers.utils._TypedDataEncoder.hash(domain, types, data);

    return {
        signature,
        credentialHash
    };
};
