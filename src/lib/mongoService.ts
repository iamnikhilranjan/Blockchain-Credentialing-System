// MongoDB Certificate Service
export interface MongoCertificateData {
    _id: string;
    walletAddress: string;
    certificateNumber?: string;
    candidateFullName?: string;
    dateOfBirth?: string;
    qualificationName?: string;
    nsqfLevel?: string;
    assessmentResult?: string;
    dateOfIssue?: string;
    awardingBodyName?: string;
    trainingProviderName?: string;
    vcId?: string;
    signature?: string;
    credentialHash?: string;
    digilockerMetadata?: any;
    doctype_version?: string;
    issuerId?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchMongoCertificates(walletAddress: string): Promise<MongoCertificateData[]> {
    try {
        console.log('🔍 Fetching MongoDB certificates for wallet:', walletAddress);
        const url = `${API_BASE_URL}/api/mongo-certificates/${walletAddress}`;
        console.log('📡 API URL:', url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('📦 MongoDB API response:', result);

        if (result.success) {
            console.log(`✅ Found ${result.data.length} MongoDB certificates`);
            return result.data || [];
        }

        throw new Error(result.error || 'Failed to fetch MongoDB certificates');
    } catch (error) {
        console.error('❌ Error fetching MongoDB certificates:', error);
        return [];
    }
}

// Merge MongoDB data with SkillCertificate defaults
export function mergeWithSkillCertificateDefaults(mongoData: MongoCertificateData) {
    const defaults = {
        candidateName: "Rahul Kumar Singh",
        fatherName: "Vijay Kumar Singh",
        dateOfBirth: "15/08/2000",
        enrollmentNo: "EN2025001234",
        assessedBy: "National Assessment and Accreditation Council",
        jobRole: "Full Stack Web Developer",
        nsqfLevel: "Level 5",
        duration: "6 Months",
        creditsEarned: "120 Credits",
        trainingCentre: "National Skill Training Institute",
        district: "Central Delhi",
        state: "Delhi",
        grade: "85% / Grade A",
        placeOfIssue: "New Delhi",
        dateOfIssue: "09/12/2025",
        certificateNo: "SKILL2025001234",
        apaarId: "724386800059",
    };

    // Helper function to convert Unix timestamp to DD/MM/YYYY
    const convertTimestampToDate = (timestamp?: string): string => {
        if (!timestamp) return '';
        const ts = parseInt(timestamp);
        if (isNaN(ts)) return timestamp; // Return as-is if not a number
        const date = new Date(ts * 1000); // Convert seconds to milliseconds
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return {
        ...defaults,
        // Map MongoDB fields to SkillCertificate fields
        candidateName: mongoData.candidateFullName || defaults.candidateName,
        certificateNo: mongoData.certificateNumber || defaults.certificateNo,
        dateOfBirth: convertTimestampToDate(mongoData.dateOfBirth) || defaults.dateOfBirth,
        jobRole: mongoData.qualificationName || defaults.jobRole,
        nsqfLevel: mongoData.nsqfLevel ? `Level ${mongoData.nsqfLevel}` : defaults.nsqfLevel,
        grade: mongoData.assessmentResult || defaults.grade,
        dateOfIssue: convertTimestampToDate(mongoData.dateOfIssue) || defaults.dateOfIssue,
        assessedBy: mongoData.awardingBodyName || defaults.assessedBy,
        trainingCentre: mongoData.trainingProviderName || defaults.trainingCentre,
        // Add signature as QR data
        qrData: mongoData.signature || mongoData.vcId || `cert:${mongoData.certificateNumber}`,
    };
}
