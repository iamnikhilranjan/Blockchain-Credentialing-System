import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CertificateTemplateProps } from "./types";
import satyaImg from "@/assets/satya.png";
import ncvetImg from "@/assets/ncvet.png";
import azadiImg from "@/assets/azadi.png";

/**
 * Template 1: Matches cert1-template.png exactly
 * NO sensitive data (name, marks) - these are hashed
 * Shows: Course, Institute, Dates, Certificate Identity (hash), QR code
 */
export function Template1({ certificateData, includeQR = false, qrData, className = "" }: CertificateTemplateProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

    useEffect(() => {
        const generateQR = async () => {
            if (includeQR && qrData) {
                try {
                    const url = await QRCode.toDataURL(qrData, {
                        width: 200,
                        margin: 1,
                        color: { dark: "#000000", light: "#ffffff" }
                    });
                    setQrCodeUrl(url);
                } catch (err) {
                    console.error("Error generating QR code:", err);
                }
            }
        };
        generateQR();
    }, [includeQR, qrData]);

    const { certificateId, courseName, issueDate, expiryDate, instituteName, identityHash } = certificateData;

    // Debug logging
    console.log('Template1 - certificateId:', certificateId, 'type:', typeof certificateId);
    console.log('Template1 - certificateId !== undefined:', certificateId !== undefined);
    console.log('Template1 - certificateId !== null:', certificateId !== null);
    console.log('Template1 - certificateId !== "Preview":', certificateId !== "Preview");

    // Certificate ID for display - show all IDs except "Preview"
    const displayCertId = certificateId === "Preview" ? "" : certificateId;

    // Identity Hash from blockchain (the dataHash)
    const displayIdentityHash = identityHash || "";

    return (
        <div className={`certificate-template ${className}`}>
            {/* A4 size certificate */}
            <div className="relative w-[210mm] h-[297mm] bg-white p-12 shadow-2xl" style={{ aspectRatio: '210/297' }}>

                {/* Outer decorative border */}
                <div className="absolute inset-4 border-8 border-double border-orange-700"></div>

                {/* Inner decorative border */}
                <div className="absolute inset-8 border-2 border-orange-600"></div>

                {/* Content area */}
                <div className="relative h-full flex flex-col">

                    {/* Header with 3 logos */}
                    <div className="flex items-start justify-between mb-8 px-4">
                        <img src={satyaImg} alt="Satya" className="h-24 w-auto object-contain" />
                        <img src={ncvetImg} alt="NCVET" className="h-24 w-auto object-contain" />
                        <img src={azadiImg} alt="Azadi" className="h-24 w-auto object-contain" />
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-7xl font-bold text-orange-800 mb-4" style={{ fontFamily: 'serif' }}>
                            CERTIFICATE
                        </h1>
                        <div className="w-48 h-1 bg-orange-600 mx-auto mb-3"></div>
                        <p className="text-2xl text-gray-700 font-semibold tracking-widest">OF ACHIEVEMENT</p>
                    </div>

                    {/* Certificate ID - at the top */}
                    <div className="text-center mb-8">
                        <p className="text-xs text-gray-500 uppercase mb-1">Certificate ID</p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#f3f4f6', // gray-100
                            border: '1px solid #d1d5db', // gray-300
                            borderRadius: '4px',
                            padding: '8px 16px',
                            margin: '0 auto',
                            width: 'fit-content',
                            minWidth: '100px'
                        }}>
                            <span style={{
                                color: '#000000',
                                fontSize: '16px',
                                fontFamily: 'Arial, sans-serif',
                                fontWeight: 'bold',
                                display: 'inline-block'
                            }}>
                                {displayCertId || "PENDING"}
                            </span>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-16 space-y-8">

                        <p className="text-xl text-gray-700">
                            This is to certify that the credential holder
                        </p>

                        <p className="text-xl text-gray-700">
                            has successfully completed the course
                        </p>

                        {/* Course name */}
                        {courseName && (
                            <div className="my-4">
                                <p className="text-4xl font-bold text-orange-800 py-3 px-8 border-b-4 border-orange-600 inline-block">
                                    {courseName}
                                </p>
                            </div>
                        )}

                        {/* Institute */}
                        {instituteName && (
                            <p className="text-xl text-gray-700">
                                from <span className="font-semibold text-orange-700">{instituteName}</span>
                            </p>
                        )}

                        {/* Privacy notice */}
                        <div className="mt-6 bg-orange-50 border-l-4 border-orange-500 p-4 max-w-2xl">
                            <p className="text-sm text-gray-700">
                                🔒 Learner identity and assessment data are cryptographically hashed for privacy
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 pt-8 border-t-2 border-gray-300 space-y-6">

                        {/* Identity Hash - at the bottom */}
                        <div className="mb-6">
                            <p className="text-xs text-gray-500 uppercase mb-1">Identity Hash</p>
                            <div className="bg-gray-50 border border-gray-300 rounded px-3 py-2">
                                {displayIdentityHash ? (
                                    <p className="font-mono text-sm text-gray-900 break-all">{displayIdentityHash}</p>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">Will be generated upon issuance</p>
                                )}
                            </div>
                        </div>
                        {/* Bottom row: Dates, QR, Signature */}
                        <div className="flex justify-between items-end">

                            {/* Left: Dates */}
                            <div className="text-left">
                                {issueDate && (
                                    <div className="mb-2">
                                        <p className="text-xs text-gray-500 uppercase">Issue Date</p>
                                        <p className="text-sm font-semibold text-gray-800">{issueDate}</p>
                                    </div>
                                )}
                                {expiryDate && expiryDate !== "lifetime" ? (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Valid Until</p>
                                        <p className="text-sm font-semibold text-gray-800">{expiryDate}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Validity</p>
                                        <p className="text-sm font-semibold text-green-600">Lifetime</p>
                                    </div>
                                )}
                            </div>

                            {/* Center: QR Code */}
                            <div className="flex flex-col items-center">
                                {includeQR && qrCodeUrl ? (
                                    <>
                                        <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40 border-2 border-gray-400 p-1 bg-white" />
                                        <p className="text-xs text-gray-600 mt-1">Scan to Verify</p>
                                    </>
                                ) : (
                                    <div className="w-40 h-40 border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                        <p className="text-xs text-gray-400">QR Code</p>
                                    </div>
                                )}
                            </div>

                            {/* Right: Signature */}
                            <div className="text-right">
                                <div className="border-t-2 border-gray-600 pt-2 min-w-[160px]">
                                    <p className="text-sm font-semibold text-gray-800">Authorized Signature</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
