import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode, Search, CheckCircle, XCircle, Calendar, User, Building, Shield, AlertTriangle } from "lucide-react";

interface CertificateData {
  id: string;
  learnerName: string;
  course: string;
  issuer: string;
  issuedAt: string;
  validUntil: string;
  status: "Active" | "Revoked" | "Expired";
  grade?: string;
  blockchainHash: string;
}

const Verify = () => {
  const [verificationData, setVerificationData] = useState({
    certId: "",
    learnerName: "",
    issuerName: "",
    completionDate: ""
  });
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<CertificateData | null>(null);
  const [verificationError, setVerificationError] = useState("");

  // Mock verification function
  const handleVerification = async () => {
    setIsVerifying(true);
    setVerificationError("");
    setVerificationResult(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock verification logic
    if (verificationData.certId === "CERT-2025-12345") {
      setVerificationResult({
        id: "CERT-2025-12345",
        learnerName: "Rohan Sharma",
        course: "Electrician Level 1",
        issuer: "NCVET – XYZ Technical Institute",
        issuedAt: "12 Feb 2025",
        validUntil: "Lifetime",
        status: "Active",
        grade: "A",
        blockchainHash: "0xabc123def456..."
      });
    } else if (verificationData.certId && verificationData.certId !== "") {
      setVerificationError("Certificate not found on blockchain or has been revoked");
    } else {
      setVerificationError("Please enter a certificate ID");
    }

    setIsVerifying(false);
  };

  const handleQRScan = () => {
    // Mock QR scan result
    setVerificationData({
      ...verificationData,
      certId: "CERT-2025-12345"
    });
  };

  return (
    <div className="min-h-screen bg-secondary/20 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Certificate Verification</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Verify the authenticity of NCVET certificates using blockchain technology. 
            Instant, secure, and globally trusted.
          </p>
        </div>

        {/* Verification Card */}
        <Card className="bg-gradient-card border-0 shadow-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <Shield className="h-6 w-6" />
              <span>Employer / Third Party Portal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="qr" className="flex items-center space-x-2">
                  <QrCode className="h-4 w-4" />
                  <span>QR Code Scan</span>
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Manual Verification</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="qr" className="space-y-4">
                <div className="text-center p-8 border-2 border-dashed border-accent rounded-lg bg-accent/5">
                  <QrCode className="h-16 w-16 text-accent mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Scan QR Code</h3>
                  <p className="text-muted-foreground mb-4">
                    Point your camera at the QR code on the certificate to instantly verify
                  </p>
                  <Button 
                    onClick={handleQRScan}
                    className="bg-accent hover:bg-accent-glow text-accent-foreground"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Simulate QR Scan
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="certId">Certificate ID *</Label>
                    <Input
                      id="certId"
                      placeholder="e.g., CERT-2025-12345"
                      value={verificationData.certId}
                      onChange={(e) => setVerificationData({...verificationData, certId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="learnerName">Learner Name (Optional)</Label>
                    <Input
                      id="learnerName"
                      placeholder="For additional verification"
                      value={verificationData.learnerName}
                      onChange={(e) => setVerificationData({...verificationData, learnerName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issuerName">Issuer Name (Optional)</Label>
                    <Input
                      id="issuerName"
                      placeholder="Institution name"
                      value={verificationData.issuerName}
                      onChange={(e) => setVerificationData({...verificationData, issuerName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="completionDate">Date of Completion (Optional)</Label>
                    <Input
                      id="completionDate"
                      type="date"
                      value={verificationData.completionDate}
                      onChange={(e) => setVerificationData({...verificationData, completionDate: e.target.value})}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Button 
                onClick={handleVerification}
                disabled={isVerifying}
                className="w-full bg-primary hover:bg-primary-glow text-primary-foreground"
                size="lg"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Verifying on Blockchain...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Certificate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Verification Results */}
        {verificationResult && (
          <Card className="bg-gradient-card border-0 shadow-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-accent">
                <CheckCircle className="h-6 w-6" />
                <span>Certificate Valid & Authentic</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Learner Name</Label>
                      <p className="text-lg font-semibold text-foreground">{verificationResult.learnerName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-primary" />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Issuer</Label>
                      <p className="text-lg font-semibold text-foreground">{verificationResult.issuer}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Issued At</Label>
                      <p className="text-lg font-semibold text-foreground">{verificationResult.issuedAt}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge 
                        variant={verificationResult.status === "Active" ? "default" : "destructive"}
                        className="ml-2"
                      >
                        {verificationResult.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Course</Label>
                    <p className="text-lg font-semibold text-foreground">{verificationResult.course}</p>
                  </div>
                  {verificationResult.grade && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Grade</Label>
                      <p className="text-lg font-semibold text-accent">{verificationResult.grade}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Valid Until</Label>
                    <p className="text-lg font-semibold text-foreground">{verificationResult.validUntil}</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <Label className="text-sm font-medium text-muted-foreground">Blockchain Hash</Label>
                <p className="font-mono text-sm text-foreground break-all">{verificationResult.blockchainHash}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verification Error */}
        {verificationError && (
          <Alert className="mb-8 border-destructive/50 bg-destructive/10">
            <XCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive font-medium">
              ❌ Certificate Invalid: {verificationError}
            </AlertDescription>
          </Alert>
        )}

        {/* Security Notice */}
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Privacy & Security Notice</h3>
                <p className="text-sm text-muted-foreground">
                  All verification requests are logged for security purposes. Personal information is only displayed 
                  with proper authorization. This platform complies with data privacy and national IT security guidelines.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verify;