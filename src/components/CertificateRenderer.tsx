import { getTemplateById } from "@/templates/certificates";
import type { CertificateData } from "@/templates/certificates";

interface CertificateRendererProps {
    templateId: string;
    certificateData: CertificateData;
    includeQR?: boolean;
    qrData?: string;
    onRenderComplete?: (dataUrl: string) => void;
    className?: string;
}

export function CertificateRenderer({
    templateId,
    certificateData,
    includeQR = false,
    qrData,
    onRenderComplete,
    className = ""
}: CertificateRendererProps) {
    // Get the template component from the registry
    const template = getTemplateById(templateId);

    if (!template) {
        return (
            <div className={`relative ${className}`}>
                <div className="flex items-center justify-center bg-destructive/10 backdrop-blur-sm rounded-lg p-8">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-destructive font-medium">Template not found</p>
                        <p className="text-xs text-muted-foreground">Template ID: {templateId}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Render the template component
    const TemplateComponent = template.component;

    return (
        <div className={`certificate-renderer ${className}`}>
            <TemplateComponent
                certificateData={certificateData}
                includeQR={includeQR}
                qrData={qrData}
                className="w-full"
            />
        </div>
    );
}
