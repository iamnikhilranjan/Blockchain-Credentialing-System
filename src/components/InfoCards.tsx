import { Card, CardContent } from "@/components/ui/card";
import iconSecurity from "@/assets/icon-security.jpg";
import iconVerify from "@/assets/icon-verify.jpg";
import iconOwnership from "@/assets/icon-ownership.jpg";
import { useTranslation, Trans } from "react-i18next";

export const InfoCards = () => {
  const { t } = useTranslation();

  const features = [
    {
      title: t('tamperProofRecords'),
      description: t('tamperProofRecordsDesc'),
      icon: iconSecurity,
    },
    {
      title: t('instantEmployerVerification'),
      description: t('instantEmployerVerificationDesc'),
      icon: iconVerify,
    },
    {
      title: t('lifelongLearnerOwnership'),
      description: t('lifelongLearnerOwnershipDesc'),
      icon: iconOwnership,
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 blockchain-grid opacity-20" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-heading text-4xl md:text-5xl font-bold">
            <Trans i18nKey="whyChoose" components={{ 1: <span className="text-accent" /> }} />
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('whyChooseSubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-card group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8 space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 bg-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-full h-full object-cover rounded-2xl relative z-10 transition-transform group-hover:scale-110 duration-300"
                  />
                </div>

                <h3 className="font-heading text-2xl font-semibold text-center group-hover:text-accent transition-colors">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground text-center leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
