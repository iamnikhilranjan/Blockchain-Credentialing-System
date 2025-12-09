
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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { templateRegistry, getTemplateById } from "@/templates/certificates";
import { createRoot } from "react-dom/client";
import { CertificateData } from "@/templates/certificates/types";
import { useTranslation, Trans } from "react-i18next";

export function BulkIssuance() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
    const [isSigning, setIsSigning] = useState(false);
    const [signingProgress, setSigningProgress] = useState(0);
    const [privateKey, setPrivateKey] = useState("");
    const [signedRows, setSignedRows] = useState<any[]>([]);
    const [fileName, setFileName] = useState("");
    const [serverSideSigning, setServerSideSigning] = useState(false);

    // Virtualized Log State instead of holding status for every row in UI state
    const [activityLog, setActivityLog] = useState<string[]>([]);
    const [errorLog, setErrorLog] = useState<{ index: number, message: string }[]>([]);
    const [showStatus, setShowStatus] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState(templateRegistry[0].id);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setFileName(selectedFile.name);
            setSignedRows([]);
            setSigningProgress(0);
            setActivityLog([]);
            setErrorLog([]);
            setShowStatus(false);
            try {
                const rows = await readExcelFile(selectedFile);
                setParsedRows(rows);
                toast({
                    title: t('fileParsedSuccess'),
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
        if (!row.certificateNumber) return "Missing Certificate Number";
        if (!row.candidateFullName) return "Missing Candidate Name";
        // if (!ethers.utils.isAddress(row.learner)) return `Invalid Address: ${row.learner}`; // No longer required
        if (!row.qualificationName) return "Missing Qualification Name";
        // if (!row.marks) return "Missing Marks"; // Changed to assessmentResult, maybe optional?
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
        setActivityLog(["Starting batch process..."]);
        setErrorLog([]);
        setShowStatus(true);

        const signedData: any[] = [];
        const total = parsedRows.length;
        let successCount = 0;

        console.log('Total rows to process:', total);

        try {
            console.log('Starting batch signing...');

            // Batch processing variables
            const BATCH_SIZE = 100; // Process 100 items before yielding to UI

            for (let i = 0; i < total; i++) {
                const row = parsedRows[i];

                // Only log to console occasionally for massive datasets to avoid console spam lag
                if (i % 1000 === 0) console.log(`Processing ${i}/${total}`);

                const validationError = validateRow(row);
                if (validationError) {
                    // console.warn(`❌ Row ${i + 1} validation failed: ${validationError}`);
                    signedData.push({ ...row.originalRow, error: validationError });
                    setErrorLog(prev => [...prev.slice(-49), { index: i + 1, message: validationError }]);
                    continue;
                }

                try {
                    const certificateData = {
                        certificateNumber: row.certificateNumber,
                        candidateFullName: row.candidateFullName,
                        dateOfBirth: row.dateOfBirth,
                        qualificationName: row.qualificationName,
                        nsqfLevel: row.nsqfLevel,
                        assessmentResult: row.assessmentResult,
                        dateOfIssue: row.dateOfIssue,
                        awardingBodyName: row.awardingBodyName,
                        trainingProviderName: row.trainingProviderName,
                        ncvetRecognitionStatus: row.ncvetRecognitionStatus
                    };

                    const { signature, credentialHash } = await signCertificate(certificateData, pk);
                    const vcId = `vc:ncvet:${row.certificateNumber || 'unknown'}`;

                    signedData.push({
                        ...row.originalRow,
                        signature: signature,
                        credentialHash: credentialHash,
                        vcId: vcId
                    });
                    successCount++;
                } catch (err: any) {
                    console.error(`Row ${i + 1} error:`, err.message);
                    signedData.push({ ...row.originalRow, error: `Signing Failed: ${err.message}` });
                    setErrorLog(prev => [...prev.slice(-49), { index: i + 1, message: err.message }]);
                }

                // Batch UI updates and Yielding
                if (i % BATCH_SIZE === 0 || i === total - 1) {
                    const progress = Math.round(((i + 1) / total) * 100);
                    setSigningProgress(progress);

                    // Update activity log with a sliding window
                    setActivityLog(prev => {
                        const newLog = [...prev, `Processed row ${i + 1} / ${total}`];
                        return newLog.slice(-10); // Keep last 10 logs
                    });

                    // Yield to main thread to allow UI to render
                    await new Promise(r => setTimeout(r, 0));
                }
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
            toast({ title: t('processFailed'), description: error.message, variant: "destructive" });
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

    const handleDownloadPDFs = async () => {
        if (signedRows.length === 0) return;

        setIsGeneratingPDF(true);
        const TemplateComponent = getTemplateById(selectedTemplateId)?.component;

        if (!TemplateComponent) {
            toast({ title: "Template Error", description: "Selected template not found", variant: "destructive" });
            setIsGeneratingPDF(false);
            return;
        }

        try {
            // We'll generate a single PDF for all (for now) or a ZIP?
            // User requested "downloaded with the same templates".
            // Generating one multi-page PDF is safer for browser memory than 100 individual downloads.
            // Or a zip. But zip requires JSZip. Let's do a multi-page PDF.

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Hidden container to render
            const container = document.createElement("div");
            container.style.position = "absolute";
            container.style.top = "-9999px";
            container.style.left = "-9999px";
            // Make it large enough
            container.style.width = "1200px";
            document.body.appendChild(container);

            let pageAdded = false;

            for (let i = 0; i < signedRows.length; i++) {
                const row = signedRows[i];
                // Prepare data
                // Map known fields + all other fields from originalRow
                const certData: CertificateData = {
                    certificateId: row.certificateNumber,
                    // ...row contains schema fields
                    ...row,
                    // ...row.originalRow contains all Excel columns
                    ...row.originalRow,

                    // Explicitly map/overwrite with preferred values for Template
                    learnerName: row.candidateFullName,
                    courseName: row.qualificationName,
                    marks: row.assessmentResult,
                    issueDate: row.dateOfIssue,
                    identityHash: row.signature || ''
                };

                // Render React component to DOM
                const root = createRoot(container);

                // Wrap in a promise to wait for render
                await new Promise<void>((resolve) => {
                    root.render(
                        <div style={{ width: '1123px', height: '794px', background: 'white' }}>
                            {/* A4 landscape approx px at 96dpi is 1123x794. Adjust scaling if needed. */}
                            <TemplateComponent
                                certificateData={certData}
                                includeQR={true}
                                qrData={`https://checkcerts.com/verify/${row.certId}`}
                            />
                        </div>
                    );
                    // Short timeout to allow render
                    setTimeout(resolve, 100);
                });

                // Capture
                const canvas = await html2canvas(container.children[0] as HTMLElement, {
                    scale: 2, // Better quality
                    useCORS: true,
                    logging: false
                });

                const imgData = canvas.toDataURL('image/png');

                if (pageAdded) {
                    pdf.addPage('a4', 'l');
                }
                pdf.addImage(imgData, 'PNG', 0, 0, 297, 210); // A4 Landscape mm
                pageAdded = true;

                // Unmount for next
                root.unmount();

                // Update progress? - Not strictly in UI but good to know it's working
                if (i % 5 === 0) await new Promise(r => setTimeout(r, 0));
            }

            document.body.removeChild(container);
            pdf.save(`Bulk_Certificates_${new Date().getTime()}.pdf`);
            toast({ title: "PDFs Generated", description: "Certificates PDF downloaded successfully." });

        } catch (e: any) {
            console.error("PDF Gen Error", e);
            toast({ title: "PDF Generation Failed", description: e.message, variant: "destructive" });
        } finally {
            setIsGeneratingPDF(false);
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
                        {t('bulkIssuanceTitle')}
                    </CardTitle>
                    <CardDescription>
                        {t('bulkIssuanceDesc')}
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
                        <h3 className="font-semibold text-lg">{t('dropFile')}</h3>
                        <p className="text-muted-foreground text-sm">{t('clickBrowse')}</p>
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
                        <h3 className="font-semibold text-lg">{t('dropFile')}</h3>
                        <p className="text-muted-foreground text-sm">{t('clickBrowse')}</p>
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
                        {t('signCertificates')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label>{t('contractAddressLabel')}</Label>
                            <Input value="0x8e79C63173070B907b36544bB00355EFB4B69c48" readOnly className="font-mono bg-muted/50" />
                        </div>

                        <div className="space-y-2">
                            <Label>{t('chainIdLabel')}</Label>
                            <Input value="11155111" readOnly className="font-mono bg-muted/50" />
                        </div>

                        <div className="space-y-2">
                            <Label>Certificate Template</Label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedTemplateId}
                                onChange={(e) => setSelectedTemplateId(e.target.value)}
                            >
                                {templateRegistry.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="server-side"
                                className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                                checked={serverSideSigning}
                                onChange={(e) => setServerSideSigning(e.target.checked)}
                            />
                            <Label htmlFor="server-side" className="font-normal cursor-pointer">{t('serverSideSigning')}</Label>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('privateKeyLabel')}</Label>
                            <Input
                                type="password"
                                placeholder={t('privateKeyPlaceholder')}
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4">
                            {isSigning ? (
                                <Button disabled variant="neon">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('signing')} {signingProgress}%
                                </Button>
                            ) : (
                                <Button
                                    variant="neon"
                                    onClick={handleSign}
                                    disabled={parsedRows.length === 0 || !privateKey}
                                >
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    {t('signAll')}
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                className="bg-green-600/10 text-green-600 border-green-600/20 hover:bg-green-600/20 hover:text-green-700"
                                onClick={handleSaveToDB}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
                                {t('saveToDB')}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleDownload}
                                disabled={signedRows.length === 0}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {t('downloadSignedCSV')}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={handleDownloadPDFs}
                                disabled={signedRows.length === 0 || isGeneratingPDF}
                            >
                                {isGeneratingPDF ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                                {isGeneratingPDF ? "Generating..." : "Download PDF"}
                            </Button>
                        </div>
                    </div>

                    {showStatus && (
                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            {/* Live Log */}
                            <div className="rounded-lg border border-border/50 bg-muted/20 overflow-hidden h-[300px] flex flex-col">
                                <div className="bg-muted/50 px-4 py-2 text-sm font-semibold border-b border-border/50 flex justify-between">
                                    <span>{t('signingStatus')}</span>
                                    <span className="text-xs font-normal text-muted-foreground">Showing last 10 activities</span>
                                </div>
                                <div className="p-4 space-y-2 overflow-y-auto font-mono text-xs flex-1">
                                    {activityLog.length === 0 && <p className="text-muted-foreground italic">Ready to sign...</p>}
                                    {activityLog.map((log, i) => (
                                        <div key={i} className="text-muted-foreground border-l-2 border-accent/50 pl-2">
                                            {log}
                                        </div>
                                    ))}
                                    {isSigning && <div className="animate-pulse text-accent">Processing...</div>}
                                </div>
                            </div>

                            {/* Error Log */}
                            <div className="rounded-lg border border-red-900/20 bg-red-900/5 overflow-hidden h-[300px] flex flex-col">
                                <div className="bg-red-900/10 px-4 py-2 text-sm font-semibold border-b border-red-900/10 text-red-600 flex justify-between">
                                    <span>Errors ({errorLog.length})</span>
                                    <span className="text-xs font-normal opacity-70">Latest 50 errors</span>
                                </div>
                                <div className="p-4 space-y-2 overflow-y-auto font-mono text-xs flex-1">
                                    {errorLog.length === 0 ? (
                                        <p className="text-muted-foreground italic">No errors so far.</p>
                                    ) : (
                                        errorLog.map((err, i) => (
                                            <div key={i} className="flex gap-2 text-red-500 border-l-2 border-red-500 pl-2">
                                                <span className="font-bold">#{err.index}:</span>
                                                <span>{err.message}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
