
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileSpreadsheet, ShieldCheck, Download, AlertCircle } from "lucide-react";
import { readExcelFile, ParsedRow, generateSignedExcel } from "@/utils/excelParser";
import { signCertificate } from "@/utils/eip712";
import { ethers } from "ethers";

export function BulkIssuance() {
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
    const [isSigning, setIsSigning] = useState(false);
    const [signingProgress, setSigningProgress] = useState(0);
    const [privateKey, setPrivateKey] = useState("");
    const [signedRows, setSignedRows] = useState<any[]>([]);
    const [fileName, setFileName] = useState("");
    const [serverSideSigning, setServerSideSigning] = useState(false);
    const [rowStatuses, setRowStatuses] = useState<Record<number, { status: 'pending' | 'signed' | 'error', message?: string }>>({});
    const [showStatus, setShowStatus] = useState(false);


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setFileName(selectedFile.name);
            setSignedRows([]);
            setSigningProgress(0);
            setRowStatuses({});
            setShowStatus(false);
            try {
                const rows = await readExcelFile(selectedFile);
                setParsedRows(rows);
                toast({
                    title: "File Parsed Successfully",
                    description: `Found ${rows.length} valid records in ${selectedFile.name}`,
                });
            } catch (error: any) {
                toast({
                    title: "Error Parsing File",
                    description: error.message || "Could not parse the file",
                    variant: "destructive",
                });
                setParsedRows([]);
            }
        }
    };

    const validateRow = (row: ParsedRow): string | null => {
        if (!row.certId) return "Missing Certificate ID";
        if (!row.learner) return "Missing Learner Address";
        if (!ethers.utils.isAddress(row.learner)) return `Invalid Address: ${row.learner}`;
        if (!row.course) return "Missing Course";
        if (!row.marks) return "Missing Marks";
        return null;
    };

    const handleSign = async () => {
        const pk = privateKey.trim();
        console.log('=== BULK SIGNING STARTED ===');
        console.log('Private key length:', pk.length);
        console.log('Private key starts with 0x:', pk.startsWith('0x'));

        if (!pk) {
            toast({ title: "Private Key Required", description: "Please enter a private key to sign the certificates.", variant: "destructive" });
            return;
        }

        setIsSigning(true);
        setSigningProgress(0);
        setRowStatuses({});
        setShowStatus(true);

        const signedData: any[] = [];
        const total = parsedRows.length;
        let successCount = 0;

        console.log('Total rows to process:', total);

        try {
            console.log('Starting batch signing...');
            for (let i = 0; i < total; i++) {
                const row = parsedRows[i];
                console.log(`\n--- Processing Row ${i + 1}/${total} ---`);
                console.log('Row data:', {
                    certId: row.certId,
                    learner: row.learner,
                    course: row.course,
                    marks: row.marks
                });

                const validationError = validateRow(row);
                if (validationError) {
                    console.warn(`❌ Row ${i + 1} validation failed: ${validationError}`);
                    signedData.push({ ...row.originalRow, error: validationError });
                    setRowStatuses(prev => ({ ...prev, [i]: { status: 'error', message: validationError } }));
                    continue;
                }

                console.log(`✓ Row ${i + 1} validation passed`);

                try {
                    console.log(`Attempting to sign row ${i + 1}...`);
                    const certificateData = {
                        certId: row.certId,
                        learner: row.learner,
                        course: row.course,
                        marks: row.marks
                    };
                    console.log('Certificate data to sign:', certificateData);

                    const signature = await signCertificate(certificateData, pk);

                    console.log(`✓ Row ${i + 1} signed successfully!`);
                    console.log('Signature:', signature);

                    signedData.push({
                        ...row.originalRow,
                        signature: signature
                    });
                    setRowStatuses(prev => ({ ...prev, [i]: { status: 'signed' } }));
                    successCount++;
                } catch (err: any) {
                    console.error(`❌ Row ${i + 1} signing error:`, err);
                    console.error('Error message:', err.message);
                    console.error('Error stack:', err.stack);
                    signedData.push({ ...row.originalRow, error: `Signing Failed: ${err.message}` });
                    setRowStatuses(prev => ({ ...prev, [i]: { status: 'error', message: err.message } }));
                }

                setSigningProgress(Math.round(((i + 1) / total) * 100));
                if (i % 5 === 0) await new Promise(r => setTimeout(r, 0));
            }

            console.log('\n=== SIGNING COMPLETE ===');
            console.log('Total processed:', total);
            console.log('Successfully signed:', successCount);
            console.log('Failed:', total - successCount);

            setSignedRows(signedData);
            toast({
                title: "Signing Complete",
                description: `Processed ${total} certificates. ${successCount} signed successfully.`,
            });

        } catch (error: any) {
            console.error('=== FATAL ERROR ===', error);
            toast({ title: "Process Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsSigning(false);
        }
    };

    const handleDownload = () => {
        if (signedRows.length === 0) return;

        try {
            const headers = Object.keys(signedRows[0] || {});
            const excelData = generateSignedExcel(signedRows, headers);

            const blob = new Blob([excelData as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Signed_Certificates_${new Date().getTime()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({ title: "Downloaded", description: "Signed certificates file has been downloaded." });
        } catch (e: any) {
            toast({ title: "Download Failed", description: e.message, variant: "destructive" });
        }
    };

    const handleSaveToDB = () => {
        toast({ title: "Coming Soon", description: "Database integration is not yet enabled." });
    };

    if (!file || parsedRows.length === 0) {
        return (
            <Card className="w-full bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-6 w-6 text-accent" />
                        Bulk Certificate Issuance
                    </CardTitle>
                    <CardDescription>
                        Upload an Excel/CSV file to issue multiple certificates at once.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="border-2 border-dashed border-border/50 rounded-lg p-10 text-center hover:bg-accent/5 transition-colors cursor-pointer relative">
                        <Input
                            id="bulk-file"
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-lg">Drop .xlsx/.xls/.csv here</h3>
                        <p className="text-muted-foreground text-sm">or click to browse</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="w-full bg-card/50 backdrop-blur-sm border-dashed border-border/50">
                <CardContent className="p-8 text-center bg-accent/5">
                    <div className="relative">
                        <Input
                            id="bulk-file-change"
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="h-10 w-10 text-accent mx-auto mb-4" />
                        <h3 className="font-semibold text-lg">Drop .xlsx/.xls/.csv here</h3>
                        <p className="text-muted-foreground text-sm">or click to browse</p>
                    </div>
                </CardContent>
            </Card>

            <div className="text-sm text-foreground mb-2">
                Loaded: {fileName} ({parsedRows.length} rows)
            </div>

            <Card className="w-full bg-card backdrop-blur-sm border-border">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <ShieldCheck className="h-5 w-5" />
                        Sign Certificates
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>Contract Address</Label>
                            <Input value="0x8e79C63173070B907b36544bB00355EFB4B69c48" readOnly className="font-mono bg-muted/50" />
                        </div>

                        <div className="space-y-2">
                            <Label>Chain ID</Label>
                            <Input value="11155111" readOnly className="font-mono bg-muted/50" />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="server-side"
                                className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                                checked={serverSideSigning}
                                onChange={(e) => setServerSideSigning(e.target.checked)}
                            />
                            <Label htmlFor="server-side" className="font-normal cursor-pointer">Server-side signing (advanced)</Label>
                        </div>

                        <div className="space-y-2">
                            <Label>Private Key</Label>
                            <Input
                                type="password"
                                placeholder="Enter private key (0x...)"
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                            {isSigning ? (
                                <Button disabled variant="neon">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing... {signingProgress}%
                                </Button>
                            ) : (
                                <Button
                                    variant="neon"
                                    onClick={handleSign}
                                    disabled={parsedRows.length === 0 || !privateKey}
                                >
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Sign All
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                className="bg-green-600/10 text-green-600 border-green-600/20 hover:bg-green-600/20 hover:text-green-700"
                                onClick={handleSaveToDB}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
                                Save to DB
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleDownload}
                                disabled={signedRows.length === 0}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download Signed CSV
                            </Button>
                        </div>
                    </div>

                    {showStatus && (
                        <div className="mt-6 rounded-lg border border-border/50 bg-muted/20 overflow-hidden">
                            <div className="bg-muted/50 px-4 py-2 text-sm font-semibold border-b border-border/50">
                                Signing Status
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {parsedRows.map((row, index) => {
                                    const statusObj = rowStatuses[index];
                                    const status = statusObj?.status;
                                    const errorMessage = statusObj?.message;

                                    return (
                                        <div key={index} className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-0 hover:bg-accent/5">
                                            <div className="flex items-center gap-4">
                                                <span className="text-muted-foreground w-8">#{index + 1}</span>
                                                <span className="font-mono text-sm">{row.certId}</span>
                                            </div>
                                            <div className="flex items-center justify-end">
                                                {status === 'signed' && (
                                                    <span className="flex items-center text-green-500 text-sm">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                                        Signed
                                                    </span>
                                                )}
                                                {status === 'error' && (
                                                    <div className="group relative flex items-center">
                                                        <span className="flex items-center text-red-500 text-sm cursor-help">
                                                            <AlertCircle className="mr-1 h-4 w-4" />
                                                            Failed
                                                        </span>
                                                        <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 w-64 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg border border-border">
                                                            {errorMessage || "Unknown error"}
                                                        </div>
                                                    </div>
                                                )}
                                                {!status && (
                                                    <span className="text-muted-foreground text-sm flex items-center">
                                                        <span className="w-2 h-2 rounded-full bg-muted-foreground/30 mr-2"></span>
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
