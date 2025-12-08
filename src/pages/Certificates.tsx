import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Award, QrCode } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CertificateRenderer } from "@/components/CertificateRenderer";
import { useBlockchain } from "@/contexts/BlockchainContext";
import blockchainService from "@/lib/blockchain";
import { useToast } from "@/hooks/use-toast";
import { createRoot } from "react-dom/client";
import { useTranslation, Trans } from "react-i18next";

export default function Certificates() {
  const { t } = useTranslation();
  const { address } = useBlockchain();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState<Array<{ id: number; templateId: number; templateName?: string; instituteName?: string; learnerName?: string; issuedAt: number; validUntil?: number; revoked: boolean; dataHash?: string; txHash: string }>>([]);

  const handleDownloadPdf = async (cert: typeof certificates[0]) => {
    try {
      toast({ title: t('generatingPDF'), description: t('generatingPDFDesc') });

      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      document.body.appendChild(container);

      // Render the certificate
      const root = createRoot(container);

      await new Promise<void>((resolve) => {
        root.render(
          <div style={{ width: '210mm', height: '297mm' }}>
            <CertificateRenderer
              templateId="template-1"
              certificateData={{
                certificateId: cert.id.toString(),
                learnerName: cert.learnerName || t('certificateHolder'),
                courseName: cert.templateName || t('defaultTemplateName'),
                marks: "N/A",
                issueDate: new Date(cert.issuedAt * 1000).toLocaleDateString(),
                expiryDate: cert.validUntil && cert.validUntil > 0
                  ? new Date(cert.validUntil * 1000).toLocaleDateString()
                  : t('lifetime'),
                instituteName: cert.instituteName || t('defaultInstituteName'),
                identityHash: cert.dataHash  // Pass the actual dataHash from blockchain
              }}
              includeQR={true}
              qrData={`${window.location.origin}/verify?certId=${cert.id}`}
            />
          </div>
        );
        // Wait for render
        setTimeout(resolve, 1000);
      });

      // Import libraries and generate PDF
      const [{ default: html2canvas }, { default: jsPDF }]: any = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      const canvas = await html2canvas(container.firstChild as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`certificate-${cert.id}.pdf`);

      // Cleanup
      root.unmount();
      document.body.removeChild(container);

      toast({ title: t('downloadSuccess'), description: t('downloadSuccessDesc') });
    } catch (e: any) {
      console.error('PDF generation error:', e);
      toast({
        title: t('downloadFailed'),
        description: e?.message || t('downloadFailedDesc'),
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {

    const load = async () => {
      if (!address) { setCertificates([]); return; }
      setLoading(true);
      try {
        const rows = await blockchainService.fetchCertificatesByLearnerWallet(address);
        setCertificates(rows.map(r => ({
          id: r.certId,
          templateId: r.templateId,
          templateName: r.templateName,
          instituteName: r.instituteName,
          learnerName: r.learnerName,
          issuedAt: r.issuedAt,
          validUntil: r.validUntil,
          revoked: r.revoked,
          dataHash: r.dataHash,
          txHash: r.txHash
        })));
      } catch (_) {
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [address]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-12 blockchain-grid">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12 space-y-4">
            <h1 className="font-heading text-4xl md:text-5xl font-bold">
              <Trans
                i18nKey="myCertificatesTitle"
                components={{ 1: <span className="text-accent" /> }}
              />
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('myCertificatesSubtitle')}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-card/50 backdrop-blur-sm border-accent/20">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">{certificates.length}</p>
                  <p className="text-sm text-muted-foreground">{t('totalCertificates')}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <QrCode className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">{certificates.length}</p>
                  <p className="text-sm text-muted-foreground">{t('activeCredentials')}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <ExternalLink className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">100%</p>
                  <p className="text-sm text-muted-foreground">{t('verifiedStat')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Certificate Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert, index) => (
              <Card
                key={cert.txHash}
                className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-card group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge
                      variant="default"
                      className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20"
                    >
                      {cert.revoked ? t('revokedStatus') : t('activeStatus')}
                    </Badge>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{t('certId')}</div>
                      <div className="font-mono text-sm font-bold text-accent">#{cert.id}</div>
                    </div>
                  </div>
                  <CardTitle className="font-heading text-lg leading-tight group-hover:text-accent transition-colors">
                    {cert.templateName || t('defaultTemplateName')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Certificate Details - No Duplicates */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">{t('institute')}</span>
                      <span className="font-medium text-right">{cert.instituteName || t('defaultInstituteName')}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">{t('issueDate')}</span>
                      <span className="font-medium">{new Date(cert.issuedAt * 1000).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">{t('validity')}</span>
                      <span className="font-medium">{cert.validUntil && cert.validUntil > 0 ? new Date(cert.validUntil * 1000).toLocaleDateString() : t('lifetime')}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">{t('status')}</span>
                      <span className={`font-medium ${cert.revoked ? 'text-destructive' : 'text-accent'}`}>
                        {cert.revoked ? t('revokedStatus') : t('verifiedStatus')}
                      </span>
                    </div>
                  </div>

                  {/* Download Certificate Button */}
                  <div className="pt-4 border-t border-border/50 space-y-2">
                    <Button
                      variant="neon"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => handleDownloadPdf(cert)}
                    >
                      <Download className="h-4 w-4" />
                      {t('downloadCertificate')}
                    </Button>
                    <Button
                      size="sm"
                      className="w-full gap-2 bg-[#2B3890] hover:bg-[#1a235e] text-white border-0"
                      onClick={() => navigate('/digilocker', { state: { certificate: cert } })}
                    >
                      <ExternalLink className="h-3 w-3" />
                      {t('addToDigilocker')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {certificates.length === 0 && !loading && (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="py-16 text-center space-y-4">
                <Award className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
                <div className="space-y-2">
                  <h3 className="font-heading text-xl font-semibold">{t('noCertificatesTitle')}</h3>
                  <p className="text-muted-foreground">
                    {t('noCertificatesDesc')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {loading && (
            <p className="text-sm text-muted-foreground mt-6">{t('loadingCertificates')}</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
