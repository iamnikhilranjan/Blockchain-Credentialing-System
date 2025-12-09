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
        const response = await fetch(`${API_BASE_URL}/api/mongo-certificates/${walletAddress}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            return result.data || [];
        }

        throw new Error(result.error || 'Failed to fetch MongoDB certificates');
    } catch (error) {
        console.error('Error fetching MongoDB certificates:', error);
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

    return {
        ...defaults,
        // Map MongoDB fields to SkillCertificate fields
        candidateName: mongoData.candidateFullName || defaults.candidateName,
        certificateNo: mongoData.certificateNumber || defaults.certificateNo,
        dateOfBirth: mongoData.dateOfBirth || defaults.dateOfBirth,
        jobRole: mongoData.qualificationName || defaults.jobRole,
        nsqfLevel: mongoData.nsqfLevel ? `Level ${mongoData.nsqfLevel}` : defaults.nsqfLevel,
        grade: mongoData.assessmentResult || defaults.grade,
        dateOfIssue: mongoData.dateOfIssue || defaults.dateOfIssue,
        assessedBy: mongoData.awardingBodyName || defaults.assessedBy,
        trainingCentre: mongoData.trainingProviderName || defaults.trainingCentre,
    };
}
