import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Loader2, CheckCircle2, XCircle, AlertCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { readExcelFile, ParsedRow } from '@/utils/excelParser';
import { verifyCertificateOnChain, VerificationResult } from '@/utils/bulkVerifier';

interface VerifiedRow extends ParsedRow {
    status: 'pending' | 'verifying' | 'valid' | 'invalid' | 'error';
    verificationResult?: VerificationResult;
}

export default function BulkVerification() {
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<VerifiedRow[]>([]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [contractAddress, setContractAddress] = useState('0x18F3040088d9933C55722474daFfd273E1d562dD');
    const [rpcUrl, setRpcUrl] = useState('https://rpc.sepolia.org');
    const [expectedIssuer, setExpectedIssuer] = useState('');

    const handleFileUpload = async (uploadedFile: File) => {
        try {
            setFile(uploadedFile);
            const parsedData = await readExcelFile(uploadedFile);

            // Convert to VerifiedRow format
            const verifiedData: VerifiedRow[] = parsedData.map((row) => ({
                ...row,
                status: 'pending' as const,
            }));

            setData(verifiedData);

            toast({
                title: 'File Uploaded',
                description: `Successfully parsed ${parsedData.length} certificates`,
            });
        } catch (error: any) {
            console.error('Error parsing file:', error);
            toast({
                title: 'Upload Failed',
                description: error.message || 'Failed to parse the file',
                variant: 'destructive',
            });
        }
    };

    const handleVerifyAll = async () => {
        if (data.length === 0) {
            toast({
                title: 'No Data',
                description: 'Please upload a file first',
                variant: 'destructive',
            });
            return;
        }

        if (!contractAddress || !rpcUrl) {
            toast({
                title: 'Configuration Required',
                description: 'Please provide contract address and RPC URL',
                variant: 'destructive',
            });
            return;
        }

        setIsVerifying(true);

        try {
            // Update all rows to verifying status
            setData((prev) => prev.map((row) => ({ ...row, status: 'verifying' as const })));

            // Verify all certificates in parallel
            const promises = data.map(async (row, index) => {
                // Validate required fields
                if (!row.certId || !row.learner || !row.course || !row.marks || !row.signature) {
                    return {
                        index,
                        result: {
                            valid: false,
                            signer: null,
                            error: 'Missing required fields (certId, learner, course, marks, signature)',
                        } as VerificationResult,
                    };
                }

                const certData = {
                    certId: row.certId,
                    learner: row.learner,
                    course: row.course,
                    marks: row.marks,
                    signature: row.signature,
                    expectedIssuer: expectedIssuer || undefined,
                };

                const result = await verifyCertificateOnChain(contractAddress, rpcUrl, certData);

                return { index, result };
            });

            const results = await Promise.all(promises);

            // Update data with results
            setData((prev) => {
                const updated = [...prev];
                results.forEach(({ index, result }) => {
                    updated[index] = {
                        ...updated[index],
                        status: result.valid ? 'valid' : result.error ? 'error' : 'invalid',
                        verificationResult: result,
                    };
                });
                return updated;
            });

            const validCount = results.filter((r) => r.result.valid).length;
            const invalidCount = results.length - validCount;

            toast({
                title: 'Verification Complete',
                description: `${validCount} valid, ${invalidCount} invalid/error`,
            });
        } catch (error: any) {
            console.error('Error during bulk verification:', error);
            toast({
                title: 'Verification Failed',
                description: error.message || 'An error occurred during verification',
                variant: 'destructive',
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleClear = () => {
        setFile(null);
        setData([]);
    };

    const handleExport = () => {
        if (data.length === 0) return;

        const csvContent = [
            ['Certificate ID', 'Learner', 'Course', 'Marks', 'Status', 'Signer', 'Error'].join(','),
            ...data.map((row) =>
                [
                    row.certId,
                    row.learner,
                    row.course,
                    row.marks,
                    row.status,
                    row.verificationResult?.signer || '',
                    row.verificationResult?.error || '',
                ]
                    .map((field) => `"${field}"`)
                    .join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `verification_results_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getStatusBadge = (status: VerifiedRow['status']) => {
        switch (status) {
            case 'valid':
                return (
                    <Badge className="bg-green-500 hover:bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Valid
                    </Badge>
                );
            case 'invalid':
                return (
                    <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Invalid
                    </Badge>
                );
            case 'error':
                return (
                    <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Error
                    </Badge>
                );
            case 'verifying':
                return (
                    <Badge variant="secondary">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Verifying
                    </Badge>
                );
            default:
                return <Badge variant="outline">Pending</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Configuration Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle className="font-heading text-xl">Configuration</CardTitle>
                    <CardDescription>Set up verification parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contractAddress">
                                Contract Address <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="contractAddress"
                                placeholder="0x..."
                                value={contractAddress}
                                onChange={(e) => setContractAddress(e.target.value)}
                                className="bg-background/50 font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rpcUrl">
                                RPC URL <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="rpcUrl"
                                placeholder="https://rpc.sepolia.org"
                                value={rpcUrl}
                                onChange={(e) => setRpcUrl(e.target.value)}
                                className="bg-background/50"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="expectedIssuer">Expected Issuer (Optional)</Label>
                        <Input
                            id="expectedIssuer"
                            placeholder="0x... (leave empty for any registered issuer)"
                            value={expectedIssuer}
                            onChange={(e) => setExpectedIssuer(e.target.value)}
                            className="bg-background/50 font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            If provided, only signatures from this address will be considered valid
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* File Upload Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle className="font-heading text-xl">Upload Certificates</CardTitle>
                    <CardDescription>
                        Upload an Excel or CSV file with columns: Certificate ID, Learner Wallet Address, Course Name, Marks,
                        Signature
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div
                        className="border-2 border-dashed border-accent/50 rounded-lg p-8 text-center hover:border-accent transition-colors cursor-pointer"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            const droppedFile = e.dataTransfer.files[0];
                            if (droppedFile) handleFileUpload(droppedFile);
                        }}
                    >
                        <Upload className="h-12 w-12 mx-auto mb-4 text-accent/60" />
                        <p className="text-lg font-semibold mb-2">
                            {file ? file.name : 'Drop signed .xlsx/.xls/.csv here'}
                        </p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={(e) => {
                                const uploadedFile = e.target.files?.[0];
                                if (uploadedFile) handleFileUpload(uploadedFile);
                            }}
                        />
                    </div>

                    {data.length > 0 && (
                        <div className="flex gap-3">
                            <Button variant="hero" onClick={handleVerifyAll} disabled={isVerifying} className="flex-1">
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Verifying {data.length} Certificates...
                                    </>
                                ) : (
                                    'Verify All On-Chain'
                                )}
                            </Button>
                            <Button variant="outline" onClick={handleClear} disabled={isVerifying}>
                                Clear
                            </Button>
                            <Button variant="outline" onClick={handleExport} disabled={data.length === 0}>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Results Table */}
            {data.length > 0 && (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="font-heading text-xl">Verification Results</CardTitle>
                        <CardDescription>{data.length} certificates loaded</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Cert ID</TableHead>
                                        <TableHead>Learner</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead className="w-[80px]">Marks</TableHead>
                                        <TableHead className="w-[150px]">Signature</TableHead>
                                        <TableHead className="w-[120px]">Status</TableHead>
                                        <TableHead>Signer / Error</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-mono text-xs">{row.certId}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {row.learner.substring(0, 6)}...{row.learner.substring(38)}
                                            </TableCell>
                                            <TableCell className="text-sm">{row.course}</TableCell>
                                            <TableCell className="text-sm">{row.marks}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {row.signature ? `${row.signature.substring(0, 10)}...` : 'N/A'}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(row.status)}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {row.verificationResult?.signer ? (
                                                    <span className="text-green-600">
                                                        {row.verificationResult.signer.substring(0, 6)}...
                                                        {row.verificationResult.signer.substring(38)}
                                                    </span>
                                                ) : row.verificationResult?.error ? (
                                                    <span className="text-destructive text-xs">{row.verificationResult.error}</span>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
