import SkillCertificate from "@/components/SkillCertificate";

const Index = () => {
  // Example data - you can customize this
  const certificateData = {
    candidateName: "",
    fatherName: "",
    dateOfBirth: "",
    enrollmentNo: "",
    assessedBy: "",
    jobRole: "",
    nsqfLevel: "",
    duration: "",
    creditsEarned: "",
    trainingCentre: "",
    district: "",
    state: "",
    grade: "",
    placeOfIssue: "",
    dateOfIssue: "",
    certificateNo: "AWJPB00100000-081214",
    apaarId: "724386800059",
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-foreground mb-6">
          Skill India Certificate
        </h1>
        <SkillCertificate data={certificateData} />
      </div>
    </div>
  );
};

export default Index;

