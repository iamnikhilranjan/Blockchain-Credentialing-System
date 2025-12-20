// OCR Verification Endpoint Handler
import Tesseract from 'tesseract.js';

// Helper function to convert DD/MM/YY or DD/MM/YYYY to Unix timestamp
export function convertDateToTimestamp(dateStr) {
    if (!dateStr) return null;

    // Try to match DD/MM/YY or DD/MM/YYYY format
    const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (!match) return null;

    let [, day, month, year] = match;

    // Convert 2-digit year to 4-digit
    if (year.length === 2) {
        year = parseInt(year) < 50 ? `20${year}` : `19${year}`;
    }

    // Create date object (month is 0-indexed in JavaScript)
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // Return Unix timestamp (seconds since epoch)
    return Math.floor(date.getTime() / 1000);
}

// OCR Verification Handler
export async function handleOCRVerification(req, res, db, collectionName) {
    try {
        console.log('📸 OCR verification request received');

        if (!req.file) {
            return res.status(400).json({
                success: false,
                verified: false,
                error: 'No image file uploaded'
            });
        }

        if (!db) {
            return res.status(500).json({
                success: false,
                verified: false,
                error: 'MongoDB not connected'
            });
        }

        // Step 1: Extract text from image using OCR
        console.log('🔍 Extracting text from image...');
        const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng', {
            logger: m => console.log('OCR:', m.status, Math.round(m.progress * 100) + '%')
        });

        console.log('📝 Extracted text length:', text.length);

        // Step 2: Parse certificate data from extracted text
        // Try multiple patterns to extract certificate number
        let certificateNumber = null;

        // Pattern 1: "Certificate No" or "प्रमाणपत्र संख्या" followed by alphanumeric
        let certNoMatch = text.match(/(?:Certificate\s+No\.?|Certificate\s+Number|प्रमाणपत्र\s+संख्या)\s*:?\s*([A-Z0-9\-\/]+)/i);
        if (certNoMatch) {
            certificateNumber = certNoMatch[1].trim();
        }

        // Pattern 2: "Cert No" or similar abbreviations
        if (!certificateNumber) {
            certNoMatch = text.match(/(?:Cert\.?\s+No\.?|Cert\.?\s+Number)\s*:?\s*([A-Z0-9\-\/]+)/i);
            if (certNoMatch) certificateNumber = certNoMatch[1].trim();
        }

        // Pattern 3: Look for standalone numbers that might be certificate numbers (6+ digits)
        if (!certificateNumber) {
            certNoMatch = text.match(/\b(\d{6,})\b/);
            if (certNoMatch) certificateNumber = certNoMatch[1].trim();
        }

        // Pattern 4: Look for patterns like "No: 123456" or "Number: 123456"
        if (!certificateNumber) {
            certNoMatch = text.match(/(?:No\.?|Number)\s*:?\s*([A-Z0-9\-\/]+)/i);
            if (certNoMatch) certificateNumber = certNoMatch[1].trim();
        }

        const dobMatch = text.match(/(?:Date\s+of\s+Birth|जन्म\s+तिथि|DOB)\s*:?\s*(\d{1,2}[\\/\-]\d{1,2}[\\/\-]\d{2,4})/i);
        const dateOfBirth = dobMatch ? dobMatch[1].trim() : null;

        const issueMatch = text.match(/(?:Date\s+of\s+Issue|जारी\s+करने\s+की\s+तिथि|Issue\s+Date|Issued\s+On)\s*:?\s*(\d{1,2}[\\/\-]\d{1,2}[\\/\-]\d{2,4})/i);
        const dateOfIssue = issueMatch ? issueMatch[1].trim() : null;

        console.log('📋 Extracted data:', {
            certificateNumber,
            dateOfBirth,
            dateOfIssue
        });

        if (!certificateNumber) {
            return res.status(200).json({
                success: true,
                verified: false,
                message: 'Certificate number not found in image',
                error: 'Could not extract certificate number from the uploaded image'
            });
        }

        // Step 3: Convert dates to Unix timestamps
        const dobTimestamp = convertDateToTimestamp(dateOfBirth);
        const issueTimestamp = convertDateToTimestamp(dateOfIssue);

        console.log('📅 Converted timestamps:', {
            dobTimestamp,
            issueTimestamp
        });

        // Step 4: Query MongoDB for matching certificate
        const collection = db.collection(collectionName);

        // Build query - match certificate number and optionally dates
        const query = {
            certificateNumber: certificateNumber
        };

        // Add date filters if we extracted them
        if (dobTimestamp) {
            query.dateOfBirth = dobTimestamp.toString();
        }
        if (issueTimestamp) {
            query.dateOfIssue = issueTimestamp.toString();
        }

        console.log('🔎 MongoDB query:', query);

        const certificate = await collection.findOne(query);

        // Step 5: Return verification result
        if (certificate) {
            console.log('✅ Certificate verified:', certificateNumber);
            return res.status(200).json({
                success: true,
                verified: true,
                message: 'Certificate is verified',
                certificateNumber: certificateNumber
            });
        } else {
            console.log('❌ Certificate not found:', certificateNumber);
            return res.status(200).json({
                success: true,
                verified: false,
                message: 'Certificate not verified',
                certificateNumber: certificateNumber,
                error: 'Certificate not found in database or dates do not match'
            });
        }

    } catch (error) {
        console.error('❌ OCR verification error:', error);
        return res.status(500).json({
            success: false,
            verified: false,
            error: error.message || 'An error occurred during OCR verification'
        });
    }
}
