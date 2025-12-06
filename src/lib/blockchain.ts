import { ethers } from 'ethers';

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Utility function to check if running in secure context (HTTPS)
const isSecureContext = () => {
  return window.isSecureContext || window.location.protocol === 'https:';
};

// Contract addresses from the backend
const CONTRACT_ADDRESSES = {
  certAgency: "0x18F3040088d9933C55722474daFfd273E1d562dD",
  certifier: "0xAECe4998324626df3ae58b80169ff8238C48EDAe",
  certTemplate: "0x418d3d74c39CB1150201AA46110a5C7064bA0Ec3",
  receiver: "0x3164d3D3a32c4541681aA47065Ec5Cf7563C7Cca",
  certificates: "0xb2E8d5D2ED3c0C30AdB6A6062f93A1fB91078e7f"
};

// RPC URL from environment variables
const RPC_URL = (import.meta as any)?.env?.VITE_RPC_URL || '';

// Network configuration
const SUPPORTED_NETWORKS = {
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrls: [
      'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
      'https://rpc.sepolia.org',
      'https://sepolia.g.alchemy.com/v2/YOUR_API_KEY'
    ]
  },
  polygonAmoy: {
    chainId: 80002,
    name: 'Polygon Amoy',
    rpcUrls: [
      'https://rpc-amoy.polygon.technology',
      'https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY'
    ]
  }
};

// Optional admin override via env var
const ADMIN_ADDRESS = (import.meta as any)?.env?.VITE_ADMIN_ADDRESS
  ? String((import.meta as any).env.VITE_ADMIN_ADDRESS).toLowerCase()
  : undefined;

// Contract ABIs (imported from the backend)
const CERT_AGENCY_ABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "addInstitute",
    "inputs": [
      { "name": "name", "type": "string", "internalType": "string" },
      { "name": "wallet", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "walletToInstituteId",
    "inputs": [
      { "name": "wallet", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "revokeInstitute",
    "inputs": [{ "name": "id", "type": "uint256", "internalType": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "institutes",
    "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "outputs": [
      { "name": "id", "type": "uint256", "internalType": "uint256" },
      { "name": "name", "type": "string", "internalType": "string" },
      { "name": "wallet", "type": "address", "internalType": "address" },
      { "name": "active", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isApprovedInstitute",
    "inputs": [{ "name": "wallet", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  }
];

const CERTIFIER_ABI = [
  {
    "type": "function",
    "name": "addStaff",
    "inputs": [
      { "name": "name", "type": "string", "internalType": "string" },
      { "name": "wallet", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "walletToStaffId",
    "inputs": [{ "name": "wallet", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "revokeStaff",
    "inputs": [{ "name": "staffId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "isApprovedStaff",
    "inputs": [{ "name": "wallet", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "staffMembers",
    "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "outputs": [
      { "name": "id", "type": "uint256", "internalType": "uint256" },
      { "name": "name", "type": "string", "internalType": "string" },
      { "name": "wallet", "type": "address", "internalType": "address" },
      { "name": "instituteId", "type": "uint256", "internalType": "uint256" },
      { "name": "active", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  }
];

const CERT_TEMPLATE_ABI = [
  {
    "type": "function",
    "name": "createTemplate",
    "inputs": [
      { "name": "name", "type": "string", "internalType": "string" },
      { "name": "description", "type": "string", "internalType": "string" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "templates",
    "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "outputs": [
      { "name": "id", "type": "uint256", "internalType": "uint256" },
      { "name": "name", "type": "string", "internalType": "string" },
      { "name": "description", "type": "string", "internalType": "string" },
      { "name": "creatorInstituteId", "type": "uint256", "internalType": "uint256" },
      { "name": "active", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isActiveTemplate",
    "inputs": [{ "name": "templateId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  }
];

const RECEIVER_ABI = [
  {
    "type": "function",
    "name": "registerLearner",
    "inputs": [
      { "name": "wallet", "type": "address", "internalType": "address" },
      { "name": "identityHash", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "walletToLearnerId",
    "inputs": [{ "name": "wallet", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "deactivateLearner",
    "inputs": [{ "name": "learnerId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "learners",
    "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "outputs": [
      { "name": "id", "type": "uint256", "internalType": "uint256" },
      { "name": "wallet", "type": "address", "internalType": "address" },
      { "name": "identityHash", "type": "bytes32", "internalType": "bytes32" },
      { "name": "registeredBy", "type": "uint256", "internalType": "uint256" },
      { "name": "active", "type": "bool", "internalType": "bool" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isActiveLearner",
    "inputs": [{ "name": "wallet", "type": "address", "internalType": "address" }],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  }
];

const CERTIFICATES_ABI = [
  {
    "type": "function",
    "name": "issueCertificate",
    "inputs": [
      { "name": "learnerId", "type": "uint256", "internalType": "uint256" },
      { "name": "templateId", "type": "uint256", "internalType": "uint256" },
      { "name": "validUntil", "type": "uint256", "internalType": "uint256" },
      { "name": "dataHash", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revokeCertificate",
    "inputs": [{ "name": "certId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "certificates",
    "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "outputs": [
      { "name": "idHash", "type": "bytes32", "internalType": "bytes32" },
      { "name": "learnerId", "type": "uint256", "internalType": "uint256" },
      { "name": "templateId", "type": "uint256", "internalType": "uint256" },
      { "name": "staffId", "type": "uint256", "internalType": "uint256" },
      { "name": "instituteId", "type": "uint256", "internalType": "uint256" },
      { "name": "issuedAt", "type": "uint256", "internalType": "uint256" },
      { "name": "validUntil", "type": "uint256", "internalType": "uint256" },
      { "name": "revoked", "type": "bool", "internalType": "bool" },
      { "name": "dataHash", "type": "bytes32", "internalType": "bytes32" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "verifyCertificate",
    "inputs": [
      { "name": "certId", "type": "uint256", "internalType": "uint256" },
      { "name": "providedIdHash", "type": "bytes32", "internalType": "bytes32" },
      { "name": "providedDetailsHash", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [{ "name": "valid", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  }
];

export interface BlockchainState {
  provider: ethers.providers.JsonRpcProvider | null;
  signer: ethers.Signer | null;
  contracts: {
    certAgency: ethers.Contract | null;
    certifier: ethers.Contract | null;
    certTemplate: ethers.Contract | null;
    receiver: ethers.Contract | null;
    certificates: ethers.Contract | null;
  };
  address: string | null;
  isConnected: boolean;
  isAuthorized: boolean;
  userRole: 'admin' | 'institute' | 'staff' | 'learner' | null;
}

class BlockchainService {
  private state: BlockchainState = {
    provider: null,
    signer: null,
    contracts: {
      certAgency: null,
      certifier: null,
      certTemplate: null,
      receiver: null,
      certificates: null
    },
    address: null,
    isConnected: false,
    isAuthorized: false,
    userRole: null
  };

  private ensureReadContracts(): void {
    try {
      if (!this.state.provider) {
        // Prioritize RPC URL for consistent read-only access (verification)
        // Only use window.ethereum if explicit wallet connection is requested (handled in connectWallet) or RPC is missing
        const rpcUrl = RPC_URL || 'https://ethereum-sepolia.publicnode.com';
        if (rpcUrl) {
          console.log('Using RPC URL for provider:', rpcUrl);
          this.state.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
          // If purely using RPC, we're not "connected" in terms of wallet, but we are connected to network
        } else if (typeof (window as any)?.ethereum !== 'undefined') {
          this.state.provider = new ethers.providers.Web3Provider((window as any).ethereum);
        } else {
          // Fallback to default provider (may not work in production)
          console.warn('No RPC URL configured and no MetaMask detected. Using default provider which may not work in production.');
          this.state.provider = (ethers.getDefaultProvider() as unknown) as ethers.providers.JsonRpcProvider;
        }
      }

      const providerOrSigner = this.state.signer ?? this.state.provider!;
      const c = this.state.contracts;
      if (!c.certAgency) c.certAgency = new ethers.Contract(CONTRACT_ADDRESSES.certAgency, CERT_AGENCY_ABI, providerOrSigner);
      if (!c.certifier) c.certifier = new ethers.Contract(CONTRACT_ADDRESSES.certifier, CERTIFIER_ABI, providerOrSigner);
      if (!c.certTemplate) c.certTemplate = new ethers.Contract(CONTRACT_ADDRESSES.certTemplate, CERT_TEMPLATE_ABI, providerOrSigner);
      if (!c.receiver) c.receiver = new ethers.Contract(CONTRACT_ADDRESSES.receiver, RECEIVER_ABI, providerOrSigner);
      if (!c.certificates) c.certificates = new ethers.Contract(CONTRACT_ADDRESSES.certificates, CERTIFICATES_ABI, providerOrSigner);
    } catch (e) {
      // silent; verification calls will still error meaningfully
    }
  }

  // Connect to wallet
  async connectWallet(): Promise<{ success: boolean; address?: string; error?: string }> {
    try {
      if (typeof window.ethereum === 'undefined') {
        return { success: false, error: 'Please install MetaMask or another Web3 wallet!' };
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      // Initialize contracts
      const contracts = {
        certAgency: new ethers.Contract(CONTRACT_ADDRESSES.certAgency, CERT_AGENCY_ABI, signer),
        certifier: new ethers.Contract(CONTRACT_ADDRESSES.certifier, CERTIFIER_ABI, signer),
        certTemplate: new ethers.Contract(CONTRACT_ADDRESSES.certTemplate, CERT_TEMPLATE_ABI, signer),
        receiver: new ethers.Contract(CONTRACT_ADDRESSES.receiver, RECEIVER_ABI, signer),
        certificates: new ethers.Contract(CONTRACT_ADDRESSES.certificates, CERTIFICATES_ABI, signer)
      };

      console.log('Contract addresses:', CONTRACT_ADDRESSES);
      console.log('Contracts initialized:', Object.keys(contracts));

      this.state = {
        provider,
        signer,
        contracts,
        address,
        isConnected: true,
        isAuthorized: false,
        userRole: null
      };

      // Check user authorization and role
      await this.checkUserRole();

      return { success: true, address };
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      return { success: false, error: error.message || 'Failed to connect wallet' };
    }
  }

  // Check user role and authorization
  async checkUserRole(): Promise<void> {
    if (!this.state.address || !this.state.contracts.certAgency) return;

    try {
      const address = this.state.address;

      // Admin override: if connected wallet matches configured admin address
      if (ADMIN_ADDRESS && address.toLowerCase() === ADMIN_ADDRESS) {
        this.state.userRole = 'admin';
        this.state.isAuthorized = true;
        return;
      }

      // Check if user is an approved institute
      const isInstitute = await this.state.contracts.certAgency.isApprovedInstitute(address);
      if (isInstitute) {
        this.state.userRole = 'institute';
        this.state.isAuthorized = true;
        return;
      }

      // Check if user is approved staff
      const isStaff = await this.state.contracts.certifier.isApprovedStaff(address);
      if (isStaff) {
        this.state.userRole = 'staff';
        this.state.isAuthorized = true;
        return;
      }

      // Check if user is active learner
      const isLearner = await this.state.contracts.receiver.isActiveLearner(address);
      if (isLearner) {
        this.state.userRole = 'learner';
        this.state.isAuthorized = true;
        return;
      }

      // Default to unauthorized
      this.state.userRole = null;
      this.state.isAuthorized = false;
    } catch (error) {
      console.error('Error checking user role:', error);
      this.state.isAuthorized = false;
      this.state.userRole = null;
    }
  }

  // Get current state
  getState(): BlockchainState {
    return { ...this.state };
  }

  // Admin functions
  async addInstitute(name: string, walletAddress: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.state.contracts.certAgency) throw new Error('Not connected to blockchain');

      const tx = await this.state.contracts.certAgency.addInstitute(name, walletAddress);
      await tx.wait();

      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Error adding institute:', error);
      return { success: false, error: error.reason || error.message };
    }
  }

  async revokeInstitute(instituteId: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.state.contracts.certAgency) throw new Error('Not connected to blockchain');

      const tx = await this.state.contracts.certAgency.revokeInstitute(instituteId);
      await tx.wait();

      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Error revoking institute:', error);
      return { success: false, error: error.reason || error.message };
    }
  }

  async getAllInstitutes(): Promise<{ success: boolean; institutes?: any[]; error?: string }> {
    try {
      if (!this.state.contracts.certAgency) throw new Error('Not connected to blockchain');

      const institutes = [];
      const timeout = 8000; // 8 second timeout
      const startTime = Date.now();

      console.log('Starting optimized institute fetching...');

      // First, try to get institutes from events (faster approach)
      try {
        const filter = this.state.contracts.certAgency.filters.InstituteAdded();
        const events = await this.state.contracts.certAgency.queryFilter(filter);

        console.log(`Found ${events.length} institute events`);

        // Process events to get institute data
        for (const event of events) {
          if (Date.now() - startTime > timeout) {
            console.log('Timeout reached during event processing');
            break;
          }

          try {
            const instituteId = event.args?.id?.toString();
            if (instituteId) {
              const institute = await this.state.contracts.certAgency.institutes(instituteId);

              if (institute && institute.id.toString() !== '0') {
                institutes.push({
                  id: institute.id.toString(),
                  name: institute.name,
                  wallet: institute.wallet,
                  active: institute.active,
                  uniqueId: institute.id.toString(),
                });
              }
            }
          } catch (error) {
            console.log(`Error processing institute ${event.args?.id}:`, error);
          }
        }

        if (institutes.length > 0) {
          console.log(`Found ${institutes.length} institutes from events in ${Date.now() - startTime}ms`);
          return { success: true, institutes };
        }
      } catch (error) {
        console.log('Event-based fetching failed, falling back to direct method:', error);
      }

      // Fallback: Direct method with limited range
      console.log('Using fallback direct method...');
      let instituteId = 1;
      const maxAttempts = 20; // Only check first 20 institutes

      while (instituteId <= maxAttempts && Date.now() - startTime < timeout) {
        try {
          const institute = await this.state.contracts.certAgency.institutes(instituteId);

          if (institute && institute.id.toString() !== '0' && institute.id.toString() === instituteId.toString()) {
            institutes.push({
              id: institute.id.toString(),
              name: institute.name,
              wallet: institute.wallet,
              active: institute.active,
              uniqueId: institute.id.toString(),
            });
          }
          instituteId++;
        } catch (error) {
          // If we get an error, this ID doesn't exist
          break;
        }
      }

      console.log(`Found ${institutes.length} institutes in ${Date.now() - startTime}ms`);
      return { success: true, institutes };
    } catch (error: any) {
      console.error('Error fetching institutes:', error);
      return { success: false, error: error.reason || error.message };
    }
  }

  // Institute functions
  async addStaff(name: string, walletAddress: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.state.contracts.certifier) throw new Error('Not connected to blockchain');

      const tx = await this.state.contracts.certifier.addStaff(name, walletAddress);
      await tx.wait();

      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Error adding staff:', error);
      return { success: false, error: error.reason || error.message };
    }
  }

  async revokeStaff(staffId: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.state.contracts.certifier) throw new Error('Not connected to blockchain');

      const tx = await this.state.contracts.certifier.revokeStaff(staffId);
      await tx.wait();

      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Error revoking staff:', error);
      return { success: false, error: error.reason || error.message };
    }
  }

  async registerLearner(walletAddress: string, identityHash: string): Promise<{ success: boolean; txHash?: string; error?: string; learnerId?: number }> {
    try {
      if (!this.state.contracts.receiver) throw new Error('Not connected to blockchain');

      // Convert identityHash string to bytes32 format
      const identityHashBytes32 = ethers.utils.hexZeroPad(identityHash, 32);

      const tx = await this.state.contracts.receiver.registerLearner(walletAddress, identityHashBytes32);
      const receipt = await tx.wait();

      // Extract learner ID from LearnerRegistered event
      const event = receipt.events?.find((e: any) => e.event === 'LearnerRegistered');
      const learnerId = event?.args?.id ? Number(event.args.id.toString()) : undefined;

      return { success: true, txHash: tx.hash, learnerId };
    } catch (error: any) {
      console.error('Error registering learner:', error);
      return { success: false, error: error.reason || error.message };
    }
  }

  async getLearnerIdByWallet(walletAddress: string): Promise<number | null> {
    try {
      if (!this.state.contracts.receiver) throw new Error('Not connected to blockchain');
      const id = await this.state.contracts.receiver.walletToLearnerId(walletAddress);
      const num = Number(id.toString());
      return num > 0 ? num : null;
    } catch (error) {
      console.error('Error fetching learner id:', error);
      return null;
    }
  }

  async getLearnerById(learnerId: number): Promise<{ id: number; wallet: string; identityHash: string; registeredBy: number; active: boolean } | null> {
    try {
      if (!this.state.contracts.receiver) throw new Error('Not connected to blockchain');
      const learner = await this.state.contracts.receiver.learners(learnerId);
      return {
        id: learnerId,
        wallet: String(learner.wallet),
        identityHash: String(learner.identityHash),
        registeredBy: Number(learner.registeredBy?.toString?.() ?? learner.registeredBy ?? 0),
        active: Boolean(learner.active)
      };
    } catch (error) {
      console.error('Error fetching learner details:', error);
      return null;
    }
  }


  async isTemplateActive(templateId: number): Promise<boolean> {
    try {
      if (!this.state.contracts.certTemplate) throw new Error('Not connected to blockchain');
      return await this.state.contracts.certTemplate.isActiveTemplate(templateId);
    } catch (error) {
      console.error('Error checking template active:', error);
      return false;
    }
  }

  async getTemplateDetails(templateId: number): Promise<{ id: number; name: string; description?: string; creatorInstituteId: number; active?: boolean } | null> {
    try {
      if (!this.state.contracts.certTemplate) throw new Error('Not connected to blockchain');
      const t = await this.state.contracts.certTemplate.templates(templateId);
      const id = Number(t.id?.toString?.() ?? t.id);
      if (!id) return null;
      const name = String(t.name);
      const description = String(t.description ?? '');
      const creatorInstituteId = Number(t.creatorInstituteId?.toString?.() ?? t.creatorInstituteId);
      let active: boolean | undefined = undefined;
      try {
        active = await this.isTemplateActive(templateId);
      } catch (_) { }
      return { id, name, description, creatorInstituteId, active } as any;
    } catch (error) {
      console.error('Error reading template details:', error);
      return null;
    }
  }

  async createTemplate(name: string, description: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.state.contracts.certTemplate) throw new Error('Not connected to blockchain');

      const tx = await this.state.contracts.certTemplate.createTemplate(name, description);
      await tx.wait();

      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Error creating template:', error);
      return { success: false, error: error.reason || error.message };
    }
  }

  // Staff functions
  async issueCertificate(
    learnerId: number,
    templateId: number,
    validUntil: number,
    dataHash: string
  ): Promise<{ success: boolean; txHash?: string; certId?: number; error?: string }> {
    try {
      if (!this.state.contracts.certificates) throw new Error('Not connected to blockchain');

      // Test if contract is accessible
      try {
        const testCall = await this.state.contracts.certificates.certificates(0);
        console.log('Contract is accessible, test call result:', testCall);
      } catch (testError) {
        console.error('Contract test failed:', testError);
        // Don't throw error here, just log it and continue
        console.log('Contract test failed but continuing with certificate issuance...');
      }

      // Convert dataHash string to bytes32 format
      const dataHashBytes32 = ethers.utils.hexZeroPad(dataHash, 32);
      console.log('Calling issueCertificate with:', { learnerId, templateId, validUntil, dataHash, dataHashBytes32 });

      // Add gas estimation
      try {
        const gasEstimate = await this.state.contracts.certificates.estimateGas.issueCertificate(learnerId, templateId, validUntil, dataHashBytes32);
        console.log('Gas estimate:', gasEstimate.toString());
      } catch (gasError) {
        console.error('Gas estimation failed:', gasError);
      }

      const tx = await this.state.contracts.certificates.issueCertificate(learnerId, templateId, validUntil, dataHashBytes32);
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      console.log('Transaction status:', receipt.status);
      console.log('Transaction gas used:', receipt.gasUsed?.toString());

      // Extract certificate ID from events
      let certId: number | undefined;
      let eventFound = false;

      if (receipt.events) {
        console.log('Events in receipt:', receipt.events);
        const event = receipt.events.find((e: any) => e.event === 'CertificateIssued');
        if (event) {
          console.log('CertificateIssued event found:', event);
          certId = event.args?.certId?.toNumber();
          eventFound = true;
        } else {
          console.log('No CertificateIssued event found in events array');
        }
      }

      if (!eventFound && receipt.logs) {
        // Handle case where events are in logs array
        console.log('Checking logs for CertificateIssued event:', receipt.logs);
        const iface = new ethers.utils.Interface([
          'event CertificateIssued(uint256 indexed certId, uint256 learnerId, uint256 templateId, uint256 staffId, uint256 instituteId)'
        ]);

        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog(log);
            if (parsed.name === 'CertificateIssued') {
              console.log('CertificateIssued event found in logs:', parsed);
              certId = parsed.args?.certId?.toNumber();
              eventFound = true;
              break;
            }
          } catch (e) {
            // Not a CertificateIssued event, continue
          }
        }
      }

      // If transaction was successful but we couldn't parse the event, 
      // we can still consider it successful since the transaction went through
      if (receipt.status === 1) {
        console.log('Transaction successful, status:', receipt.status);

        // If we couldn't get certId from events, try to get it by querying the contract
        if (!certId) {
          try {
            // Try to get the latest certificate ID for this learner
            // This is a fallback method
            console.log('Attempting to get certificate ID by querying contract...');
            // Note: This would require additional contract methods to implement
            // For now, we'll just return success without the certId
            console.log('Could not retrieve certificate ID, but transaction was successful');
          } catch (queryError) {
            console.log('Could not query certificate ID:', queryError);
          }
        }

        return { success: true, txHash: tx.hash, certId: certId || undefined };
      } else {
        console.log('Transaction failed, status:', receipt.status);
        return { success: false, error: 'Transaction failed' };
      }
    } catch (error: any) {
      console.error('Error issuing certificate:', error);
      return { success: false, error: error.reason || error.message || 'Unknown error occurred' };
    }
  }

  async revokeCertificate(certId: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.state.contracts.certificates) throw new Error('Not connected to blockchain');

      const tx = await this.state.contracts.certificates.revokeCertificate(certId);
      await tx.wait();

      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Error revoking certificate:', error);
      return { success: false, error: error.reason || error.message };
    }
  }

  // Verification functions
  async verifyCertificate(
    certId: number,
    providedIdHash: string,
    providedDetailsHash: string
  ): Promise<{ success: boolean; isValid?: boolean; certificateData?: any; error?: string }> {
    try {
      if (!this.state.contracts.certificates || !this.state.provider) {
        this.ensureReadContracts();
      }
      if (!this.state.contracts.certificates) throw new Error('Not connected to blockchain');

      // Convert hash strings to bytes32 format
      const idHashBytes32 = ethers.utils.hexZeroPad(providedIdHash, 32);
      const detailsHashBytes32 = ethers.utils.hexZeroPad(providedDetailsHash, 32);

      const isValid = await this.state.contracts.certificates.verifyCertificate(
        certId,
        idHashBytes32,
        detailsHashBytes32
      );

      if (isValid) {
        const certificateData = await this.state.contracts.certificates.certificates(certId);
        return { success: true, isValid: true, certificateData };
      }

      return { success: true, isValid: false };
    } catch (error: any) {
      console.error('Error verifying certificate:', error);
      return { success: false, error: error.reason || error.message };
    }
  }

  async getCertificateData(certId: number): Promise<{
    exists: boolean;
    idHash?: string;
    learnerId?: number;
    templateId?: number;
    staffId?: number;
    instituteId?: number;
    issuedAt?: number;
    validUntil?: number;
    revoked?: boolean;
    dataHash?: string;
  }> {
    try {
      if (!this.state.contracts.certificates || !this.state.provider) {
        this.ensureReadContracts();
      }
      if (!this.state.contracts.certificates) throw new Error('Not connected to blockchain');
      const c = await this.state.contracts.certificates.certificates(certId);
      const idHash: string = String(c.idHash);
      const exists = !!idHash && idHash !== ethers.constants.HashZero;
      return {
        exists,
        idHash,
        learnerId: Number(c.learnerId?.toString?.() ?? c.learnerId ?? 0),
        templateId: Number(c.templateId?.toString?.() ?? c.templateId ?? 0),
        staffId: Number(c.staffId?.toString?.() ?? c.staffId ?? 0),
        instituteId: Number(c.instituteId?.toString?.() ?? c.instituteId ?? 0),
        issuedAt: Number(c.issuedAt?.toString?.() ?? c.issuedAt ?? 0),
        validUntil: Number(c.validUntil?.toString?.() ?? c.validUntil ?? 0),
        revoked: Boolean(c.revoked),
        dataHash: String(c.dataHash)
      };
    } catch (e) {
      return { exists: false };
    }
  }

  // Utility functions
  // Creates a Keccak-256 hash of the input data
  // Keccak-256 is the same algorithm used by Ethereum for hashing
  createHash(data: string): string {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(data));
  }

  // Check if running in secure context (required for camera access)
  isSecureContext(): boolean {
    return isSecureContext();
  }

  // Test blockchain connectivity
  async testConnectivity(): Promise<{ connected: boolean; error?: string; networkInfo?: any; networkMismatch?: boolean }> {
    try {
      console.log('Testing connectivity...');
      this.ensureReadContracts();
      if (!this.state.provider) {
        console.error('No provider available');
        return { connected: false, error: 'No provider available' };
      }

      // Test basic connectivity
      console.log('Getting network...');
      const network = await this.state.provider.getNetwork();
      console.log('Network:', network);
      console.log('Getting block number...');
      const blockNumber = await this.state.provider.getBlockNumber();
      console.log('Block number:', blockNumber);

      // Check if we're on a supported network
      const supportedChainIds = Object.values(SUPPORTED_NETWORKS).map(n => n.chainId);
      const networkMismatch = !supportedChainIds.includes(network.chainId);

      return {
        connected: true,
        networkInfo: {
          name: network.name,
          chainId: network.chainId,
          blockNumber: blockNumber
        },
        networkMismatch
      };
    } catch (error: any) {
      console.error('Blockchain connectivity test failed:', error);

      // Check for specific error types
      let errorMessage = error.message || 'Failed to connect to blockchain';
      if (error.message?.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please check your RPC URL configuration.';
      } else if (error.message?.includes('401')) {
        errorMessage = 'Unauthorized. Please check your RPC URL and API key.';
      } else if (error.message?.includes('CORS')) {
        errorMessage = 'CORS error. RPC URL may not be accessible from browser.';
      }

      return {
        connected: false,
        error: errorMessage
      };
    }
  }

  formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Generate a unique ID for local state management
  generateInstituteId(name: string, existingIds: string[]): string {
    const baseId = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    let counter = 1;
    let uniqueId = baseId;

    while (existingIds.includes(uniqueId)) {
      uniqueId = `${baseId}_${counter}`;
      counter++;
    }

    return uniqueId;
  }

  // Note: ID generation functions removed - now using actual blockchain IDs

  // ------- Helpers for IDs -------
  async getStaffIdByWallet(walletAddress: string): Promise<number | null> {
    try {
      if (!this.state.contracts.certifier) throw new Error('Not connected to blockchain');
      const id = await this.state.contracts.certifier.walletToStaffId(walletAddress);
      const num = Number(id.toString());
      return num > 0 ? num : null;
    } catch (error) {
      console.error('Error fetching staff id:', error);
      return null;
    }
  }

  async getInstituteIdByWallet(walletAddress: string): Promise<number | null> {
    try {
      if (!this.state.contracts.certAgency) throw new Error('Not connected to blockchain');
      const id = await this.state.contracts.certAgency.walletToInstituteId(walletAddress);
      const num = Number(id.toString());
      return num > 0 ? num : null;
    } catch (error) {
      console.error('Error fetching institute id:', error);
      return null;
    }
  }

  async getInstituteDetails(instituteId: number): Promise<{ id: number; name: string; wallet: string; active: boolean } | null> {
    try {
      if (!this.state.contracts.certAgency) throw new Error('Not connected to blockchain');
      const inst = await this.state.contracts.certAgency.institutes(instituteId);
      const id = Number(inst.id?.toString?.() ?? inst.id);
      if (!id) return null;
      return {
        id,
        name: String(inst.name),
        wallet: String(inst.wallet),
        active: Boolean(inst.active)
      };
    } catch (error) {
      console.error('Error reading institute details:', error);
      return null;
    }
  }

  async getStaffDetails(staffId: number): Promise<{ id: number; name: string; wallet: string; instituteId: number; active: boolean } | null> {
    try {
      if (!this.state.contracts.certifier) throw new Error('Not connected to blockchain');
      const staff = await this.state.contracts.certifier.staffMembers(staffId);
      const id = Number(staff.id?.toString?.() ?? staff.id);
      if (!id) return null;
      return {
        id,
        name: String(staff.name),
        wallet: String(staff.wallet),
        instituteId: Number(staff.instituteId?.toString?.() ?? staff.instituteId),
        active: Boolean(staff.active)
      };
    } catch (error) {
      console.error('Error reading staff details:', error);
      return null;
    }
  }

  async getInstituteIdByStaffWallet(walletAddress: string): Promise<number | null> {
    try {
      if (!this.state.contracts.certifier) throw new Error('Not connected to blockchain');
      // staffMembers mapping gives instituteId
      const staffId = await this.state.contracts.certifier.walletToStaffId(walletAddress);
      const idNum = Number(staffId.toString());
      if (!idNum || idNum <= 0) return null;
      const staff = await this.state.contracts.certifier.staffMembers(idNum);
      const instituteId = Number(staff.instituteId?.toString?.() ?? staff.instituteId);
      return instituteId > 0 ? instituteId : null;
    } catch (error) {
      console.error('Error fetching institute id by staff wallet:', error);
      return null;
    }
  }

  // ------- Event-based queries -------
  async fetchIssuedCertificatesByStaff(
    staffId: number,
    fromBlock = 0,
    toBlock?: number
  ): Promise<Array<{ certId: number; learnerId: number; templateId: number; txHash: string; blockNumber: number; timestamp: number }>> {
    if (!this.state.provider) throw new Error('Not connected to provider');
    const iface = new ethers.utils.Interface([
      'event CertificateIssued(uint256 indexed certId, uint256 learnerId, uint256 templateId, uint256 staffId, uint256 instituteId)'
    ]);
    const topic = iface.getEventTopic('CertificateIssued');
    const staffTopic = ethers.utils.hexZeroPad(ethers.utils.hexlify(staffId), 32);
    const filter = {
      address: CONTRACT_ADDRESSES.certificates,
      topics: [topic, null, null, null, null],
      fromBlock,
      toBlock: toBlock ?? 'latest'
    } as any;
    const logs = await this.state.provider.getLogs(filter);
    const withParsed = logs
      .map((l) => ({ parsed: iface.parseLog(l), log: l }))
      .filter((d: any) => Number(d.parsed.args.staffId.toString()) === staffId);

    const results: Array<{ certId: number; learnerId: number; templateId: number; txHash: string; blockNumber: number; timestamp: number }> = [];
    for (const item of withParsed) {
      const block = await this.state.provider!.getBlock(item.log.blockNumber);
      results.push({
        certId: Number(item.parsed.args.certId.toString()),
        learnerId: Number(item.parsed.args.learnerId.toString()),
        templateId: Number(item.parsed.args.templateId.toString()),
        txHash: item.log.transactionHash,
        blockNumber: item.log.blockNumber,
        timestamp: Number(block.timestamp)
      });
    }
    return results;
  }

  async fetchCertificatesByLearnerWallet(
    walletAddress: string,
    fromBlock = 0,
    toBlock?: number
  ): Promise<Array<{ certId: number; templateId: number; templateName?: string; instituteId?: number; instituteName?: string; learnerName?: string; issuedAt: number; validUntil?: number; revoked: boolean; txHash: string }>> {
    if (!this.state.provider) this.ensureReadContracts();
    if (!this.state.provider) throw new Error('Not connected to provider');
    const learnerId = await this.getLearnerIdByWallet(walletAddress);
    if (!learnerId) return [];
    const iface = new ethers.utils.Interface([
      'event CertificateIssued(uint256 indexed certId, uint256 learnerId, uint256 templateId, uint256 staffId, uint256 instituteId)'
    ]);
    const topic = iface.getEventTopic('CertificateIssued');
    const filter = {
      address: CONTRACT_ADDRESSES.certificates,
      topics: [topic],
      fromBlock,
      toBlock: toBlock ?? 'latest'
    } as any;
    const logs = await this.state.provider.getLogs(filter);
    const matches = logs
      .map((l) => ({ parsed: iface.parseLog(l), log: l }))
      .filter((d: any) => Number(d.parsed.args.learnerId.toString()) === learnerId);
    const results: Array<{ certId: number; templateId: number; templateName?: string; instituteId?: number; instituteName?: string; learnerName?: string; issuedAt: number; validUntil?: number; revoked: boolean; txHash: string }> = [];
    for (const item of matches) {
      const block = await this.state.provider!.getBlock(item.log.blockNumber);
      // also read revoked flag from contract storage
      let revoked = false;
      let validUntil: number | undefined = undefined;
      let instituteId: number | undefined = undefined;
      try {
        if (!this.state.contracts.certificates) this.ensureReadContracts();
        const certData = await this.state.contracts.certificates!.certificates(Number(item.parsed.args.certId.toString()));
        revoked = Boolean(certData.revoked);
        validUntil = Number(certData.validUntil?.toString?.() ?? certData.validUntil ?? 0);
        instituteId = Number(certData.instituteId?.toString?.() ?? certData.instituteId ?? 0) || undefined;
      } catch (_) { }
      let templateName: string | undefined = undefined;
      try {
        const t = await this.getTemplateDetails(Number(item.parsed.args.templateId.toString()));
        templateName = t?.name;
      } catch (_) { }
      let instituteName: string | undefined = undefined;
      try {
        if (typeof instituteId === 'number') {
          const inst = await this.getInstituteDetails(instituteId);
          instituteName = inst?.name;
        }
      } catch (_) { }
      // For now, we'll show a generic learner name since we can't reverse the hash
      // In a future implementation, learner names could be stored separately
      let learnerName = 'Certificate Holder';

      results.push({
        certId: Number(item.parsed.args.certId.toString()),
        templateId: Number(item.parsed.args.templateId.toString()),
        templateName,
        instituteId,
        instituteName,
        learnerName,
        issuedAt: Number(block.timestamp),
        validUntil,
        revoked,
        txHash: item.log.transactionHash
      });
    }
    return results;
  }

  async fetchStaffAddedByInstitute(
    instituteId: number,
    fromBlock = 0,
    toBlock?: number
  ): Promise<Array<{ id: number; name: string; wallet: string; blockNumber: number; timestamp: number }>> {
    if (!this.state.provider) throw new Error('Not connected to provider');
    const iface = new ethers.utils.Interface([
      'event StaffAdded(uint256 indexed id, string name, address wallet, uint256 instituteId)'
    ]);
    const topic = iface.getEventTopic('StaffAdded');
    const filter = {
      address: CONTRACT_ADDRESSES.certifier,
      topics: [topic],
      fromBlock,
      toBlock: toBlock ?? 'latest'
    } as any;
    const logs = await this.state.provider.getLogs(filter);
    const filtered = logs
      .map((l) => ({ parsed: iface.parseLog(l), log: l }))
      .filter((d: any) => Number(d.parsed.args.instituteId.toString()) === instituteId);
    const results: Array<{ id: number; name: string; wallet: string; blockNumber: number; timestamp: number }> = [];
    for (const item of filtered) {
      const block = await this.state.provider!.getBlock(item.log.blockNumber);
      results.push({
        id: Number(item.parsed.args.id.toString()),
        name: String(item.parsed.args.name),
        wallet: String(item.parsed.args.wallet),
        blockNumber: item.log.blockNumber,
        timestamp: Number(block.timestamp)
      });
    }
    return results;
  }

  async fetchLearnersByInstitute(
    instituteId: number,
    fromBlock = 0,
    toBlock?: number
  ): Promise<Array<{ id: number; wallet: string; blockNumber: number; timestamp: number }>> {
    if (!this.state.provider) throw new Error('Not connected to provider');
    const iface = new ethers.utils.Interface([
      'event LearnerRegistered(uint256 indexed id, address wallet, bytes32 identityHash, uint256 instituteId)'
    ]);
    const topic = iface.getEventTopic('LearnerRegistered');
    const filter = {
      address: CONTRACT_ADDRESSES.receiver,
      topics: [topic],
      fromBlock,
      toBlock: toBlock ?? 'latest'
    } as any;
    const logs = await this.state.provider.getLogs(filter);
    const filtered = logs
      .map((l) => ({ parsed: iface.parseLog(l), log: l }))
      .filter((d: any) => Number(d.parsed.args.instituteId.toString()) === instituteId);
    const results: Array<{ id: number; wallet: string; blockNumber: number; timestamp: number }> = [];
    for (const item of filtered) {
      const block = await this.state.provider!.getBlock(item.log.blockNumber);
      results.push({
        id: Number(item.parsed.args.id.toString()),
        wallet: String(item.parsed.args.wallet),
        blockNumber: item.log.blockNumber,
        timestamp: Number(block.timestamp)
      });
    }
    return results;
  }

  async fetchTemplatesByInstitute(
    instituteId: number,
    fromBlock = 0,
    toBlock?: number
  ): Promise<Array<{ id: number; name: string; blockNumber: number; timestamp: number }>> {
    if (!this.state.provider) throw new Error('Not connected to provider');
    const iface = new ethers.utils.Interface([
      'event TemplateCreated(uint256 indexed id, string name, uint256 instituteId)'
    ]);
    const topic = iface.getEventTopic('TemplateCreated');
    const filter = {
      address: CONTRACT_ADDRESSES.certTemplate,
      topics: [topic],
      fromBlock,
      toBlock: toBlock ?? 'latest'
    } as any;
    const logs = await this.state.provider.getLogs(filter);
    const filtered = logs
      .map((l) => ({ parsed: iface.parseLog(l), log: l }))
      .filter((d: any) => Number(d.parsed.args.instituteId.toString()) === instituteId);
    const results: Array<{ id: number; name: string; blockNumber: number; timestamp: number }> = [];
    for (const item of filtered) {
      const block = await this.state.provider!.getBlock(item.log.blockNumber);
      results.push({
        id: Number(item.parsed.args.id.toString()),
        name: String(item.parsed.args.name),
        blockNumber: item.log.blockNumber,
        timestamp: Number(block.timestamp)
      });
    }
    return results;
  }

  // ------- Manager/Admin history -------
  async fetchInstitutesHistory(
    fromBlock = 0,
    toBlock?: number
  ): Promise<Array<{ id: number; name?: string; wallet?: string; event: 'added' | 'revoked'; blockNumber: number; timestamp: number }>> {
    if (!this.state.provider) throw new Error('Not connected to provider');

    // We assume these events exist on the CertAgency contract
    const addedIface = new ethers.utils.Interface([
      'event InstituteAdded(uint256 indexed id, string name, address wallet)'
    ]);
    const revokedIface = new ethers.utils.Interface([
      'event InstituteRevoked(uint256 indexed id)'
    ]);

    const addedTopic = addedIface.getEventTopic('InstituteAdded');
    const revokedTopic = revokedIface.getEventTopic('InstituteRevoked');

    const [addedLogs, revokedLogs] = await Promise.all([
      this.state.provider.getLogs({ address: CONTRACT_ADDRESSES.certAgency, topics: [addedTopic], fromBlock, toBlock: toBlock ?? 'latest' } as any),
      this.state.provider.getLogs({ address: CONTRACT_ADDRESSES.certAgency, topics: [revokedTopic], fromBlock, toBlock: toBlock ?? 'latest' } as any)
    ]);

    const results: Array<{ id: number; name?: string; wallet?: string; event: 'added' | 'revoked'; blockNumber: number; timestamp: number }> = [];

    for (const l of addedLogs) {
      const parsed = addedIface.parseLog(l as any);
      const block = await this.state.provider!.getBlock(l.blockNumber);
      results.push({
        id: Number(parsed.args.id.toString()),
        name: String(parsed.args.name),
        wallet: String(parsed.args.wallet),
        event: 'added',
        blockNumber: l.blockNumber,
        timestamp: Number(block.timestamp)
      });
    }

    for (const l of revokedLogs) {
      const parsed = revokedIface.parseLog(l as any);
      const block = await this.state.provider!.getBlock(l.blockNumber);
      results.push({
        id: Number(parsed.args.id.toString()),
        event: 'revoked',
        blockNumber: l.blockNumber,
        timestamp: Number(block.timestamp)
      });
    }

    // Sort by blockNumber asc (chronological)
    results.sort((a, b) => a.blockNumber - b.blockNumber);
    return results;
  }
}

// Create singleton instance
export const blockchainService = new BlockchainService();
export default blockchainService;
