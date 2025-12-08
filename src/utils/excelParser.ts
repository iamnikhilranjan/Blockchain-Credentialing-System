
import * as XLSX from 'xlsx';

export interface ParsedRow {
    certId: string;
    learner: string; // Wallet address
    course: string;
    marks: string;
    signature?: string; // Optional signature for bulk verification
    originalRow: any;
}

// Helper to normalize header names
const normalizeHeader = (header: string): string => {
    return header.toLowerCase().replace(/\s+/g, '_').trim();
};

export const readExcelFile = (file: File): Promise<ParsedRow[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Convert to array of arrays to find header
                const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                if (jsonData.length === 0) {
                    throw new Error("File is empty");
                }

                // Heuristic: Find header row in first 20 rows
                let headerRowIndex = 0;
                let maxCols = 0;

                for (let i = 0; i < Math.min(20, jsonData.length); i++) {
                    const row = jsonData[i];
                    // Count non-empty strings
                    const colCount = row.filter(cell => cell && typeof cell === 'string').length;
                    if (colCount > maxCols) {
                        maxCols = colCount;
                        headerRowIndex = i;
                    }
                }

                // Extract headers
                const rawHeaders = jsonData[headerRowIndex] as string[];
                const headers = rawHeaders.map(normalizeHeader);

                // Map column indices
                const map: { [key: string]: number } = {};
                headers.forEach((h, i) => map[h] = i);

                // Helper to find column index by possible names
                const findCol = (possibles: string[]) => {
                    for (const p of possibles) {
                        if (map[p] !== undefined) return map[p];
                    }
                    return -1;
                };

                const idxCertId = findCol(['certid', 'cert_id', 'certificateid', 'certificate_id', 'id', 'certificate_number']);
                const idxLearner = findCol(['learner', 'address', 'wallet_address', 'wallet', 'student_address', 'learner_address', 'public_key', 'eth_address', 'recipient']);
                const idxCourse = findCol(['course', 'course_name', 'course_title', 'program', 'course_id']);
                const idxMarks = findCol(['marks', 'score', 'grade', 'percentage', 'gpa', 'result']);
                const idxSignature = findCol(['signature', 'sig', 'ecdsa_signature', 'signed_data']);

                // Helper function to fix Ethereum addresses that Excel converted to numbers
                const fixEthereumAddress = (value: any): string => {
                    if (!value) return '';

                    const strValue = String(value).trim();

                    // If it's already a valid hex address, return it
                    if (strValue.startsWith('0x') && strValue.length === 42) {
                        return strValue;
                    }

                    // If it's a number (including scientific notation like 6.43254125704814e+47)
                    // Excel corrupts Ethereum addresses by treating them as numbers
                    if (typeof value === 'number' || /^[0-9.e+-]+$/.test(strValue)) {
                        try {
                            // Convert scientific notation to BigInt, then to hex
                            const num = BigInt(Math.floor(Number(value)));
                            let hex = num.toString(16);

                            // Pad to 40 characters (20 bytes)
                            hex = hex.padStart(40, '0');

                            // Add 0x prefix
                            return '0x' + hex;
                        } catch (e) {
                            console.error('Failed to convert numeric address:', value, e);
                            return strValue;
                        }
                    }

                    return strValue;
                };

                const parsedRows: ParsedRow[] = [];

                // Parse data rows
                for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row || row.length === 0) continue;

                    const certId = idxCertId !== -1 ? String(row[idxCertId] || '').trim() : '';
                    const learner = idxLearner !== -1 ? fixEthereumAddress(row[idxLearner]) : '';
                    const course = idxCourse !== -1 ? String(row[idxCourse] || '').trim() : '';
                    const marks = idxMarks !== -1 ? String(row[idxMarks] || '').trim() : '';
                    const signature = idxSignature !== -1 ? String(row[idxSignature] || '').trim() : '';

                    // Skip completely empty rows
                    if (!certId && !learner && !course && !marks) continue;

                    // Create object from row array using raw headers
                    // IMPORTANT: Replace the learner value with the converted address
                    const rowObj: any = {};
                    rawHeaders.forEach((h, idx) => {
                        // If this is the learner column, use the converted address
                        if (idx === idxLearner) {
                            rowObj[h] = learner;
                        } else {
                            rowObj[h] = row[idx];
                        }
                    });

                    parsedRows.push({
                        certId,
                        learner,
                        course,
                        marks,
                        signature: signature || undefined,
                        originalRow: rowObj
                    });
                }

                resolve(parsedRows);

            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
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
