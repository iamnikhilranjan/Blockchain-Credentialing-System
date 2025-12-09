import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation, Trans } from "react-i18next";

export const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const { t } = useTranslation();

    const faqs = [
        {
            question: t('faq1Q'),
            answer: t('faq1A'),
        },
        {
            question: t('faq2Q'),
            answer: t('faq2A'),
        },
        {
            question: t('faq3Q'),
            answer: t('faq3A'),
        },
        {
            question: t('faq4Q'),
            answer: t('faq4A'),
        },
        {
            question: t('faq5Q'),
            answer: t('faq5A'),
        },
        {
            question: t('faq6Q'),
            answer: t('faq6A'),
        },
        {
            question: t('faq7Q'),
            answer: t('faq7A'),
        },
        {
            question: t('faq8Q'),
            answer: t('faq8A'),
        },
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 blockchain-grid opacity-20" />
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/50 border border-accent/20 rounded-full backdrop-blur-sm mb-4">
                        <HelpCircle className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium text-accent">{t('gotQuestions')}</span>
                    </div>

                    <h2 className="font-heading text-4xl md:text-5xl font-bold">
                        <Trans i18nKey="frequentlyAskedQuestions" components={{ 1: <span className="text-accent" /> }} />
                    </h2>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t('faqSubtitle')}
                    </p>
                </div>

                {/* FAQ Grid */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <Card
                            key={index}
                            className={`bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-300 overflow-hidden ${openIndex === index
                                ? "border-accent/50 shadow-card"
                                : "hover:border-accent/30"
                                }`}
                        >
                            <CardContent className="p-0">
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full text-left p-6 flex items-center justify-between gap-4 group"
                                    aria-expanded={openIndex === index}
                                >
                                    <span className="font-heading text-lg font-semibold group-hover:text-accent transition-colors">
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        className={`h-5 w-5 text-accent transition-transform duration-300 flex-shrink-0 ${openIndex === index ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                <div
                                    className={`transition-all duration-300 ease-in-out ${openIndex === index
                                        ? "max-h-96 opacity-100"
                                        : "max-h-0 opacity-0"
                                        }`}
                                >
                                    <div className="px-6 pb-6 pt-0">
                                        <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent mb-4" />
                                        <p className="text-muted-foreground leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-12">
                    <p className="text-muted-foreground mb-4">
                        {t('stillHaveQuestions')}
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium transition-colors"
                    >
                        {t('contactSupport')}
                        <ChevronDown className="h-4 w-4 -rotate-90" />
                    </a>
                </div>
            </div>
        </section>
    );
};
