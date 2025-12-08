/**
 * Shared TypeScript interfaces for certificate templates
 */

export interface CertificateData {
    certificateId?: string;
    learnerName: string;
    courseName?: string;
    marks: string;
    issueDate: string;
    expiryDate?: string;
    instituteName?: string;
    identityHash?: string;  // The dataHash from blockchain
}

export interface CertificateTemplateProps {
    certificateData: CertificateData;
    includeQR?: boolean;
    qrData?: string;
    className?: string;
}

export interface TemplateMetadata {
    id: string;
    name: string;
    description: string;
    thumbnailPath: string;
    component: React.ComponentType<CertificateTemplateProps>;
}
