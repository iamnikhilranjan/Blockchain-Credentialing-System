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

self.onmessage = async (e: MessageEvent) => {
    const { fileData } = e.data;

    try {
        const workbook = XLSX.read(fileData, { type: 'array' });
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

        const idxCertificateNumber = findCol(['certificate_number', 'cert_id', 'certificateid', 'id', 'referencenumber', 'certificateno']);
        const idxCandidateFullName = findCol(['candidate_full_name', 'candidate_name', 'name', 'student_name', 'learner', 'candidate', 'studentname']);
        const idxDateOfBirth = findCol(['date_of_birth', 'dob', 'birth_date', 'dateofbirth']);
        const idxQualificationName = findCol(['qualification_name', 'course_name', 'qualification', 'course', 'program_name']);
        const idxNsqfLevel = findCol(['nsqf_level', 'level', 'nsqf', 'nsqflevel']);
        const idxAssessmentResult = findCol(['assessment_result', 'result', 'grade', 'marks', 'score', 'percentage']);
        const idxDateOfIssue = findCol(['date_of_issue', 'issue_date', 'date', 'dateofissue']);
        const idxAwardingBodyName = findCol(['awarding_body_name', 'awarding_body', 'ab_name', 'awardingbody']);
        const idxTrainingProviderName = findCol(['training_provider_name', 'training_provider', 'tp_name', 'institute', 'trainingprovider']);
        const idxNcvetRecognitionStatus = findCol(['ncvet_recognition_status', 'recognition_status', 'status', 'recognitionstatus']);

        const idxSignature = findCol(['signature', 'sig', 'ecdsa_signature', 'signed_data']);

        const parsedRows: ParsedRow[] = [];
        const totalRows = jsonData.length - (headerRowIndex + 1);
        let lastSentIndex = 0;

        // Parse data rows
        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            const certificateNumber = idxCertificateNumber !== -1 ? String(row[idxCertificateNumber] || '').trim() : '';
            const candidateFullName = idxCandidateFullName !== -1 ? String(row[idxCandidateFullName] || '').trim() : '';
            const dateOfBirth = idxDateOfBirth !== -1 ? String(row[idxDateOfBirth] || '').trim() : '';
            const qualificationName = idxQualificationName !== -1 ? String(row[idxQualificationName] || '').trim() : '';

            // Parse NSQF Level as number
            let nsqfLevel = 0;
            if (idxNsqfLevel !== -1) {
                const val = row[idxNsqfLevel];
                if (typeof val === 'number') nsqfLevel = val;
                else if (val) nsqfLevel = parseInt(String(val).replace(/\D/g, '') || '0');
            }

            const assessmentResult = idxAssessmentResult !== -1 ? String(row[idxAssessmentResult] || '').trim() : '';
            const dateOfIssue = idxDateOfIssue !== -1 ? String(row[idxDateOfIssue] || '').trim() : '';
            const awardingBodyName = idxAwardingBodyName !== -1 ? String(row[idxAwardingBodyName] || '').trim() : '';
            const trainingProviderName = idxTrainingProviderName !== -1 ? String(row[idxTrainingProviderName] || '').trim() : '';
            const ncvetRecognitionStatus = idxNcvetRecognitionStatus !== -1 ? String(row[idxNcvetRecognitionStatus] || '').trim() : '';

            const signature = idxSignature !== -1 ? String(row[idxSignature] || '').trim() : '';

            // validation - at least cert number and name
            if (!certificateNumber && !candidateFullName) continue;

            // Create object for originalRow
            const rowObj: any = {};
            rawHeaders.forEach((h, idx) => {
                rowObj[h] = row[idx];
            });

            parsedRows.push({
                certificateNumber,
                candidateFullName,
                dateOfBirth,
                qualificationName,
                nsqfLevel,
                assessmentResult,
                dateOfIssue,
                awardingBodyName,
                trainingProviderName,
                ncvetRecognitionStatus,
                signature: signature || undefined,
                originalRow: rowObj
            });

            // Chunking Strategy:
            // 1. Send first 10 immediately for instant UI feedback (social media style)
            // 2. Then send in larger chunks (e.g. 500) for efficiency
            const isFirstChunk = (i - headerRowIndex) === 10;
            const isRegularChunk = (i - headerRowIndex) % 500 === 0;
            const isLast = i === jsonData.length - 1;

            if (isFirstChunk || isRegularChunk || isLast) {
                const currentCount = parsedRows.length;
                const chunk = parsedRows.slice(lastSentIndex);

                if (chunk.length > 0) {
                    self.postMessage({
                        type: 'chunk',
                        data: chunk,
                        progress: Math.round(((i - headerRowIndex) / totalRows) * 100)
                    });
                    lastSentIndex = currentCount;
                }
            }
        }

        self.postMessage({ type: 'complete', data: parsedRows });

    } catch (error: any) {
        self.postMessage({ type: 'error', error: error.message });
    }
};
