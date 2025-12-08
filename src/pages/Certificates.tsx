import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download, ExternalLink, Award } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useBlockchain } from "@/contexts/BlockchainContext";
import blockchainService from "@/lib/blockchain";
import { useToast } from "@/hooks/use-toast";

export default function Certificates() {
  const { address } = useBlockchain();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState<Array<{ id: number; templateId: number; templateName?: string; instituteName?: string; learnerName?: string; issuedAt: number; validUntil?: number; revoked: boolean; txHash: string }>>([]);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});

  const handleDownloadPdf = async (key: string) => {
    try {
      const el = cardRefs.current[key];
      if (!el) return;
      const [{ default: html2canvas }, { default: jsPDF }]: any = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`certificate-${key}.pdf`);
    } catch (e: any) {
      toast({ title: 'Download failed', description: e?.message || 'Please install dependencies', variant: 'destructive' });
    }
  };

  const handleGenerateQrAndSave = async (key: string, payload: { certId: number }) => {
    try {
      const { default: QRCode } = await import('qrcode');
      // Backend URL embedding certId; adjust path if needed
      const qrText = `${window.location.origin}/verify?certId=${payload.certId}`;
      const dataUrl = await QRCode.toDataURL(qrText, { margin: 1, width: 512 });
      setQrDataUrls(prev => ({ ...prev, [key]: dataUrl }));
      // Trigger download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `certificate-${payload.certId}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e: any) {
      toast({ title: 'QR generation failed', description: e?.message || 'Unable to generate QR', variant: 'destructive' });
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!address) { setCertificates([]); return; }
      setLoading(true);
      try {
        const rows = await blockchainService.fetchCertificatesByLearnerWallet(address);
        setCertificates(rows.map(r => ({ id: r.certId, templateId: r.templateId, templateName: r.templateName, instituteName: r.instituteName, issuedAt: r.issuedAt, validUntil: r.validUntil, revoked: r.revoked, txHash: r.txHash })));
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
              My <span className="text-accent">Certificates</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              View and manage your blockchain-verified credentials
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
                  <p className="text-sm text-muted-foreground">Total Certificates</p>
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
                  <p className="text-sm text-muted-foreground">Active Credentials</p>
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
                  <p className="text-sm text-muted-foreground">Verified</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Certificate Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert, index) => (
              <Card
                key={cert.txHash}
                className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-card group cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                ref={(node) => { cardRefs.current[cert.txHash] = node; }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge
                      variant="default"
                      className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20"
                    >
                      {cert.revoked ? 'revoked' : 'active'}
                    </Badge>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Cert ID</div>
                      <div className="font-mono text-sm font-bold text-accent">#{cert.id}</div>
                    </div>
                  </div>
                  {cert.templateName ? (
                    <CardTitle className="font-heading text-lg leading-tight group-hover:text-accent transition-colors">
                      {cert.templateName}
                    </CardTitle>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Certificate Template */}
                  <div className="space-y-4 text-sm">
                    <div className="text-center">
                      <h3 className="font-heading text-xl font-bold">{cert.templateName || ''}</h3>
                      <p className="text-muted-foreground">{cert.instituteName || 'Unknown Institute'}</p>
                      <p className="text-lg font-semibold text-accent mt-2">{cert.learnerName || 'Certificate Holder'}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Issue Date</span>
                        <span className="font-medium">{new Date(cert.issuedAt * 1000).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Expiry Date</span>
                        <span className="font-medium">{cert.validUntil && cert.validUntil > 0 ? new Date(cert.validUntil * 1000).toLocaleDateString() : 'Lifetime'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Certificate ID</span>
                        <span className="font-mono text-sm font-bold text-accent">#{cert.id}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Institute</span>
                        <span className="font-medium">{cert.instituteName || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50 grid grid-cols-1 gap-2">
                    <Button variant="outline" size="sm" className="border-accent/30 hover:border-accent gap-2" onClick={() => handleGenerateQrAndSave(cert.txHash, { certId: cert.id })}>
                      <QrCode className="h-3 w-3" />
                      Generate QR & Save
                    </Button>
                  </div>

                  {qrDataUrls[cert.txHash] && (
                    <div className="mt-4 flex justify-center">
                      <img src={qrDataUrls[cert.txHash]} alt="Certificate QR" className="w-40 h-40 object-contain bg-white p-2 rounded" />
                    </div>
                  )}

                  <Button
                    size="sm"
                    className="w-full gap-2 bg-[#2B3890] hover:bg-[#1a235e] text-white border-0"
                    onClick={() => navigate('/digilocker', { state: { certificate: cert } })}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Add to DigiLocker
                  </Button>
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
                  <h3 className="font-heading text-xl font-semibold">No Certificates Yet</h3>
                  <p className="text-muted-foreground">
                    No certificates issued to this wallet yet
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {loading && (
            <p className="text-sm text-muted-foreground mt-6">Loading certificates...</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
