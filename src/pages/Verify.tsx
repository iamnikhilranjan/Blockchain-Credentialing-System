import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import blockchainService from "@/lib/blockchain";
import BulkVerification from "@/components/BulkVerification";
import { useTranslation } from "react-i18next";

export default function Verify() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [certificateId, setCertificateId] = useState("");
  const [learnerName, setLearnerName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verificationKey, setVerificationKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [fetchedDetails, setFetchedDetails] = useState<{
    instituteName?: string;
    templateName?: string;
    staffName?: string;
  }>({});
  const html5QrCodeRef = useRef<any>(null);
  const fetchingDetailsRef = useRef<boolean>(false);
  const scanProcessingRef = useRef<boolean>(false);

  // Aadhaar verification states
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [aadhaarVerificationResult, setAadhaarVerificationResult] = useState<"verified" | "unverified" | null>(null);
  const [aadhaarVerifying, setAadhaarVerifying] = useState(false);

  // Cleanup function to properly stop the camera
  const stopCamera = useCallback(async () => {
    console.log('stopCamera called, isScanning:', isScanning, 'html5QrCodeRef.current:', !!html5QrCodeRef.current);

    if (html5QrCodeRef.current) {
      try {
        // Try to stop the scanner - it will throw if not running, which is fine
        await html5QrCodeRef.current.stop();
        console.log('Scanner stopped successfully');
      } catch (error: any) {
        // Ignore errors about scanner not running
        if (!error?.message?.includes('not started')) {
          console.warn('Error stopping camera:', error);
        }
      }

      try {
        // Always clear the scanner UI
        await html5QrCodeRef.current.clear();
        console.log('Scanner cleared successfully');
      } catch (error) {
        console.warn('Error clearing scanner:', error);
      }

      // Always nullify the reference
      html5QrCodeRef.current = null;
    }

    // Reset all state flags
    setIsScanning(false);
    scanProcessingRef.current = false;

    // Clear the scanner container
    if (scannerRef.current) {
      scannerRef.current.innerHTML = '';
    }

    console.log('stopCamera completed');
  }, [isScanning]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && isScanning) {
        stopCamera();
      }
    };
  }, []);

  // Function to fetch additional details for verification result
  const fetchVerificationDetails = useCallback(async (result: any) => {
    if (!result || (!result.instituteId && !result.templateId && !result.staffId)) return;

    // Prevent duplicate calls
    if (fetchingDetailsRef.current) {
      console.log('Details already being fetched, skipping...');
      return;
    }

    fetchingDetailsRef.current = true;
    setDetailsLoading(true);

    // Don't reset fetchedDetails immediately to prevent flickering
    // setFetchedDetails({});

    try {
      const promises = [];

      // Fetch institute details
      if (result.instituteId) {
        promises.push(
          blockchainService.getInstituteDetails(parseInt(result.instituteId))
            .then(details => ({ type: 'institute', data: details }))
            .catch(() => ({ type: 'institute', data: null }))
        );
      }

      // Fetch template details
      if (result.templateId) {
        promises.push(
          blockchainService.getTemplateDetails(parseInt(result.templateId))
            .then(details => ({ type: 'template', data: details }))
            .catch(() => ({ type: 'template', data: null }))
        );
      }

      // Fetch staff details
      if (result.staffId) {
        promises.push(
          blockchainService.getStaffDetails(parseInt(result.staffId))
            .then(details => ({ type: 'staff', data: details }))
            .catch(() => ({ type: 'staff', data: null }))
        );
      }

      const results = await Promise.all(promises);

      const newDetails: any = {};
      results.forEach(({ type, data }) => {
        if (data) {
          switch (type) {
            case 'institute':
              newDetails.instituteName = data.name;
              break;
            case 'template':
              newDetails.templateName = data.name;
              break;
            case 'staff':
              newDetails.staffName = data.name;
              break;
          }
        }
      });

      setFetchedDetails(newDetails);
    } catch (error) {
      console.error('Error fetching verification details:', error);
    } finally {
      setDetailsLoading(false);
      fetchingDetailsRef.current = false;
    }
  }, []);

  const handleVerify = async (idOverride?: string, isQRScan: boolean = false) => {
    const idValue = (idOverride ?? certificateId).trim();
    if (!idValue) {
      toast({
        title: "Certificate ID Required",
        description: "Please enter a certificate ID to verify",
        variant: "destructive",
      });
      return;
    }

    // Only validate learner name and course name for manual verification, not QR scan
    if (!isQRScan && (!learnerName || !courseName)) {
      toast({
        title: "Missing Information",
        description: "Please enter Learner Name and Course Name for manual verification",
        variant: "destructive",
      });
      return;
    }

    // Prevent multiple verification calls
    if (isLoading) {
      console.log('Verification already in progress, skipping...');
      return;
    }

    setIsLoading(true);
    // Reset fetching details flag when starting new verification
    fetchingDetailsRef.current = false;
    setFetchedDetails({});
    setVerificationResult(null);
    setVerificationKey(prev => prev + 1); // Increment key to force re-render
    try {
      console.log('=== VERIFICATION START ===');
      console.log('Certificate ID:', idValue);
      console.log('Is QR Scan:', isQRScan);
      console.log('Learner Name:', learnerName);
      console.log('Course Name:', courseName);

      // Test blockchain connectivity first
      const connectivity = await blockchainService.testConnectivity();
      console.log('Blockchain connectivity:', connectivity);

      if (!connectivity.connected) {
        throw new Error(`Blockchain connection failed: ${connectivity.error}`);
      }

      // Check for network mismatch
      if (connectivity.networkMismatch) {
        const supportedNetworks = 'Sepolia (11155111) or Polygon Amoy (80002)';
        throw new Error(`Wrong network detected. Your contracts are deployed on ${supportedNetworks}, but you're connected to ${connectivity.networkInfo?.name} (${connectivity.networkInfo?.chainId}). Please configure the correct RPC URL.`);
      }

      // Get certificate data from blockchain
      const cert = await blockchainService.getCertificateData(parseInt(idValue, 10));
      console.log('Certificate data from blockchain:', cert);

      if (cert.exists) {
        let hashMatches = true; // Default to true for QR scan

        // Only perform hash verification for manual verification (not QR scan)
        if (!isQRScan && learnerName && courseName) {
          // Fetch template details to get template name
          const templateDetails = await blockchainService.getTemplateDetails(cert.templateId || 0);
          const templateName = templateDetails?.name || '';

          // Calculate hash from provided data (template name, learner name, learner ID)
          const verificationData = {
            templateName: courseName,  // User provides expected course name
            learnerName: learnerName,
            learnerId: String(cert.learnerId)  // From blockchain
          };
          const calculatedHash = blockchainService.createHash(JSON.stringify(verificationData));

          console.log('=== MANUAL VERIFICATION DEBUG ===');
          console.log('Input data:', { certificateId: idValue, learnerName, courseName });
          console.log('Template from blockchain:', templateName);
          console.log('Learner ID from blockchain:', cert.learnerId);
          console.log('Verification data being hashed:', verificationData);
          console.log('JSON string being hashed:', JSON.stringify(verificationData));
          console.log('Calculated hash:', calculatedHash);
          console.log('Stored hash from blockchain:', cert.dataHash);
          console.log('Hash match:', calculatedHash === cert.dataHash);
          console.log('=== END MANUAL VERIFICATION DEBUG ===');

          // Compare with stored hash
          hashMatches = calculatedHash === cert.dataHash;
        } else if (isQRScan) {
          console.log('=== QR SCAN VERIFICATION ===');
          console.log('QR scan verification - no hash validation required');
          console.log('Certificate ID:', idValue);
          console.log('Certificate exists:', cert.exists);
          console.log('=== END QR SCAN VERIFICATION ===');
        }

        if (hashMatches) {
          const result = {
            status: cert.revoked ? "revoked" : "authentic",
            certificateId: idValue,
            learnerId: String(cert.learnerId ?? ''),
            templateId: String(cert.templateId ?? ''),
            staffId: String(cert.staffId ?? ''),
            instituteId: String(cert.instituteId ?? ''),
            issuedAt: cert.issuedAt && cert.issuedAt > 0 ? new Date(cert.issuedAt * 1000).toLocaleDateString() : 'Unknown',
            validUntil: !cert.validUntil || cert.validUntil === 0 ? 'Lifetime' : new Date((cert.validUntil as number) * 1000).toLocaleDateString(),
            dataHash: cert.dataHash,
            courseName: courseName,
            learnerName: learnerName,
          };
          setVerificationResult(result);

          // Fetch additional details
          await fetchVerificationDetails(result);

          toast({
            title: cert.revoked ? "Certificate Revoked" : "Certificate Verified! ✅",
            description: cert.revoked ? "This certificate has been revoked" : "Certificate verified successfully",
            variant: cert.revoked ? "destructive" : "default",
          });
          return;
        } else {
          // Hash doesn't match - certificate is invalid
          setVerificationResult({
            status: "invalid",
            certificateId: idValue,
            error: "Certificate data does not match. Please verify the learner name and course name."
          });
          toast({
            title: "Verification Failed",
            description: "Certificate data does not match. Please check the provided information.",
            variant: "destructive"
          });
          return;
        }
      }

      // Fallback to strict verification function when existence check fails
      const idHash = blockchainService.createHash(idValue);
      const detailsHash = courseName ? blockchainService.createHash(courseName) : blockchainService.createHash("");
      const result = await blockchainService.verifyCertificate(parseInt(idValue), idHash, detailsHash);
      if (result.success && result.isValid && result.certificateData) {
        const certData = result.certificateData;
        const verificationResult = {
          status: certData.revoked ? "revoked" : "authentic",
          certificateId: idValue,
          learnerId: certData.learnerId.toString(),
          templateId: certData.templateId.toString(),
          staffId: certData.staffId.toString(),
          instituteId: certData.instituteId.toString(),
          issuedAt: new Date(certData.issuedAt.toNumber() * 1000).toLocaleDateString(),
          validUntil: certData.validUntil.toNumber() === 0 ? "Lifetime" : new Date(certData.validUntil.toNumber() * 1000).toLocaleDateString(),
          dataHash: certData.dataHash,
          courseName: courseName || "Not provided",
        };
        setVerificationResult(verificationResult);

        // Fetch additional details
        await fetchVerificationDetails(verificationResult);

        toast({ title: "Certificate Verified! ✅", description: "Certificate is authentic and valid" });
      } else {
        setVerificationResult({ status: "invalid", certificateId: idValue, error: "Certificate not found or verification failed" });
        toast({ title: "Verification Failed", description: "Certificate could not be verified or does not exist", variant: "destructive" });
      }
    } catch (error: any) {
      console.error('Error verifying certificate:', error);
      setVerificationResult({
        status: "error",
        certificateId: idValue,
        error: error.message || "An error occurred during verification"
      });

      toast({
        title: "Verification Error",
        description: error.message || "An error occurred while verifying the certificate",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAadhaarVerify = async () => {
    // Validate Aadhaar input
    if (!aadhaarInput.trim()) {
      toast({
        title: "Aadhaar Required",
        description: "Please enter the Aadhaar number",
        variant: "destructive",
      });
      return;
    }

    // Validate Aadhaar format (12 digits)
    if (!/^\d{12}$/.test(aadhaarInput.trim())) {
      toast({
        title: "Invalid Aadhaar",
        description: "Please enter a valid 12-digit Aadhaar number",
        variant: "destructive",
      });
      return;
    }

    // Check if we have a learner ID from verification result
    if (!verificationResult?.learnerId) {
      toast({
        title: "No Learner ID",
        description: "Please verify a certificate first",
        variant: "destructive",
      });
      return;
    }

    setAadhaarVerifying(true);
    setAadhaarVerificationResult(null);

    try {
      console.log('=== AADHAAR VERIFICATION START ===');
      console.log('Aadhaar input:', aadhaarInput);
      console.log('Learner ID:', verificationResult.learnerId);

      // Hash the Aadhaar number using the same algorithm as during registration
      const aadhaarHash = blockchainService.createHash(aadhaarInput.trim());
      console.log('Calculated Aadhaar hash:', aadhaarHash);

      // Fetch learner details from blockchain
      const learnerDetails = await blockchainService.getLearnerById(parseInt(verificationResult.learnerId));

      if (!learnerDetails) {
        throw new Error('Learner details not found on blockchain');
      }

      console.log('Learner identity hash from blockchain:', learnerDetails.identityHash);
      console.log('Hash match:', aadhaarHash === learnerDetails.identityHash);
      console.log('=== AADHAAR VERIFICATION END ===');

      // Compare the hashes
      if (aadhaarHash === learnerDetails.identityHash) {
        setAadhaarVerificationResult("verified");
        toast({
          title: "Aadhaar Verified ✅",
          description: "The Aadhaar number matches the certificate holder's identity",
        });
      } else {
        setAadhaarVerificationResult("unverified");
        toast({
          title: "Aadhaar Unverified ❌",
          description: "The Aadhaar number does not match the certificate holder's identity",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error verifying Aadhaar:', error);
      toast({
        title: "Verification Error",
        description: error.message || "An error occurred while verifying Aadhaar",
        variant: "destructive",
      });
      setAadhaarVerificationResult(null);
    } finally {
      setAadhaarVerifying(false);
    }
  };


  const handleQRScan = async () => {
    try {
      // Check if running in secure context (HTTPS required for camera access)
      if (!blockchainService.isSecureContext()) {
        toast({
          title: 'Secure Connection Required',
          description: 'Camera access requires HTTPS. Please ensure you are using a secure connection (https://).',
          variant: 'destructive',
        });
        return;
      }

      const { Html5Qrcode } = await import('html5-qrcode');
      const scannerId = 'qr-scanner';
      if (!scannerRef.current) return;

      // Clean up any existing scanner
      await stopCamera();

      const el = document.createElement('div');
      el.id = scannerId;
      el.className = 'w-full max-w-sm aspect-square rounded-lg overflow-hidden';
      scannerRef.current.innerHTML = '';
      scannerRef.current.appendChild(el);
      setIsScanning(true);
      scanProcessingRef.current = false; // Reset processing flag

      const html5QrCode = new Html5Qrcode(scannerId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        async (decodedText: string) => {
          // Prevent multiple callbacks for the same scan
          if (scanProcessingRef.current) {
            console.log('Scan already processing, ignoring...');
            return;
          }
          scanProcessingRef.current = true;

          console.log('QR Code detected:', decodedText);

          // Stop the scanner immediately to prevent multiple scans
          try {
            if (html5QrCodeRef.current) {
              await html5QrCodeRef.current.stop();
              setIsScanning(false);
              console.log('Scanner stopped after QR detection');
            }
          } catch (error) {
            console.warn('Error stopping scanner after detection:', error);
          }

          // Expect link like /verify?certId=123
          try {
            const url = new URL(decodedText, window.location.origin);
            const id = url.searchParams.get('certId') || decodedText;
            setCertificateId(id);
            await handleVerify(id, true); // Pass isQRScan: true
          } catch (_) {
            setCertificateId(decodedText);
            await handleVerify(decodedText, true); // Pass isQRScan: true
          }

          // Note: scanProcessingRef will be reset when user clicks "Scan Another" or starts a new scan
        },
        (errorMessage: string) => {
          // Handle scan errors silently (this is called frequently during scanning)
          // console.debug('QR scan error:', errorMessage);
        }
      );
    } catch (e: any) {
      await stopCamera();
      let errorMessage = 'Unable to start camera';

      if (e?.message) {
        if (e.message.includes('Permission denied') || e.message.includes('NotAllowedError')) {
          errorMessage = 'Camera permission denied. Please allow camera access and try again.';
        } else if (e.message.includes('NotFoundError') || e.message.includes('DevicesNotFoundError')) {
          errorMessage = 'No camera found. Please ensure your device has a camera.';
        } else if (e.message.includes('NotSupportedError') || e.message.includes('NotReadableError')) {
          errorMessage = 'Camera not supported or already in use. Please close other applications using the camera.';
        } else if (e.message.includes('HTTPS') || e.message.includes('secure context')) {
          errorMessage = 'Camera requires HTTPS. Please ensure you are using a secure connection.';
        } else {
          errorMessage = e.message;
        }
      }

      toast({
        title: 'Camera Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-12 blockchain-grid">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 space-y-4">
            <h1 className="font-heading text-4xl md:text-5xl font-bold">
              {t('verifyCertificatePage').split(' ')[0]} <span className="text-accent">{t('verifyCertificatePage').split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('verifyCertificateDesc')}
            </p>
          </div>

          <Card className="shadow-card bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">{t('certificateVerification')}</CardTitle>
              <CardDescription>
                {t('chooseVerificationMethod')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="scan" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="scan" className="gap-2">
                    <QrCode className="h-4 w-4" />
                    {t('scanQRCode')}
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="gap-2">
                    <Search className="h-4 w-4" />
                    {t('manualVerify')}
                  </TabsTrigger>
                  <TabsTrigger value="bulksig" className="gap-2">
                    <Search className="h-4 w-4" />
                    {t('bulkSig')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="scan" className="space-y-6">
                  <div className="flex flex-col items-center gap-6 py-6">
                    {/* Security status indicator */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {blockchainService.isSecureContext() ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{t('secureConnection')}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>{t('insecureConnection')}</span>
                        </>
                      )}
                    </div>

                    {!isScanning && (
                      <div className="w-64 h-64 border-4 border-dashed border-accent/50 rounded-2xl flex items-center justify-center bg-accent/5">
                        <QrCode className="h-32 w-32 text-accent/60" />
                      </div>
                    )}
                    <div ref={scannerRef} className="w-full flex items-center justify-center" />
                    <div className="flex gap-3">
                      <Button
                        variant="neon"
                        size="lg"
                        onClick={handleQRScan}
                        disabled={isScanning || !blockchainService.isSecureContext()}
                      >
                        {isScanning ? t('scanning') : t('startQRScan')}
                      </Button>
                      {isScanning && (
                        <Button variant="outline" size="lg" onClick={stopCamera}>
                          {t('stopScan')}
                        </Button>
                      )}
                    </div>
                    {!blockchainService.isSecureContext() && (
                      <p className="text-xs text-muted-foreground text-center max-w-md">
                        {t('cameraAccessError')}
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="certId">{t('certificateId')} <span className="text-destructive">*</span></Label>
                      <Input
                        id="certId"
                        placeholder={t('certificateIdPlaceholder')}
                        value={certificateId}
                        onChange={(e) => setCertificateId(e.target.value)}
                        className="bg-background/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('certificateIdHelp')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="learnerName">{t('learnerName')} <span className="text-destructive">*</span></Label>
                      <Input
                        id="learnerName"
                        placeholder={t('learnerNamePlaceholder')}
                        value={learnerName}
                        onChange={(e) => setLearnerName(e.target.value)}
                        className="bg-background/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('learnerNameHelp')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="courseName">{t('courseName')} <span className="text-destructive">*</span></Label>
                      <Input
                        id="courseName"
                        placeholder={t('courseNamePlaceholder')}
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        className="bg-background/50"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('courseNameHelp')}
                      </p>
                    </div>
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        console.log('Button clicked - Form values:', { certificateId, learnerName, courseName });
                        handleVerify(undefined, false); // Pass isQRScan: false for manual verification
                      }}
                      disabled={isLoading || !certificateId || !learnerName || !courseName}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {t('verifyingOnBlockchain')}
                        </>
                      ) : (
                        t('verifyCertificatePage')
                      )}
                    </Button>
                    {(!certificateId || !learnerName || !courseName) && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Please fill in all required fields to enable verification
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground text-center mt-2 p-2 bg-muted/20 rounded">
                      Debug: CertID={certificateId || 'empty'}, Name={learnerName || 'empty'}, Course={courseName || 'empty'}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="bulksig" className="space-y-6">
                  <BulkVerification />
                </TabsContent>
              </Tabs>

              {/* Verification Result */}
              {verificationResult && (
                <div key={verificationKey} className="mt-4 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="border-t border-border/50 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading text-xl font-semibold">{t('verificationResult')}</h3>
                      <Badge
                        variant={verificationResult.status === "authentic" ? "default" : "destructive"}
                        className={verificationResult.status === "authentic" ? "bg-accent text-accent-foreground" : ""}
                      >
                        {verificationResult.status === "authentic" ? (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        {verificationResult.status === "authentic" ? t('authentic') :
                          verificationResult.status === "revoked" ? t('revoked') :
                            verificationResult.status === "invalid" ? t('invalid') : t('error')}
                      </Badge>
                    </div>

                    <Card className="bg-background/50 border-accent/20">
                      <CardContent className="p-4 space-y-3">
                        {verificationResult.status === "authentic" || verificationResult.status === "revoked" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-muted-foreground">{t('certificateId')}</Label>
                              <p className="font-semibold font-mono text-lg text-accent">{verificationResult.certificateId}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('learnerName')}</Label>
                              <p className="font-semibold">{verificationResult.learnerName || "Not provided"}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('learnerId')}</Label>
                              <p className="font-semibold">{verificationResult.learnerId}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('template')}</Label>
                              <div className="space-y-1">
                                <p className="font-semibold">
                                  {detailsLoading ? (
                                    <span className="flex items-center gap-2">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      {t('loading')}
                                    </span>
                                  ) : fetchedDetails.templateName ? (
                                    fetchedDetails.templateName
                                  ) : (
                                    `ID: ${verificationResult.templateId}`
                                  )}
                                </p>
                                {fetchedDetails.templateName && (
                                  <p className="text-xs text-muted-foreground">ID: {verificationResult.templateId}</p>
                                )}
                              </div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('staff')}</Label>
                              <div className="space-y-1">
                                <p className="font-semibold">
                                  {detailsLoading ? (
                                    <span className="flex items-center gap-2">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      {t('loading')}
                                    </span>
                                  ) : fetchedDetails.staffName ? (
                                    fetchedDetails.staffName
                                  ) : (
                                    `ID: ${verificationResult.staffId}`
                                  )}
                                </p>
                                {fetchedDetails.staffName && (
                                  <p className="text-xs text-muted-foreground">ID: {verificationResult.staffId}</p>
                                )}
                              </div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('institute')}</Label>
                              <div className="space-y-1">
                                <p className="font-semibold">
                                  {detailsLoading ? (
                                    <span className="flex items-center gap-2">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      {t('loading')}
                                    </span>
                                  ) : fetchedDetails.instituteName ? (
                                    fetchedDetails.instituteName
                                  ) : (
                                    `ID: ${verificationResult.instituteId}`
                                  )}
                                </p>
                                {fetchedDetails.instituteName && (
                                  <p className="text-xs text-muted-foreground">ID: {verificationResult.instituteId}</p>
                                )}
                              </div>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('issueDate')}</Label>
                              <p className="font-semibold">{verificationResult.issuedAt}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('validUntil')}</Label>
                              <p className="font-semibold">{verificationResult.validUntil}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">{t('courseName')}</Label>
                              <p className="font-semibold text-accent">{verificationResult.courseName || "Not provided"}</p>
                            </div>
                            <div className="md:col-span-2">
                              <Label className="text-muted-foreground">{t('dataHash')}</Label>
                              <p className="font-mono text-xs break-all">{verificationResult.dataHash}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                            <h3 className="font-heading text-xl font-bold mb-2">{t('verificationFailed')}</h3>
                            <p className="text-muted-foreground">
                              {verificationResult.error || "Certificate could not be verified"}
                            </p>
                          </div>
                        )}

                      </CardContent>
                    </Card>

                    {/* Aadhaar Verification Section - Only show for authentic or revoked certificates */}
                    {(verificationResult.status === "authentic" || verificationResult.status === "revoked") && (
                      <Card className="bg-background/50 border-accent/20 mt-4">
                        <CardHeader>
                          <CardTitle className="font-heading text-lg">{t('verifyAadhaarIdentity')}</CardTitle>
                          <CardDescription>
                            {t('verifyAadhaarDesc')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="aadhaarInput">{t('aadhaarNumber')}</Label>
                            <Input
                              id="aadhaarInput"
                              placeholder={t('aadhaarPlaceholder')}
                              value={aadhaarInput}
                              onChange={(e) => setAadhaarInput(e.target.value)}
                              className="bg-background/50"
                              maxLength={12}
                              disabled={aadhaarVerifying}
                            />
                            <p className="text-xs text-muted-foreground">
                              {t('aadhaarHelp')}
                            </p>
                          </div>

                          <Button
                            variant="hero"
                            onClick={handleAadhaarVerify}
                            disabled={aadhaarVerifying || !aadhaarInput.trim()}
                            className="w-full"
                          >
                            {aadhaarVerifying ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                {t('verifyingAadhaar')}
                              </>
                            ) : (
                              t('verifyAadhaar')
                            )}
                          </Button>

                          {/* Aadhaar Verification Result */}
                          {aadhaarVerificationResult && (
                            <div className="mt-4 p-4 rounded-lg border animate-in fade-in slide-in-from-bottom-2"
                              style={{
                                backgroundColor: aadhaarVerificationResult === "verified" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                borderColor: aadhaarVerificationResult === "verified" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"
                              }}
                            >
                              <div className="flex items-center gap-3">
                                {aadhaarVerificationResult === "verified" ? (
                                  <>
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    <div>
                                      <h4 className="font-semibold text-green-700">{t('aadhaarVerified')}</h4>
                                      <p className="text-sm text-green-600">
                                        {t('aadhaarVerifiedDesc')}
                                      </p>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-6 w-6 text-red-600" />
                                    <div>
                                      <h4 className="font-semibold text-red-700">{t('aadhaarUnverified')}</h4>
                                      <p className="text-sm text-red-600">
                                        {t('aadhaarUnverifiedDesc')}
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Scan Another Button */}
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setVerificationResult(null);
                          setCertificateId("");
                          setLearnerName("");
                          setCourseName("");
                          setFetchedDetails({});
                          setVerificationKey(prev => prev + 1);
                          fetchingDetailsRef.current = false;
                          scanProcessingRef.current = false; // Reset scan processing flag
                          // Reset Aadhaar verification state
                          setAadhaarInput("");
                          setAadhaarVerificationResult(null);
                        }}
                        className="gap-2"
                      >
                        <QrCode className="h-4 w-4" />
                        {t('scanAnotherCertificate')}
                      </Button>
                    </div>
                  </div >
                </div >
              )
              }
            </CardContent >
          </Card >
        </div >
      </main >

      <Footer />
    </div >
  );
}
