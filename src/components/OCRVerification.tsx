import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileImage, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { ocrService, ExtractedCertificateData } from "@/utils/ocrService";
import { useToast } from "@/hooks/use-toast";
import { verifyCertificateOnChain, VerificationResult } from "@/utils/bulkVerifier";
import { Badge } from "@/components/ui/badge";

interface OCRVerificationProps {
    onVerify: (data: ExtractedCertificateData) => void;
}

export function OCRVerification({ onVerify }: OCRVerificationProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractedCertificateData | null>(null);
    const [editedData, setEditedData] = useState<ExtractedCertificateData>({});
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
    const { toast } = useToast();

    // Get RPC URL and Contract Address from environment
    const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://rpc.sepolia.org';
    const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x18F3040088d9933C55722474daFfd273E1d562dD';

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(selectedFile.type)) {
            toast({
                title: "Invalid File Type",
                description: "Please upload a JPG, PNG, or PDF file.",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            toast({
                title: "File Too Large",
                description: "Please upload a file smaller than 10MB.",
                variant: "destructive",
            });
            return;
        }

        setFile(selectedFile);

        // Create preview for images
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview("");
        }

        // Reset previous data
        setExtractedData(null);
        setEditedData({});
    }, [toast]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            const event = { target: { files: [droppedFile] } } as React.ChangeEvent<HTMLInputElement>;
            handleFileChange(event);
        }
    }, [handleFileChange]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    }, []);

    const processOCR = async () => {
        if (!file) return;

        setIsProcessing(true);
        try {
            toast({
                title: "Processing Certificate",
                description: "Extracting text from certificate... This may take 10-15 seconds.",
            });

            const text = await ocrService.extractText(file);
            const parsed = ocrService.parseCertificateData(text);

            setExtractedData(parsed);
            setEditedData(parsed);

            toast({
                title: "Extraction Complete",
                description: "Certificate data extracted successfully. Please review and edit if needed.",
            });
        } catch (error) {
            console.error("OCR Error:", error);
            toast({
                title: "Extraction Failed",
                description: "Failed to extract data from certificate. Please try again or enter manually.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFieldChange = (field: keyof ExtractedCertificateData, value: string) => {
        setEditedData(prev => ({ ...prev, [field]: value }));
    };

    const handleVerify = async () => {
        if (!editedData.certificateNumber) {
            toast({
                title: "Missing Certificate Number",
                description: "Please enter the certificate number to proceed with verification.",
                variant: "destructive",
            });
            return;
        }

        if (!editedData.signature) {
            toast({
                title: "Missing Signature",
                description: "Certificate signature is required for blockchain verification.",
                variant: "destructive",
            });
            return;
        }

        setIsVerifying(true);
        setVerificationResult(null);

        try {
            toast({
                title: "Verifying Certificate",
                description: "Checking certificate against blockchain...",
            });

            // Prepare certificate data for verification
            const certData = {
                certificateNumber: editedData.certificateNumber || '',
                candidateFullName: editedData.candidateName || '',
                dateOfBirth: editedData.dateOfBirth || '',
                qualificationName: editedData.qualification || '',
                nsqfLevel: editedData.nsqfLevel ? parseInt(editedData.nsqfLevel.replace(/\D/g, '')) || 0 : 0,
                assessmentResult: editedData.assessmentResult || '',
                dateOfIssue: editedData.dateOfIssue || '',
                awardingBodyName: editedData.awardingBody || '',
                trainingProviderName: editedData.trainingProvider || '',
                ncvetRecognitionStatus: editedData.ncvetStatus || '',
                signature: editedData.signature,
            };

            // Verify on blockchain
            const result = await verifyCertificateOnChain(
                CONTRACT_ADDRESS,
                RPC_URL,
                certData
            );

            setVerificationResult(result);

            if (result.valid) {
                toast({
                    title: "Certificate Verified",
                    description: "This certificate is valid and registered on the blockchain.",
                });
            } else {
                toast({
                    title: "Verification Failed",
                    description: result.error || "Certificate could not be verified on blockchain.",
                    variant: "destructive",
                });
            }

            // Call original onVerify callback
            onVerify(editedData);
        } catch (error: any) {
            console.error("Verification error:", error);
            setVerificationResult({
                valid: false,
                signer: null,
                error: error.message || "An error occurred during verification"
            });
            toast({
                title: "Verification Error",
                description: error.message || "An error occurred during verification.",
                variant: "destructive",
            });
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* File Upload Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload Certificate</CardTitle>
                    <CardDescription>
                        Upload a certificate image (JPG, PNG) or PDF file for automatic data extraction
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => document.getElementById('file-upload')?.click()}
                    >
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {preview ? (
                            <div className="space-y-4">
                                <img src={preview} alt="Certificate preview" className="max-h-64 mx-auto rounded" />
                                <p className="text-sm text-muted-foreground">{file?.name}</p>
                            </div>
                        ) : file ? (
                            <div className="space-y-2">
                                <FileImage className="w-16 h-16 mx-auto text-muted-foreground" />
                                <p className="text-sm font-medium">{file.name}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Upload className="w-16 h-16 mx-auto text-muted-foreground" />
                                <p className="text-sm font-medium">Drag and drop or click to upload</p>
                                <p className="text-xs text-muted-foreground">JPG, PNG, or PDF (max 10MB)</p>
                            </div>
                        )}
                    </div>

                    {file && !extractedData && (
                        <Button
                            onClick={processOCR}
                            disabled={isProcessing}
                            className="w-full mt-4"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing Certificate...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Extract Certificate Data
                                </>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Extracted Data Section */}
            {extractedData && (
                <Card>
                    <CardHeader>
                        <CardTitle>Extracted Certificate Data</CardTitle>
                        <CardDescription>
                            Review and edit the extracted information before verification
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert className="mb-4">
                            <AlertDescription>
                                OCR extraction is approximately 85-95% accurate. Please review all fields carefully and correct any errors before proceeding.
                            </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="certificateNumber">
                                    Certificate Number <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="certificateNumber"
                                    value={editedData.certificateNumber || ""}
                                    onChange={(e) => handleFieldChange("certificateNumber", e.target.value)}
                                    placeholder="e.g., SKILL2025001234"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="candidateName">Candidate Full Name</Label>
                                <Input
                                    id="candidateName"
                                    value={editedData.candidateName || ""}
                                    onChange={(e) => handleFieldChange("candidateName", e.target.value)}
                                    placeholder="e.g., Rahul Kumar Singh"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                <Input
                                    id="dateOfBirth"
                                    value={editedData.dateOfBirth || ""}
                                    onChange={(e) => handleFieldChange("dateOfBirth", e.target.value)}
                                    placeholder="DD/MM/YYYY"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="qualification">Qualification Name</Label>
                                <Input
                                    id="qualification"
                                    value={editedData.qualification || ""}
                                    onChange={(e) => handleFieldChange("qualification", e.target.value)}
                                    placeholder="e.g., Full Stack Web Developer"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nsqfLevel">NSQF Level</Label>
                                <Input
                                    id="nsqfLevel"
                                    value={editedData.nsqfLevel || ""}
                                    onChange={(e) => handleFieldChange("nsqfLevel", e.target.value)}
                                    placeholder="e.g., Level 5"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="assessmentResult">Assessment Result</Label>
                                <Input
                                    id="assessmentResult"
                                    value={editedData.assessmentResult || ""}
                                    onChange={(e) => handleFieldChange("assessmentResult", e.target.value)}
                                    placeholder="e.g., 85% / Grade A"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateOfIssue">Date of Issue</Label>
                                <Input
                                    id="dateOfIssue"
                                    value={editedData.dateOfIssue || ""}
                                    onChange={(e) => handleFieldChange("dateOfIssue", e.target.value)}
                                    placeholder="DD/MM/YYYY"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="awardingBody">Awarding Body Name</Label>
                                <Input
                                    id="awardingBody"
                                    value={editedData.awardingBody || ""}
                                    onChange={(e) => handleFieldChange("awardingBody", e.target.value)}
                                    placeholder="e.g., NCVET"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="trainingProvider">Training Provider Name</Label>
                                <Input
                                    id="trainingProvider"
                                    value={editedData.trainingProvider || ""}
                                    onChange={(e) => handleFieldChange("trainingProvider", e.target.value)}
                                    placeholder="e.g., National Skill Training Institute"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ncvetStatus">NCVET Recognition Status</Label>
                                <Input
                                    id="ncvetStatus"
                                    value={editedData.ncvetStatus || ""}
                                    onChange={(e) => handleFieldChange("ncvetStatus", e.target.value)}
                                    placeholder="e.g., Recognised by NCVET"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleVerify}
                            className="w-full mt-6"
                            size="lg"
                            disabled={isVerifying}
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Verifying on Blockchain...
                                </>
                            ) : (
                                "Verify Certificate on Blockchain"
                            )}
                        </Button>

                        {/* Verification Result */}
                        {verificationResult && (
                            <div className="mt-6">
                                {verificationResult.valid ? (
                                    <Alert className="border-green-500 bg-green-500/10">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        <AlertDescription className="ml-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-green-700">✅ Verified</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Certificate is valid and registered on blockchain
                                                    </p>
                                                    {verificationResult.signer && (
                                                        <p className="text-xs font-mono mt-2 text-muted-foreground">
                                                            Signer: {verificationResult.signer.substring(0, 6)}...{verificationResult.signer.substring(38)}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge className="bg-green-500 hover:bg-green-600">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Valid
                                                </Badge>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <Alert variant="destructive">
                                        <XCircle className="h-5 w-5" />
                                        <AlertDescription className="ml-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold">❌ Unverified</p>
                                                    <p className="text-sm mt-1">
                                                        {verificationResult.error || "Certificate could not be verified"}
                                                    </p>
                                                </div>
                                                <Badge variant="destructive">
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Invalid
                                                </Badge>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
