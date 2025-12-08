import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, QrCode, ExternalLink, Loader2, Eye, Clock, Award } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WalletConnection } from "@/components/WalletConnection";
import { CertificatePreview } from "@/components/CertificatePreview";
import { CertificateRenderer } from "@/components/CertificateRenderer";
import { TemplateSelector } from "@/components/TemplateSelector";
import { useToast } from "@/hooks/use-toast";
import { useBlockchain } from "@/contexts/BlockchainContext";
import blockchainService from "@/lib/blockchain";


function IssuedCertificates() {
  const { address } = useBlockchain();
  const { toast } = useToast();
  const [rows, setRows] = useState<Array<{ certId: number; learnerId: number; templateId: number; txHash: string; timestamp: number }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!address) return;
      setLoading(true);
      try {
        const staffId = await blockchainService.getStaffIdByWallet(address);
        if (!staffId) {
          setRows([]);
          return;
        }
        const items = await blockchainService.fetchIssuedCertificatesByStaff(staffId);
        setRows(items);
      } catch (e: any) {
        toast({ title: "Failed to load", description: e.message || 'Could not fetch issued certificates', variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [address]);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading certificates...
        </div>
      ) : null}

      {rows.length === 0 && !loading ? (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="py-16 text-center space-y-4">
            <Award className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
            <div className="space-y-2">
              <h3 className="font-heading text-xl font-semibold">No Certificates Issued</h3>
              <p className="text-muted-foreground">You haven't issued any certificates yet</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm">
          <div className="bg-secondary/50 px-4 py-3 border-b border-border/30">
            <h3 className="font-heading text-lg font-semibold">Issued Certificates</h3>
            <p className="text-sm text-muted-foreground">Track all certificates issued by you</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-secondary/30">
              <tr>
                <th className="text-left p-3 font-medium">Serial No.</th>
                <th className="text-left p-3 font-medium">Certificate ID</th>
                <th className="text-left p-3 font-medium">Learner ID</th>
                <th className="text-left p-3 font-medium">Template ID</th>
                <th className="text-left p-3 font-medium">Issued At</th>
                <th className="text-left p-3 font-medium">Transaction</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.txHash} className="border-t border-border/30 hover:bg-card/30 transition-colors">
                  <td className="p-3 font-medium text-accent">{rows.indexOf(r) + 1}</td>
                  <td className="p-3 font-mono">{r.certId}</td>
                  <td className="p-3">{r.learnerId}</td>
                  <td className="p-3">{r.templateId}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="whitespace-nowrap">{new Date(r.timestamp * 1000).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono">
                    <div className="max-w-[150px] truncate" title={r.txHash}>
                      {r.txHash}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                      Active
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Issue() {
  const { toast } = useToast();
  const { isConnected, isAuthorized, userRole, address } = useBlockchain();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCertId, setGeneratedCertId] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: number; name: string; description: string; instituteName: string } | null>(null);
  const [selectedVisualTemplate, setSelectedVisualTemplate] = useState<string | null>(null);

  // Certificate issuance form data
  const [formData, setFormData] = useState({
    learnerWallet: "",
    learnerId: "",
    learnerName: "",
    marks: "",
    templateId: "",
    issueDate: "",
    expiryDate: "",
  });

  const [templates, setTemplates] = useState<Array<{ id: number; name: string }>>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        if (!address) {
          setTemplates([]);
          return;
        }
        setTemplatesLoading(true);
        const instituteId = await blockchainService.getInstituteIdByStaffWallet(address);
        if (!instituteId) {
          setTemplates([]);
          return;
        }
        const items = await blockchainService.fetchTemplatesByInstitute(instituteId);
        // Filter out any templates with invalid IDs and convert to proper format
        const validTemplates = items.filter(item =>
          typeof item.id === 'number' &&
          item.id > 0 &&
          typeof item.name === 'string' &&
          item.name.trim().length > 0
        );
        setTemplates(validTemplates.map(i => ({ id: i.id, name: i.name })));
      } catch (e) {
        console.error('Error loading templates:', e);
        setTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };
    loadTemplates();
  }, [address]);


  const handleTemplateChange = async (templateId: string) => {
    setFormData({ ...formData, templateId });

    // Fetch template details including institute info
    try {
      const id = parseInt(templateId);
      const templateDetails = await blockchainService.getTemplateDetails(id);
      if (templateDetails) {
        const instituteDetails = await blockchainService.getInstituteDetails(templateDetails.creatorInstituteId);
        setSelectedTemplate({
          id,
          name: templateDetails.name,
          description: templateDetails.description || '',
          instituteName: instituteDetails?.name || 'Unknown Institute'
        });
      }
    } catch (e) {
      console.error('Error fetching template details:', e);
      setSelectedTemplate(null);
    }
  };


  const handlePreview = () => {
    if (!formData.learnerWallet || !formData.learnerId || !formData.templateId || !formData.marks || !selectedTemplate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before previewing",
        variant: "destructive",
      });
      return;
    }
    setShowPreview(true);
  };

  const resetForm = () => {
    setFormData({
      learnerWallet: "",
      learnerId: "",
      learnerName: "",
      marks: "",
      templateId: "",
      issueDate: "",
      expiryDate: "",
    });
    setSelectedTemplate(null);
    setIsSubmitted(false);
  };

  const handleWalletAddressChange = async (walletAddress: string) => {
    setFormData({ ...formData, learnerWallet: walletAddress, learnerId: "" });

    if (walletAddress && walletAddress.length === 42 && walletAddress.startsWith('0x')) {
      try {
        const learnerId = await blockchainService.getLearnerIdByWallet(walletAddress);
        if (learnerId) {
          setFormData(prev => ({ ...prev, learnerId: learnerId.toString() }));
          toast({
            title: "Learner Found",
            description: `Learner ID: ${learnerId} found for wallet address`,
          });
        } else {
          toast({
            title: "Learner Not Found",
            description: "No learner found with this wallet address",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching learner ID:', error);
        toast({
          title: "Error",
          description: "Failed to fetch learner information",
          variant: "destructive",
        });
      }
    }
  };

  const handleGenerateCertificate = async () => {
    if (!isConnected || !isAuthorized) {
      toast({
        title: "Authorization Required",
        description: "Please connect your wallet and ensure you're authorized to issue certificates",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.learnerWallet || !formData.learnerId || !formData.learnerName || !formData.templateId || !formData.marks || !formData.issueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields: Learner Wallet, Learner ID, Learner Name, Template, Marks, and Issue Date",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (!address) throw new Error('Missing wallet address');

      const learnerIdNum = parseInt(formData.learnerId, 10);
      const templateIdNum = parseInt(formData.templateId, 10);

      if (!Number.isFinite(learnerIdNum) || learnerIdNum <= 0) {
        throw new Error('Please select a valid learner');
      }
      if (!Number.isFinite(templateIdNum) || templateIdNum <= 0) {
        throw new Error('Please select a valid template');
      }

      // Verify learner exists
      const learnerDetails = await blockchainService.getLearnerById(learnerIdNum);
      if (!learnerDetails) {
        throw new Error('Learner not found with the provided ID');
      }

      // Ensure template is active and belongs to this staff's institute
      const staffInstituteId = await blockchainService.getInstituteIdByStaffWallet(address);
      if (!staffInstituteId) throw new Error('Issuer is not linked to any institute');

      const templateDetails = await blockchainService.getTemplateDetails(templateIdNum);
      if (!templateDetails) throw new Error('Template not found');
      if (templateDetails.creatorInstituteId !== staffInstituteId) {
        throw new Error('Selected template does not belong to your institute');
      }
      const active = await blockchainService.isTemplateActive(templateIdNum);
      if (!active) throw new Error('Selected template is not active');

      // Create certificate data hash combining learner name, marks (cert ID will be added after issuance)
      const certificateData = {
        learnerName: formData.learnerName,
        marks: formData.marks
      };
      const dataHash = blockchainService.createHash(JSON.stringify(certificateData));

      console.log('=== ISSUE CERTIFICATE DEBUG ===');
      console.log('Certificate data being hashed:', certificateData);
      console.log('JSON string being hashed:', JSON.stringify(certificateData));
      console.log('Generated hash:', dataHash);
      console.log('=== END ISSUE DEBUG ===');

      // Calculate valid until timestamp
      let validUntilTimestamp = 0; // 0 means lifetime
      if (formData.expiryDate) {
        validUntilTimestamp = Math.floor(new Date(formData.expiryDate).getTime() / 1000);
      }

      // Issue the certificate
      console.log('Issuing certificate with:', {
        learnerIdNum,
        templateIdNum,
        validUntilTimestamp,
        dataHash
      });

      const result = await blockchainService.issueCertificate(
        learnerIdNum,
        templateIdNum,
        validUntilTimestamp,
        dataHash
      );

      console.log('Certificate issuance result:', result);

      if (result.success) {
        // Certificate was issued successfully, even if we couldn't parse the certId
        const certId = result.certId ? result.certId.toString() : 'Generated';
        setGeneratedCertId(certId);

        // Now create the final hash with the actual certificate ID
        const finalCertificateData = {
          learnerName: formData.learnerName,
          certificateId: certId,
          marks: formData.marks
        };
        const finalDataHash = blockchainService.createHash(JSON.stringify(finalCertificateData));

        console.log('Final certificate data with cert ID:', finalCertificateData);
        console.log('Final hash with cert ID:', finalDataHash);

        setIsSubmitted(true);

        toast({
          title: "Certificate Issued Successfully! 🎉",
          description: `Certificate issued successfully! TX: ${result.txHash?.slice(0, 10)}...`,
        });
      } else {
        throw new Error(result.error || 'Failed to issue certificate');
      }
    } catch (error: any) {
      console.error('Error issuing certificate:', error);
      toast({
        title: "Failed to Issue Certificate",
        description: error.message || "An error occurred while issuing the certificate",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-12 blockchain-grid">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8 space-y-4">
            <h1 className="font-heading text-4xl md:text-5xl font-bold">
              Issue <span className="text-accent">Certificate</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Create and issue blockchain-verified credentials
            </p>
          </div>

          {/* Wallet Connection Status */}
          <div className="mb-8">
            <WalletConnection />
          </div>

          {/* Unauthorized Warning */}
          {!isAuthorized && (
            <Card className="mb-8 border-destructive bg-destructive/10">
              <CardContent className="p-6 text-center">
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="font-heading text-xl font-bold mb-2">Unauthorized Access</h3>
                <p className="text-muted-foreground">
                  Your wallet is not registered as an authorized issuer. Please contact the administrator.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Success State - Show Issued Certificate */}
          {isSubmitted && (
            <div className="space-y-6">
              {/* Certificate Display */}
              <Card className="border-accent bg-accent/5">
                <CardContent className="p-8">
                  <div className="mb-6 text-center">
                    <CheckCircle className="h-12 w-12 text-accent mx-auto mb-3" />
                    <h3 className="font-heading text-2xl font-bold mb-1">Certificate Issued Successfully!</h3>
                    <p className="text-muted-foreground">The credential has been recorded on the blockchain</p>
                  </div>

                  {/* Actual Certificate */}
                  <div className="bg-background rounded-lg p-6 overflow-auto">
                    <CertificateRenderer
                      templateId={selectedVisualTemplate || "template-1"}
                      certificateData={{
                        certificateId: generatedCertId,
                        learnerName: formData.learnerName || "N/A",
                        courseName: selectedTemplate?.name || formData.templateId,
                        marks: formData.marks || "N/A",
                        issueDate: formData.issueDate,
                        expiryDate: formData.expiryDate || "lifetime",
                        instituteName: selectedTemplate?.instituteName || "Institution"
                      }}
                      includeQR={true}
                      qrData={`https://verify.example.com/cert/${generatedCertId}`}
                      className="mx-auto"
                    />
                  </div>

                  {/* Issue Another Certificate Button */}
                  <div className="mt-6 text-center">
                    <Button onClick={resetForm} variant="neon" size="lg" className="gap-2">
                      <QrCode className="h-4 w-4" />
                      Issue Another Certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}


          {/* Issuer Tabs */}
          {!isSubmitted && (
            <Card className="shadow-card bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Certificate Issuer</CardTitle>
                <CardDescription>Issue certificates and review those you've issued</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <Tabs defaultValue="issue">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="issue">Issue Certificates</TabsTrigger>
                    <TabsTrigger value="issued">Issued Certificates</TabsTrigger>
                  </TabsList>

                  <TabsContent value="issue" className="space-y-8">
                    {/* Two-column layout: Form on left, Template selector on right */}
                    <div className="grid lg:grid-cols-3 gap-6">
                      {/* Left Column: Certificate Issuance Form (2/3 width) */}
                      <div className="lg:col-span-2">
                        <form className="space-y-6">
                          {/* Learner Information */}
                          <div className="space-y-4">
                            <h3 className="font-heading text-lg font-semibold border-b border-accent/20 pb-2">
                              Learner Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="learnerWallet">
                                  Learner Wallet Address <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="learnerWallet"
                                  placeholder="0x..."
                                  value={formData.learnerWallet}
                                  onChange={(e) => handleWalletAddressChange(e.target.value)}
                                  className="bg-background/50"
                                  disabled={!isAuthorized}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Enter the learner's wallet address to auto-fetch their ID.
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="learnerId">
                                  Learner ID (Auto-filled)
                                </Label>
                                <Input
                                  id="learnerId"
                                  placeholder="Will be auto-filled"
                                  value={formData.learnerId}
                                  disabled
                                  className="bg-background/30"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Automatically populated when wallet address is entered.
                                </p>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-1 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="learnerName">
                                  Learner Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="learnerName"
                                  placeholder="Enter learner's full name"
                                  value={formData.learnerName}
                                  onChange={(e) => setFormData({ ...formData, learnerName: e.target.value })}
                                  className="bg-background/50"
                                  disabled={!isAuthorized}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Full name of the learner receiving the certificate.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Assessment Data (to be hashed) */}
                          <div className="space-y-4">
                            <h3 className="font-heading text-lg font-semibold border-b border-accent/20 pb-2">
                              Assessment Data (Will be Hashed)
                            </h3>
                            <div className="grid md:grid-cols-1 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="marks">
                                  Marks/Score <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="marks"
                                  placeholder="e.g., 98%, 85/100, A+, Pass, etc."
                                  value={formData.marks}
                                  onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                                  className="bg-background/50"
                                  disabled={!isAuthorized}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Marks/score will be hashed along with name and cert ID.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold mt-0.5">
                                🔒
                              </div>
                              <div>
                                <h4 className="font-semibold text-accent text-sm">Privacy Protection</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Learner name and marks/score will be cryptographically hashed and stored on the blockchain. Only the hash will be stored for verification purposes.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Template Selection */}
                          <div className="space-y-4">
                            <h3 className="font-heading text-lg font-semibold border-b border-accent/20 pb-2">
                              Certificate Template
                            </h3>
                            <div className="space-y-2">
                              <Label htmlFor="templateId">
                                Choose Template <span className="text-destructive">*</span>
                              </Label>
                              <Select
                                value={formData.templateId}
                                onValueChange={handleTemplateChange}
                                disabled={!isAuthorized}
                              >
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue placeholder="Select template (TemplateID - Title)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {templatesLoading ? (
                                    <SelectItem value="loading" disabled>
                                      Loading templates...
                                    </SelectItem>
                                  ) : templates.length === 0 ? (
                                    <SelectItem value="no-templates" disabled>
                                      No templates available for your institute
                                    </SelectItem>
                                  ) : (
                                    templates.map((template) => (
                                      <SelectItem key={template.id} value={template.id.toString()}>
                                        Template ID: {template.id} - {template.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                Selecting a template will automatically fetch its details and institute information.
                              </p>
                            </div>

                            {/* Template Details Display */}
                            {selectedTemplate && (
                              <Card className="bg-card/30 border-accent/20">
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-accent">Template Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Institute:</span>
                                        <span className="ml-2 font-medium">{selectedTemplate.instituteName}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Course:</span>
                                        <span className="ml-2 font-medium">{selectedTemplate.name}</span>
                                      </div>
                                      {selectedTemplate.description && (
                                        <div className="md:col-span-2">
                                          <span className="text-muted-foreground">Description:</span>
                                          <p className="mt-1 text-xs">{selectedTemplate.description}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>

                          {/* Dates Section */}
                          <div className="space-y-4">
                            <h3 className="font-heading text-lg font-semibold border-b border-accent/20 pb-2">
                              Validity Period
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="issueDate">
                                  Issue Date <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="issueDate"
                                  type="date"
                                  value={formData.issueDate}
                                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                                  className="bg-background/50"
                                  disabled={!isAuthorized}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="expiryDate">
                                  Expiry Date
                                </Label>
                                <Input
                                  id="expiryDate"
                                  type="date"
                                  value={formData.expiryDate}
                                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                  className="bg-background/50"
                                  disabled={!isAuthorized}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Leave blank for lifetime validity
                                </p>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>

                      {/* Right Column: Template Selector (1/3 width) */}
                      <div className="lg:col-span-1">
                        <Card className="sticky top-4 bg-card/50 backdrop-blur-sm border-border/50">
                          <CardContent className="p-4">
                            <TemplateSelector
                              onTemplateSelect={setSelectedVisualTemplate}
                              selectedTemplateId={selectedVisualTemplate}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </div>


                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/50">
                      <Button
                        variant="outline"
                        className="gap-2 border-accent/30 hover:border-accent"
                        onClick={handlePreview}
                        disabled={!isAuthorized || !formData.learnerWallet || !formData.learnerId || !formData.templateId || !formData.marks || !selectedTemplate}
                      >
                        <Eye className="h-4 w-4" />
                        Preview Certificate
                      </Button>
                      <Button
                        variant="neon"
                        className="gap-2 sm:ml-auto"
                        size="lg"
                        onClick={handleGenerateCertificate}
                        disabled={isLoading || !isAuthorized || !formData.learnerWallet || !formData.learnerId || !formData.templateId || !formData.issueDate || !formData.marks}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <QrCode className="h-4 w-4" />
                        )}
                        {isLoading ? 'Issuing Certificate...' : 'Issue Certificate on Blockchain'}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="issued">
                    <IssuedCertificates />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />

      {/* Certificate Preview Modal */}
      <CertificatePreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        certificateData={{
          learnerId: formData.learnerId,
          learnerName: formData.learnerName || "N/A",
          marks: formData.marks || "🔒 ***HASHED***",
          templateId: formData.templateId,
          templateName: selectedTemplate?.name,
          templateDescription: selectedTemplate?.description,
          instituteName: selectedTemplate?.instituteName,
          issueDate: formData.issueDate,
          expiryDate: formData.expiryDate || "lifetime",
          certificateId: `Pending Generation`
        }}
        visualTemplateId={selectedVisualTemplate || undefined}
      />
    </div>
  );
}