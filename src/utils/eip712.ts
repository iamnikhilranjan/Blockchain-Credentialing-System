
import { ethers } from 'ethers';

// Domain Separator Configuration
const domain = {
    name: 'CertificateSigning',
    version: '1',
    chainId: 11155111, // Sepolia
    verifyingContract: '0x8e79C63173070B907b36544bB00355EFB4B69c48',
} as const;

// Types Definition (Ethers v5 format - excludes EIP712Domain)
const types = {
    Certificate: [
        { name: 'certId', type: 'string' },
        { name: 'learner', type: 'address' },
        { name: 'course', type: 'string' },
        { name: 'marks', type: 'string' },
    ],
};

export interface CertificateData {
    certId: string;
    learner: string;
    course: string;
    marks: string;
}

export const signCertificate = async (
    data: CertificateData,
    privateKey: string
): Promise<string> => {
    // Ethers handles the private key validation and 0x prefix logic internally
    const wallet = new ethers.Wallet(privateKey);

    // Ethers v5 _signTypedData (experimental in v5 but standard usage)
    // Note: _signTypedData expects (domain, types, value)
    // types should NOT include EIP712Domain
    const signature = await wallet._signTypedData(domain, types, data);

    return signature;
};
