import Tesseract from 'tesseract.js';

export interface ExtractedCertificateData {
    certificateNumber?: string;
    candidateName?: string;
    dateOfBirth?: string;
    qualification?: string;
    nsqfLevel?: string;
    assessmentResult?: string;
    dateOfIssue?: string;
    awardingBody?: string;
    trainingProvider?: string;
    ncvetStatus?: string;
    enrollmentNo?: string;
    fatherName?: string;
    district?: string;
    state?: string;
    placeOfIssue?: string;
}

class OCRService {
    private worker: Tesseract.Worker | null = null;

    /**
     * Initialize Tesseract worker
     */
    async initialize(): Promise<void> {
        if (this.worker) return;

        this.worker = await Tesseract.createWorker('eng', 1, {
            logger: (m) => console.log('OCR Progress:', m),
            workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/worker.min.js',
            langPath: 'https://tessdata.projectnaptha.com/4.0.0',
            corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0/tesseract-core.wasm.js',
        });
    }

    /**
     * Process image and extract text
     */
    async extractText(imageFile: File): Promise<string> {
        await this.initialize();

        if (!this.worker) {
            throw new Error('OCR worker not initialized');
        }

        const { data: { text } } = await this.worker.recognize(imageFile);
        return text;
    }

    /**
     * Parse extracted text and map to certificate fields
     */
    parseCertificateData(text: string): ExtractedCertificateData {
        const data: ExtractedCertificateData = {};

        // Certificate Number - look for patterns like SKILL2025001234, AWYUPB000100000-081214
        const certNoMatch = text.match(/(?:Certificate No\.?:?\s*|प्रमाणपत्र संख्या\s*)([A-Z0-9\-]+)/i);
        if (certNoMatch) {
            data.certificateNumber = certNoMatch[1].trim();
        }

        // Candidate Name - look for common patterns
        const namePatterns = [
            /(?:Mr\.|Ms\.|Mx\.|श्री\.|सुश्री\.)\s+([A-Za-z\s]+?)(?:\n|son|daughter|पुत्र|पुत्री)/i,
            /certify that\s+(?:Mr\.|Ms\.|Mx\.)?\s*([A-Za-z\s]+?)(?:\n|has|son)/i,
        ];

        for (const pattern of namePatterns) {
            const match = text.match(pattern);
            if (match) {
                data.candidateName = match[1].trim();
                break;
            }
        }

        // Father's Name
        const fatherMatch = text.match(/(?:Son|Daughter|Ward of|पुत्र|पुत्री|आश्रित)\s+([A-Za-z\s]+?)(?:\n|Date of Birth|जन्म)/i);
        if (fatherMatch) {
            data.fatherName = fatherMatch[1].trim();
        }

        // Date of Birth - DD/MM/YYYY format
        const dobMatch = text.match(/(?:Date of Birth|जन्म तिथि)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
        if (dobMatch) {
            data.dateOfBirth = dobMatch[1].trim();
        }

        // Enrollment Number
        const enrollMatch = text.match(/(?:Enrollment No|नामांकन संख्या)\s*:?\s*([A-Z0-9]+)/i);
        if (enrollMatch) {
            data.enrollmentNo = enrollMatch[1].trim();
        }

        // Qualification/Job Role
        const qualPatterns = [
            /(?:in the Qualification|योग्यता\/विशेषज्ञता)\s+([A-Za-z\s]+?)(?:\n|of Duration|अवधि)/i,
            /(?:Qualification|Job Role)\s*:?\s*([A-Za-z\s]+?)(?:\n|NSQF)/i,
        ];

        for (const pattern of qualPatterns) {
            const match = text.match(pattern);
            if (match) {
                data.qualification = match[1].trim();
                break;
            }
        }

        // NSQF Level
        const nsqfMatch = text.match(/(?:NSQF Level|एनएसक्यूएफ स्तर)\s*:?\s*(Level\s*\d+|\d+)/i);
        if (nsqfMatch) {
            data.nsqfLevel = nsqfMatch[1].trim();
        }

        // Assessment Result - Grade or Percentage
        const gradePatterns = [
            /(\d+%|Grade\s*[A-F][\+\-]?|[A-F][\+\-]?)/i,
            /with\s+(\d+%|Grade\s*[A-F])/i,
        ];

        for (const pattern of gradePatterns) {
            const match = text.match(pattern);
            if (match) {
                data.assessmentResult = match[1].trim();
                break;
            }
        }

        // Date of Issue
        const issueMatch = text.match(/(?:Date of Issue|जारी करने की तिथि)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
        if (issueMatch) {
            data.dateOfIssue = issueMatch[1].trim();
        }

        // Place of Issue
        const placeMatch = text.match(/(?:Place of Issue|जारी करने का स्थान)\s*:?\s*([A-Za-z\s]+?)(?:\n|Date)/i);
        if (placeMatch) {
            data.placeOfIssue = placeMatch[1].trim();
        }

        // Training Centre/Provider
        const trainingMatch = text.match(/(?:Training Centre|प्रशिक्षण केंद्र)\s+([A-Za-z\s]+?)(?:\n|District|जिला)/i);
        if (trainingMatch) {
            data.trainingProvider = trainingMatch[1].trim();
        }

        // District
        const districtMatch = text.match(/(?:District|जिला)\s+([A-Za-z\s]+?)(?:\n|State|राज्य)/i);
        if (districtMatch) {
            data.district = districtMatch[1].trim();
        }

        // State
        const stateMatch = text.match(/(?:State|राज्य)\s+([A-Za-z\s]+?)(?:\n|at NSQF|एनएसक्यूएफ)/i);
        if (stateMatch) {
            data.state = stateMatch[1].trim();
        }

        // Awarding Body - look for organization names
        const awardingPatterns = [
            /(?:NAME OF THE AWARDING BODY|अवार्डिंग बॉडी का नाम)\s+([A-Za-z\s]+?)(?:\n|Recognised)/i,
            /Recognised by\s+([A-Z]+)/i,
        ];

        for (const pattern of awardingPatterns) {
            const match = text.match(pattern);
            if (match) {
                data.awardingBody = match[1].trim();
                break;
            }
        }

        // NCVET Recognition Status
        if (text.includes('NCVET') || text.includes('एनसीवीईटी')) {
            data.ncvetStatus = 'Recognised by NCVET';
        }

        return data;
    }

    /**
     * Terminate worker to free resources
     */
    async terminate(): Promise<void> {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
        }
    }
}

export const ocrService = new OCRService();
