
import * as XLSX from 'xlsx';

export interface ParsedRow {
    certificateNumber: string;
    candidateFullName: string;
    dateOfBirth: string;
    qualificationName: string;
    nsqfLevel: number;
    assessmentResult: string;
    dateOfIssue: string;
    awardingBodyName: string;
    trainingProviderName: string;
    ncvetRecognitionStatus: string;
    signature?: string;
    originalRow: any;
}

// Helper to normalize header names
const normalizeHeader = (header: string): string => {
    return header.toLowerCase().replace(/\s+/g, '_').trim();
};

export const readExcelFile = (file: File, onChunk?: (rows: ParsedRow[], progress: number) => void): Promise<ParsedRow[]> => {
    return new Promise((resolve, reject) => {
        if (window.Worker) {
            const worker = new Worker(new URL('./excel.worker.ts', import.meta.url), { type: 'module' });

            worker.onmessage = (e) => {
                const { type, data, error, progress } = e.data;

                if (type === 'chunk') {
                    if (onChunk) onChunk(data, progress);
                } else if (type === 'complete') {
                    resolve(data);
                    worker.terminate();
                } else if (type === 'error') {
                    reject(new Error(error));
                    worker.terminate();
                }
            };

            worker.onerror = (error) => {
                reject(error);
                worker.terminate();
            };

            const reader = new FileReader();
            reader.onload = (e) => {
                worker.postMessage({ fileData: e.target?.result });
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        } else {
            // Fallback for no worker support
            reject(new Error("Web Workers are not supported in this environment."));
        }
    });
};

export const generateSignedExcel = (rows: any[], headers: string[]): Uint8Array => {
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SignedCertificates");

    // Write
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Uint8Array(wbout);
};
