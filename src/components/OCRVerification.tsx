import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileImage, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface OCRVerificationProps {
    onVerify?: (data: any) => void;
}

export function OCRVerification({ onVerify }: OCRVerificationProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{
        verified: boolean;
        message: string;
        certificateNumber?: string;
        error?: string;
    } | null>(null);
    const { toast } = useToast();

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(selectedFile.type)) {
            toast({
                title: "Invalid File Type",
                description: "Please upload a JPG, PNG, or WEBP file.",
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

        // Reset previous result
        setVerificationResult(null);
    }, [toast]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            const fakeEvent = {
                target: { files: [droppedFile] }
            } as any;
            handleFileChange(fakeEvent);
        }
    }, [handleFileChange]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    }, []);

    const processAndVerify = async () => {
        if (!file) return;

        setIsProcessing(true);
        setVerificationResult(null);

        try {
            toast({
                title: "Processing Certificate",
                description: "Extracting and verifying certificate data...",
            });

            // Create FormData and upload to backend
            const formData = new FormData();
            formData.append('certificate', file);

            const response = await fetch(`${API_BASE_URL}/api/verify-ocr`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            setVerificationResult(result);

            if (result.verified) {
                toast({
                    title: "Certificate Verified ✅",
                    description: result.message || "Certificate is valid and registered.",
                });
            } else {
                toast({
                    title: "Certificate Not Verified ❌",
                    description: result.error || result.message || "Certificate could not be verified.",
                    variant: "destructive",
                });
            }

            // Call callback if provided
            if (onVerify) {
                onVerify(result);
            }
        } catch (error: any) {
            console.error("Verification error:", error);
            setVerificationResult({
                verified: false,
                message: "Verification failed",
                error: error.message || "An error occurred during verification"
            });
            toast({
                title: "Verification Error",
                description: error.message || "An error occurred during verification.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* File Upload Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload Certificate</CardTitle>
                    <CardDescription>
                        Upload a certificate image for automatic verification
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
                            accept="image/jpeg,image/jpg,image/png,image/webp"
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
                                <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP (max 10MB)</p>
                            </div>
                        )}
                    </div>

                    {file && !verificationResult && (
                        <Button
                            onClick={processAndVerify}
                            disabled={isProcessing}
                            className="w-full mt-4"
                            size="lg"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing Certificate...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Verify Certificate
                                </>
                            )}
                        </Button>
                    )}

                    {/* Verification Result */}
                    {verificationResult && (
                        <div className="mt-6">
                            {verificationResult.verified ? (
                                <Alert className="border-green-500 bg-green-500/10">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <AlertDescription className="ml-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-green-700 text-lg">✅ Verified</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {verificationResult.message}
                                                </p>
                                                {verificationResult.certificateNumber && (
                                                    <p className="text-xs font-mono mt-2 text-muted-foreground">
                                                        Certificate No: {verificationResult.certificateNumber}
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
                                                <p className="font-semibold text-lg">❌ Not Verified</p>
                                                <p className="text-sm mt-1">
                                                    {verificationResult.error || verificationResult.message}
                                                </p>
                                                {verificationResult.certificateNumber && (
                                                    <p className="text-xs font-mono mt-2">
                                                        Certificate No: {verificationResult.certificateNumber}
                                                    </p>
                                                )}
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
        </div>
    );
}
