import ncvetImg from "@/assets/ncvet.png";
import satyaImg from "@/assets/satya.png";
import skillIndiaImg from "@/assets/skill-india.png";
import candidatePhotoImg from "@/assets/candidate-photo.jpg";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface SkillCertificateProps {
    data: {
        candidateName?: string;
        fatherName?: string;
        dateOfBirth?: string;
        enrollmentNo?: string;
        assessedBy?: string;
        jobRole?: string;
        nsqfLevel?: string;
        duration?: string;
        creditsEarned?: string;
        trainingCentre?: string;
        district?: string;
        state?: string;
        grade?: string;
        placeOfIssue?: string;
        dateOfIssue?: string;
        certificateNo?: string;
        apaarId?: string;
        qrData?: string;
    };
}

const SkillCertificate = ({ data }: SkillCertificateProps) => {
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (qrCanvasRef.current && data.qrData) {
            QRCode.toCanvas(qrCanvasRef.current, data.qrData, {
                width: 64,
                margin: 1,
            });
        }
    }, [data.qrData]);

    return (
        <div className="w-full flex justify-center items-center bg-gray-100 p-8">
            {/* A4 Landscape: 297mm x 210mm */}
            <div
                className="bg-white relative"
                style={{
                    width: "297mm",
                    height: "210mm",
                    boxShadow: "0 0 20px rgba(0,0,0,0.1)",
                }}
            >
                {/* Simple Double Border - Outer (thicker) */}
                <div className="absolute inset-3 border-[6px] border-blue-700"></div>

                {/* Simple Double Border - Inner (thinner) */}
                <div className="absolute inset-5 border-[2px] border-blue-600"></div>

                {/* Content - All content must be inside the borders with better spacing */}
                <div className="relative px-6 py-2 h-full flex flex-col" style={{ margin: "20px" }}>
                    {/* Header with Logos */}
                    <div className="flex justify-between items-start mb-2">
                        {/* NCVET Logo */}
                        <div className="w-20">
                            <img src={ncvetImg} alt="NCVET" className="w-full h-auto" />
                        </div>

                        {/* Center Content */}
                        <div className="flex-1 text-center px-4">
                            {/* Government Emblem */}
                            <div className="mb-1">
                                <img
                                    src={satyaImg}
                                    alt="Government Emblem"
                                    className="w-12 h-auto mx-auto"
                                />
                            </div>
                            {/* Awarding Body Name */}
                            <div className="mb-1">
                                <p className="text-blue-600 font-bold text-base">
                                    अवार्डिंग बॉडी का नाम
                                </p>
                                <p className="text-blue-600 font-semibold text-xs">
                                    NAME OF THE AWARDING BODY
                                </p>
                            </div>
                            <div className="mb-1">
                                <p className="text-black font-bold text-xs">
                                    राष्ट्रीय व्यावसायिक शिक्षा एवं प्रशिक्षण परिषद द्वारा मान्यता प्राप्त
                                </p>
                                <p className="text-black font-semibold text-[10px]">
                                    Recognised by NCVET
                                </p>
                            </div>
                            <div>
                                <p className="text-black font-bold text-xs">
                                    डिप्लोमा / एडवांस डिप्लोमा
                                </p>
                                <p className="text-black font-semibold text-[10px]">
                                    Diploma/ Advance Diploma
                                </p>
                            </div>
                        </div>

                        {/* Skill India Logo & Photo */}
                        <div className="w-28 text-center">
                            <div className="mb-2">
                                <img src={skillIndiaImg} alt="Skill India" className="w-16 h-16 mx-auto object-contain" />
                            </div>
                            <div className="border-2 border-black w-20 h-24 mx-auto overflow-hidden">
                                <img src={candidatePhotoImg} alt="Candidate Photo" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>

                    {/* Certificate Details */}
                    <div className="flex-1 text-xs space-y-1">
                        {/* Certificate Number and APAAR ID */}
                        <div className="flex justify-end items-center gap-4 text-[10px] mb-1">
                            <div className="text-right">
                                <span className="text-gray-700">प्रमाणपत्र संख्या Certificate No.: </span>
                                <span className="font-bold text-black">
                                    {data.certificateNo || "AWYUPB000100000-081214"}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-700">APAAR ID: </span>
                                <span className="font-bold text-black">{data.apaarId || "724386800059"}</span>
                            </div>
                        </div>

                        {/* Main Certificate Text */}
                        <div className="space-y-0.5">
                            <p className="text-blue-600 text-xs">
                                प्रमाणित किया जाता है कि श्री./सुश्री./एमएक्स{" "}
                                <span className="text-black font-semibold">
                                    {data.candidateName || "____________________"}
                                </span>
                            </p>
                            <p className="text-blue-600 text-[10px]">
                                This is to certify that Mr./Ms./Mx.{" "}
                                <span className="text-black">
                                    {data.candidateName || "____________________"}
                                </span>
                            </p>
                        </div>

                        {/* Father/Guardian Name, DOB, and Enrollment */}
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <p className="text-blue-600 text-[10px]">पुत्र / पुत्री / आश्रित</p>
                                <p className="text-blue-600 text-[10px]">Son/Daughter/Ward of</p>
                                <p className="font-semibold text-black border-b border-gray-400 pb-0.5 text-xs">
                                    {data.fatherName || "____________________"}
                                </p>
                            </div>
                            <div>
                                <p className="text-blue-600 text-[10px]">जन्म तिथि</p>
                                <p className="text-blue-600 text-[10px]">Date of Birth</p>
                                <p className="font-semibold text-black border-b border-gray-400 pb-0.5 text-xs">
                                    {data.dateOfBirth || "____________________"}
                                </p>
                            </div>
                            <div>
                                <p className="text-blue-600 text-[10px]">नामांकन संख्या</p>
                                <p className="text-blue-600 text-[10px]">Enrollment No</p>
                                <p className="font-semibold text-black border-b border-gray-400 pb-0.5 text-xs">
                                    {data.enrollmentNo || "____________________"}
                                </p>
                            </div>
                        </div>

                        {/* Assessment */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-blue-600 text-[10px]">द्वारा</p>
                                <p className="text-blue-600 text-[10px]">has been assessed by</p>
                                <p className="font-semibold text-black border-b border-gray-400 pb-0.5 text-xs">
                                    {data.assessedBy || "____________________"}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-blue-600 text-[10px]">और कार्य भूमिका / अवधि का</p>
                                <p className="text-blue-600 text-[10px]">and cleared the assessment</p>
                                <p className="font-semibold text-black border-b border-gray-400 pb-0.5 text-xs">
                                    {data.grade || "____________________"}
                                </p>
                            </div>
                        </div>

                        {/* Qualification */}
                        <div>
                            <p className="text-blue-600 text-[10px]">योग्यता/विशेषज्ञता</p>
                            <p className="text-blue-600 text-[10px]">in the Qualification</p>
                            <p className="font-semibold text-black border-b border-gray-400 pb-0.5 text-xs">
                                {data.jobRole || "____________________"}
                            </p>
                        </div>

                        {/* Duration, Credits, and NSQF */}
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <p className="text-blue-600 text-[10px]">अवधि</p>
                                <p className="text-blue-600 text-[10px]">of Duration</p>
                                <p className="font-semibold text-black border-b border-gray-400 pb-0.5 text-xs">
                                    {data.duration || "____________________"}
                                </p>
                            </div>
                            <div>
                                <p className="text-blue-600 text-[10px]">क्रेडिट किया</p>
                                <p className="text-blue-600 text-[10px]">having earned</p>
                                <p className="font-semibold text-black border-b border-gray-400 pb-0.5 text-xs">
                                    {data.creditsEarned || "____________________"}
                                </p>
                            </div>
                            <div>
                                <p className="text-blue-600 text-[10px]">प्रशिक्षण केंद्र पर</p>
                                <p className="text-blue-600 text-[10px]">Credits at Training Centre</p>
                                <p className="font-semibold text-black border-b border-gray-400 pb-0.5 text-xs">
                                    {data.trainingCentre || "____________________"}
                                </p>
                            </div>
                        </div>

                        {/* District and State - Combined labels */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-blue-600 text-[9px]">जिला District</p>
                                <p className="font-semibold text-black border-b border-gray-400 pb-0.5 text-xs">
                                    {data.district || "____________________"}
                                </p>
                            </div>
                            <div>
                                <p className="text-blue-600 text-[9px]">राज्य State</p>
                                <p className="font-semibold text-black border-b border-gray-400 pb-0.5 text-xs">
                                    {data.state || "____________________"}
                                </p>
                            </div>
                        </div>

                        {/* NSQF Level */}
                        <div>
                            <p className="text-blue-600 text-[9px]">एनएसक्यूएफ स्तर पर at NSQF Level</p>
                            <p className="font-semibold text-black border-b border-gray-400 pb-0.5 text-xs">
                                {data.nsqfLevel || "____________________"}
                            </p>
                        </div>

                        {/* Grade/Percentage */}
                        <div>
                            <p className="text-blue-600 text-[9px]">प्रतिशत / श्रेणी के साथ उत्तीर्ण किया। with ____%/Grade.</p>
                        </div>

                        {/* Place and Date of Issue - Combined labels */}
                        <div className="grid grid-cols-2 gap-2 mt-0.5">
                            <div>
                                <p className="text-blue-600 text-[9px]">जारी करने का स्थान Place of Issue</p>
                                <p className="font-semibold text-black border-b border-gray-400 pb-0.5 text-xs">
                                    {data.placeOfIssue || "____________________"}
                                </p>
                            </div>
                            <div>
                                <p className="text-blue-600 text-[9px]">जारी करने की तिथि Date of Issue</p>
                                <p className="font-semibold text-black border-b border-gray-400 pb-0.5 text-xs">
                                    {data.dateOfIssue || "____________________"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Inside borders with proper spacing */}
                    <div className="mt-auto mb-12 flex justify-between items-start gap-2">
                        {/* QR Code */}
                        <div className="flex-shrink-0">
                            {data.qrData ? (
                                <canvas ref={qrCanvasRef} className="border border-black" />
                            ) : (
                                <div className="w-16 h-16 border border-black flex items-center justify-center bg-white">
                                    <span className="text-[7px] text-gray-500 text-center">QR</span>
                                </div>
                            )}
                        </div>

                        {/* Center Text */}
                        <div className="text-center text-[8px] flex-1 px-2 pt-2">
                            <p className="font-semibold text-black">NSQF = National Skills Qualification Framework</p>
                            <p className="text-gray-700 mt-0.5">(Please upload certificate/s to Digilocker/Apaar/Apaar Agency)</p>
                        </div>

                        {/* Logos and Signatures */}
                        <div className="flex gap-2 flex-shrink-0">
                            <div className="text-center">
                                <div className="w-14 h-14 border border-black flex items-center justify-center bg-white">
                                    <span className="text-[7px] text-gray-600">Logo</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="w-14 h-14 border border-black flex items-center justify-center bg-white">
                                    <span className="text-[7px] text-gray-600">Logo NB</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkillCertificate;
