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
import { useTranslation } from 'react-i18next';

interface VerifiedRow extends ParsedRow {
    status: 'pending' | 'verifying' | 'valid' | 'invalid' | 'error';
    verificationResult?: VerificationResult;
}

export default function BulkVerification() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<VerifiedRow[]>([]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [contractAddress, setContractAddress] = useState('0x18F3040088d9933C55722474daFfd273E1d562dD');
    const [rpcUrl, setRpcUrl] = useState('https://rpc.sepolia.org');
    const [expectedIssuer, setExpectedIssuer] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(50);
    const [pageInput, setPageInput] = useState('1');
    const [verificationProgress, setVerificationProgress] = useState(0);

    // UI Log State
    const [activityLog, setActivityLog] = useState<string[]>([]);
    const [tamperedLog, setTamperedLog] = useState<{ index: number, certId: string, error: string }[]>([]);
    const [showStatus, setShowStatus] = useState(false);

    const handleFileUpload = async (uploadedFile: File) => {
        try {
            setFile(uploadedFile);
            setData([]); // Clear existing
            setCurrentPage(1);
            setPageInput('1');
            setVerificationProgress(0);

            // Use streaming parser
            await readExcelFile(uploadedFile, (chunk, progress) => {
                // Determine if we should update UI immediately (first chunk) or batch (larger chunks)
                // Since this runs in main thread callback, React batching handles some, but we can just append

                const newRows: VerifiedRow[] = chunk.map(row => ({
                    ...row,
                    status: 'pending' as const
                }));

                setData(prev => [...prev, ...newRows]);
            });

            toast({
                title: 'File Uploaded',
                description: `Successfully loaded certificates`,
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
        setActivityLog(["Starting verification process..."]);
        setTamperedLog([]);
        setShowStatus(true);

        try {
            // Batch process verification to prevent UI freeze
            const BATCH_SIZE = 5;
            const total = data.length;

            // We operation on a mutable clone for the loop, but update state periodically
            const updatedData = [...data];

            for (let i = 0; i < total; i++) {
                // Yield and update UI every BATCH_SIZE
                if (i % BATCH_SIZE === 0) {
                    // Update progress
                    setVerificationProgress(Math.round((i / total) * 100));

                    // Update UI every 50 items to show live progress
                    if (i > 0 && i % 50 === 0) {
                        setData([...updatedData]);
                    }

                    // Yield to main thread - STRICTLY 10ms as per Executive Summary
                    if (i > 0) await new Promise(r => setTimeout(r, 10));
                }

                const row = updatedData[i];

                // Validate
                if (!row.certificateNumber || !row.candidateFullName || !row.signature) {
                    updatedData[i] = {
                        ...row,
                        status: 'error',
                        verificationResult: {
                            valid: false,
                            signer: null,
                            error: 'Missing required fields',
                        }
                    };
                    setTamperedLog(prev => [...prev.slice(-49), { index: i + 1, certId: row.certificateNumber, error: 'Missing required fields' }]);
                    continue;
                }

                const certData = {
                    certificateNumber: row.certificateNumber,
                    candidateFullName: row.candidateFullName,
                    dateOfBirth: row.dateOfBirth,
                    qualificationName: row.qualificationName,
                    nsqfLevel: row.nsqfLevel,
                    assessmentResult: row.assessmentResult,
                    dateOfIssue: row.dateOfIssue,
                    awardingBodyName: row.awardingBodyName,
                    trainingProviderName: row.trainingProviderName,
                    ncvetRecognitionStatus: row.ncvetRecognitionStatus,
                    signature: row.signature,
                    expectedIssuer: expectedIssuer || undefined,
                };

                // Verify
                const result = await verifyCertificateOnChain(contractAddress, rpcUrl, certData);

                updatedData[i] = {
                    ...row,
                    status: result.valid ? 'valid' : 'error',
                    verificationResult: result
                };

                // Log updates
                if (result.valid) {
                    // Only log every few successes to avoid spam if massive, or log basic info
                    // For "Social Media" feel, maybe logging every one is too fast? 
                    // Let's log batches or just the latest one occasionally.
                    if (i % 5 === 0 || i === total - 1) {
                        setActivityLog(prev => {
                            const newLog = [...prev, `Verified #${i + 1}: ${row.certificateNumber} (Valid)`];
                            return newLog.slice(-10);
                        });
                    }
                } else {
                    setTamperedLog(prev => [...prev.slice(-49), { index: i + 1, certId: row.certificateNumber, error: result.error || 'Unknown Error' }]);
                }
            }

            // Final update
            setData(updatedData);
            setVerificationProgress(100);
            setActivityLog(prev => [...prev, "Verification Complete."]);

            const validCount = updatedData.filter((r) => r.verificationResult?.valid).length;
            const invalidCount = updatedData.length - validCount;

            toast({
                title: 'Verification Complete',
                description: `${validCount} valid, ${invalidCount} invalid/error`,
            });
        } catch (error: any) {
            console.error('Error during bulk verification:', error);
            setActivityLog(prev => [...prev, `Critical Error: ${error.message}`]);
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
        setCurrentPage(1);
        setActivityLog([]);
        setTamperedLog([]);
        setShowStatus(false);
    };

    const handleExport = () => {
        if (data.length === 0) return;

        const csvContent = [
            ['Certificate No', 'Candidate', 'Qualification', 'Result', 'Status', 'Signer', 'Error'].join(','),
            ...data.map((row) =>
                [
                    row.certificateNumber,
                    row.candidateFullName,
                    row.qualificationName,
                    row.assessmentResult,
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
                        {t('authentic')}
                    </Badge>
                );
            case 'invalid':
                return (
                    <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        {t('invalid')}
                    </Badge>
                );
            case 'error':
                return (
                    <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {t('error')}
                    </Badge>
                );
            case 'verifying':
                return (
                    <Badge variant="secondary">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        {t('verifying')}
                    </Badge>
                );
            default:
                return <Badge variant="outline">{t('pending')}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Configuration Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle className="font-heading text-xl">{t('configuration')}</CardTitle>
                    <CardDescription>{t('configurationDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contractAddress">
                                {t('contractAddress')} <span className="text-destructive">*</span>
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
                                {t('rpcUrl')} <span className="text-destructive">*</span>
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
                        <Label htmlFor="expectedIssuer">{t('expectedIssuer')}</Label>
                        <Input
                            id="expectedIssuer"
                            placeholder="0x... (leave empty for any registered issuer)"
                            value={expectedIssuer}
                            onChange={(e) => setExpectedIssuer(e.target.value)}
                            className="bg-background/50 font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            {t('expectedIssuerHelp')}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* File Upload Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle className="font-heading text-xl">{t('uploadCertificates')}</CardTitle>
                    <CardDescription>
                        {t('uploadCertificatesDesc')}
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
                            {file ? file.name : t('dropFilesHere')}
                        </p>
                        <p className="text-sm text-muted-foreground">{t('clickToBrowse')}</p>
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
                        <>
                            <div className="flex gap-3">
                                <Button variant="hero" onClick={handleVerifyAll} disabled={isVerifying} className="flex-1">
                                    {isVerifying ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            {t('verifying')} {verificationProgress}%
                                        </>
                                    ) : (
                                        t('verifyAllOnChain')
                                    )}
                                </Button>
                                <Button variant="outline" onClick={handleClear} disabled={isVerifying}>
                                    {t('clear')}
                                </Button>
                                <Button variant="outline" onClick={handleExport} disabled={data.length === 0}>
                                    <Download className="h-4 w-4 mr-2" />
                                    {t('export')}
                                </Button>
                            </div>

                            {/* Live Logs Section */}
                            {showStatus && (
                                <div className="mt-6 grid gap-6 md:grid-cols-2">
                                    {/* Live Verification Log */}
                                    <div className="rounded-lg border border-border/50 bg-muted/20 overflow-hidden h-[300px] flex flex-col">
                                        <div className="bg-muted/50 px-4 py-2 text-sm font-semibold border-b border-border/50 flex justify-between">
                                            <span>{t('verificationStatus')}</span>
                                            <span className="text-xs font-normal text-muted-foreground">Recent Activity</span>
                                        </div>
                                        <div className="p-4 space-y-2 overflow-y-auto font-mono text-xs flex-1">
                                            {activityLog.length === 0 && <p className="text-muted-foreground italic">Ready...</p>}
                                            {activityLog.map((log, i) => (
                                                <div key={i} className="text-green-600 border-l-2 border-green-600/50 pl-2">
                                                    {log}
                                                </div>
                                            ))}
                                            {isVerifying && <div className="animate-pulse text-accent">Checking...</div>}
                                        </div>
                                    </div>

                                    {/* Tampered Data Log */}
                                    <div className="rounded-lg border border-red-900/20 bg-red-900/5 overflow-hidden h-[300px] flex flex-col">
                                        <div className="bg-red-900/10 px-4 py-2 text-sm font-semibold border-b border-red-900/10 text-red-600 flex justify-between">
                                            <span>Tampered / Errors ({tamperedLog.length})</span>
                                            <span className="text-xs font-normal opacity-70">Latest 50</span>
                                        </div>
                                        <div className="p-4 space-y-2 overflow-y-auto font-mono text-xs flex-1">
                                            {tamperedLog.length === 0 ? (
                                                <p className="text-muted-foreground italic">No tampered data found so far.</p>
                                            ) : (
                                                tamperedLog.map((err, i) => (
                                                    <div key={i} className="flex flex-col gap-1 text-red-500 border-l-2 border-red-500 pl-2">
                                                        <div className="flex gap-2 font-bold">
                                                            <span>#{err.index}</span>
                                                            <span>ID: {err.certId}</span>
                                                        </div>
                                                        <span className="opacity-80">{err.error}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Results Table (Paginated) */}
            {data.length > 0 && (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="font-heading text-xl">{t('verificationResults')}</CardTitle>
                        <CardDescription>{t('certificatesLoaded', { count: data.length })}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Pagination Controls - Top */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const p = Math.max(1, currentPage - 1);
                                        setCurrentPage(p);
                                        setPageInput(String(p));
                                    }}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    <Input
                                        className="h-8 w-16 text-center"
                                        value={pageInput}
                                        onChange={(e) => setPageInput(e.target.value)}
                                        onBlur={() => {
                                            let p = parseInt(pageInput);
                                            const maxPage = Math.ceil(data.length / itemsPerPage);
                                            if (isNaN(p) || p < 1) p = 1;
                                            if (p > maxPage) p = maxPage;
                                            setCurrentPage(p);
                                            setPageInput(String(p));
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                let p = parseInt(pageInput);
                                                const maxPage = Math.ceil(data.length / itemsPerPage);
                                                if (isNaN(p) || p < 1) p = 1;
                                                if (p > maxPage) p = maxPage;
                                                setCurrentPage(p);
                                                setPageInput(String(p));
                                            }
                                        }}
                                    />
                                    <span className="text-sm text-muted-foreground">/ {Math.ceil(data.length / itemsPerPage)}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const maxPage = Math.ceil(data.length / itemsPerPage);
                                        const p = Math.min(maxPage, currentPage + 1);
                                        setCurrentPage(p);
                                        setPageInput(String(p));
                                    }}
                                    disabled={currentPage >= Math.ceil(data.length / itemsPerPage)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[120px]">{t('certificateId')}</TableHead>
                                        <TableHead>{t('learnerName')}</TableHead>
                                        <TableHead>{t('courseName')}</TableHead>
                                        <TableHead className="w-[80px]">Result</TableHead>
                                        <TableHead className="w-[100px]">{t('issueDate')}</TableHead>
                                        <TableHead className="w-[120px]">{t('status')}</TableHead>
                                        <TableHead>{t('signerOrError')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-mono text-xs">{row.certificateNumber}</TableCell>
                                            <TableCell className="text-sm font-medium">{row.candidateFullName}</TableCell>
                                            <TableCell className="text-sm">{row.qualificationName}</TableCell>
                                            <TableCell className="text-sm">{row.assessmentResult}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{row.dateOfIssue}</TableCell>
                                            <TableCell>{getStatusBadge(row.status)}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {row.verificationResult?.signer && (
                                                    <div className="text-green-600 flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-green-600"></span>
                                                        {row.verificationResult.signer.substring(0, 6)}...{row.verificationResult.signer.substring(38)}
                                                    </div>
                                                )}
                                                {(!row.verificationResult?.valid || row.status === 'error') && row.verificationResult?.error && (
                                                    <div className="text-destructive text-[10px] leading-tight mt-1">
                                                        See Tampered Log
                                                    </div>
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
