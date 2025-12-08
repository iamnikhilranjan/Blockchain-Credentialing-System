import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Award } from "lucide-react";
import { CertificateRenderer } from "@/components/CertificateRenderer";

interface CertificatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: {
    learnerId: string;
    learnerName?: string;
    marks: string;
    templateId: string;
    templateName?: string;
    templateDescription?: string;
    instituteName?: string;
    issueDate: string;
    expiryDate: string;
    certificateId?: string;
  };
  visualTemplateId?: string;
}

export function CertificatePreview({ isOpen, onClose, certificateData, visualTemplateId }: CertificatePreviewProps) {
  const {
    learnerId,
    learnerName,
    marks,
    templateId,
    templateName,
    templateDescription,
    instituteName,
    issueDate,
    expiryDate,
    certificateId
  } = certificateData;

  // Use visual template if selected, otherwise fall back to template-1
  const selectedVisualTemplate = visualTemplateId || "template-1";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-accent" />
              <span>Certificate Preview</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Certificate Renderer - Preview Mode (No QR Code) */}
          <div className="bg-secondary/10 p-4 rounded-lg">
            <CertificateRenderer
              templateId={selectedVisualTemplate}
              certificateData={{
                certificateId: certificateId || "Preview",
                learnerName: learnerName || "N/A",
                courseName: templateName,
                marks: marks,
                issueDate: issueDate,
                expiryDate: expiryDate === "lifetime" ? undefined : expiryDate,
                instituteName: instituteName
              }}
              includeQR={false}
              qrData={certificateId ? `https://verify.example.com/cert/${certificateId}` : undefined}
              className="w-full"
            />
          </div>

          {/* Certificate Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-card/50 rounded-lg p-4">
              <label className="text-xs text-muted-foreground">Learner ID</label>
              <p className="font-medium">{learnerId}</p>
            </div>
            <div className="bg-card/50 rounded-lg p-4">
              <label className="text-xs text-muted-foreground">Template ID</label>
              <p className="font-medium">{templateId}</p>
            </div>
            {templateDescription && (
              <div className="bg-card/50 rounded-lg p-4 md:col-span-2">
                <label className="text-xs text-muted-foreground">Course Description</label>
                <p className="text-xs mt-1">{templateDescription}</p>
              </div>
            )}
          </div>

          {/* Security Note */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <p className="text-sm text-accent font-medium">
              🔒 Preview Mode: This is a preview without QR code. The final certificate will include a QR code for verification.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-border/50">
          <div className="text-center text-xs text-muted-foreground">
            <p>This is a preview. Certificate details will be finalized upon blockchain issuance.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
