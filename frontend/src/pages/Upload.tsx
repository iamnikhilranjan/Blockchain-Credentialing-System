import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload as UploadIcon, Wallet, Building2, User, GraduationCap, Calendar, FileText, QrCode, AlertTriangle, CheckCircle } from "lucide-react";

interface CertificateForm {
  learnerName: string;
  learnerId: string;
  courseName: string;
  grade: string;
  completionDate: string;
  validUntil: string;
  certType: string;
  customCertId: string;
}

const Upload = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress] = useState("0x742d35Cc6634C0532925a3b8D598A0c5df4b6de8");
  const [isAuthorized] = useState(true); // In real app, this would be checked against admin registry
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [generatedQR, setGeneratedQR] = useState("");

  const [formData, setFormData] = useState<CertificateForm>({
    learnerName: "",
    learnerId: "",
    courseName: "",
    grade: "",
    completionDate: "",
    validUntil: "lifetime",
    certType: "",
    customCertId: ""
  });

  const certificateTypes = [
    "Electrician Level 1",
    "Electrician Level 2", 
    "Plumber Level 1",
    "Nursing Assistant",
    "Computer Operator",
    "Automotive Technician",
    "Welding Level 1",
    "Beauty & Wellness"
  ];

  const handleWalletConnect = () => {
    setWalletConnected(true);
  };

  const handleInputChange = (field: keyof CertificateForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCertificateId = () => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `CERT-2025-${randomId}${timestamp.toString().slice(-4)}`;
  };

  const handlePreview = () => {
    // Generate preview logic
    console.log("Preview certificate:", formData);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    
    // Simulate blockchain upload
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const certId = formData.customCertId || generateCertificateId();
    const qrData = `https://ncvetchain.com/verify?certId=${certId}&hash=0xabc123def456`;
    
    setGeneratedQR(qrData);
    setUploadSuccess(true);
    setIsUploading(false);

    // Reset form
    setFormData({
      learnerName: "",
      learnerId: "",
      courseName: "",
      grade: "",
      completionDate: "",
      validUntil: "lifetime",
      certType: "",
      customCertId: ""
    });
  };

  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-secondary/20 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2 text-primary text-2xl">
                <Wallet className="h-8 w-8" />
                <span>Connect Your Institution Wallet</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-6">
                  To issue certificates, you must connect your institution's registered blockchain wallet.
                  Only NCVET-approved institutions can issue certificates on this platform.
                </p>
                
                <Button 
                  onClick={handleWalletConnect}
                  size="lg"
                  className="bg-accent hover:bg-accent-glow text-accent-foreground"
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  Connect Wallet
                </Button>
              </div>

              <Alert className="border-accent/20 bg-accent/5">
                <AlertTriangle className="h-4 w-4 text-accent" />
                <AlertDescription className="text-accent-foreground">
                  <strong>Authorization Required:</strong> Your wallet address must be registered by the admin 
                  before you can issue certificates. Contact the platform administrator if you encounter access issues.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-secondary/20 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive font-medium">
              ❌ <strong>Unauthorized:</strong> Your wallet ({walletAddress}) is not registered as an approved institution. 
              Please contact the administrator to register your institution.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Issue Certificate</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create secure, blockchain-verified certificates for your learners
          </p>
          
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Badge variant="outline" className="border-accent text-accent">
              <Building2 className="h-4 w-4 mr-1" />
              Authorized Institution
            </Badge>
            <Badge variant="outline" className="border-primary text-primary">
              <Wallet className="h-4 w-4 mr-1" />
              Wallet Connected
            </Badge>
          </div>
        </div>

        {uploadSuccess && (
          <Alert className="mb-8 border-accent/50 bg-accent/10">
            <CheckCircle className="h-4 w-4 text-accent" />
            <AlertDescription className="text-accent-foreground">
              <strong>Certificate uploaded successfully!</strong> The certificate has been recorded on the blockchain.
              <div className="mt-2 p-2 bg-background rounded text-sm font-mono break-all">
                QR Code Data: {generatedQR}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Form */}
        <Card className="bg-gradient-card border-0 shadow-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <UploadIcon className="h-6 w-6" />
              <span>Certificate Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Learner Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Learner Details</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="learnerName">Full Name *</Label>
                  <Input
                    id="learnerName"
                    placeholder="Enter learner's full name"
                    value={formData.learnerName}
                    onChange={(e) => handleInputChange('learnerName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="learnerId">Learner ID (Optional)</Label>
                  <Input
                    id="learnerId"
                    placeholder="Aadhaar/Student ID"
                    value={formData.learnerId}
                    onChange={(e) => handleInputChange('learnerId', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Course Details</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certType">Certificate Type *</Label>
                  <Select 
                    value={formData.certType} 
                    onValueChange={(value) => handleInputChange('certType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select certificate type" />
                    </SelectTrigger>
                    <SelectContent>
                      {certificateTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="courseName">Course/Qualification Name *</Label>
                  <Input
                    id="courseName"
                    placeholder="Full course name"
                    value={formData.courseName}
                    onChange={(e) => handleInputChange('courseName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade/Result/Score</Label>
                  <Input
                    id="grade"
                    placeholder="e.g., A, 85%, Pass"
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="completionDate">Date of Completion *</Label>
                  <Input
                    id="completionDate"
                    type="date"
                    value={formData.completionDate}
                    onChange={(e) => handleInputChange('completionDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Certificate Metadata */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Certificate Metadata</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customCertId">Custom Certificate ID (Optional)</Label>
                  <Input
                    id="customCertId"
                    placeholder="Leave blank for auto-generation"
                    value={formData.customCertId}
                    onChange={(e) => handleInputChange('customCertId', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Select 
                    value={formData.validUntil} 
                    onValueChange={(value) => handleInputChange('validUntil', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                      <SelectItem value="5years">5 Years</SelectItem>
                      <SelectItem value="3years">3 Years</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                variant="outline"
                onClick={handlePreview}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Preview Certificate
              </Button>
              
              <Button
                onClick={handleUpload}
                disabled={isUploading || !formData.learnerName || !formData.courseName || !formData.completionDate}
                className="flex-1 bg-primary hover:bg-primary-glow text-primary-foreground"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Uploading to Blockchain...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate & Upload Certificate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Institution Info */}
        <Card className="bg-muted/30 border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Institution Information</h3>
                <p className="text-sm text-muted-foreground">
                  Connected Wallet: <span className="font-mono">{walletAddress}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Institution: NCVET Approved Technical Institute
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upload;