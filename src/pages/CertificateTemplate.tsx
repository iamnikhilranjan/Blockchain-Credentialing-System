import SkillCertificate from "@/components/SkillCertificate";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const CertificateTemplate = () => {
    // Default values for OCR testing
    const certificateData = {
        candidateName: "Rahul Kumar Singh",
        fatherName: "Vijay Kumar Singh",
        dateOfBirth: "15/08/2000",
        enrollmentNo: "EN2025001234",
        assessedBy: "National Assessment and Accreditation Council",
        jobRole: "Full Stack Web Developer",
        nsqfLevel: "Level 5",
        duration: "6 Months",
        creditsEarned: "120 Credits",
        trainingCentre: "National Skill Training Institute",
        district: "Central Delhi",
        state: "Delhi",
        grade: "85% / Grade A",
        placeOfIssue: "New Delhi",
        dateOfIssue: "09/12/2025",
        certificateNo: "SKILL2025001234",
        apaarId: "724386800059",
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1 bg-background py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-6 space-y-2">
                        <h1 className="text-3xl font-bold text-foreground">
                            Skill India Certificate Template
                        </h1>
                        <p className="text-muted-foreground">
                            This is a sample certificate with default values for OCR testing
                        </p>
                    </div>
                    <SkillCertificate data={certificateData} />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CertificateTemplate;
