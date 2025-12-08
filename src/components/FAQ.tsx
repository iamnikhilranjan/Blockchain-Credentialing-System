import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "What is blockchain-based credentialing?",
            answer: "Blockchain-based credentialing uses distributed ledger technology to create tamper-proof digital certificates. Each credential is cryptographically secured and stored on the blockchain, making it impossible to forge or alter. This ensures permanent verification and trust.",
        },
        {
            question: "How do I verify a certificate?",
            answer: "Simply navigate to the Verify page and enter the certificate ID or scan the QR code on the certificate. Our system will instantly check the blockchain and confirm the certificate's authenticity, showing you all relevant details including issuer, recipient, and issuance date.",
        },
        {
            question: "Are my credentials accessible forever?",
            answer: "Yes! Once issued on the blockchain, your credentials are permanently stored and accessible. You maintain complete ownership and can access them anytime, anywhere. The decentralized nature of blockchain ensures your credentials remain available even if the issuing institution changes.",
        },
        {
            question: "How secure are blockchain credentials?",
            answer: "Blockchain credentials are extremely secure. They use cryptographic hashing and are stored across a distributed network, making them virtually impossible to hack or tamper with. Each certificate has a unique digital signature that can be verified instantly.",
        },
        {
            question: "Can employers trust these certificates?",
            answer: "Absolutely. Employers can verify certificates in seconds using our verification system. The blockchain provides an immutable record that cannot be faked, giving employers 100% confidence in the authenticity of credentials.",
        },
        {
            question: "What happens if I lose my certificate?",
            answer: "Your certificate is stored on the blockchain, not just on paper or a file. Even if you lose the physical or digital copy, you can always retrieve it using your wallet address or certificate ID. Your credentials are permanently accessible.",
        },
        {
            question: "How long does it take to issue a certificate?",
            answer: "Certificate issuance is nearly instant. Once the issuing institution submits the certificate details, it's processed and recorded on the blockchain within seconds. Recipients receive immediate access to their verified credentials.",
        },
        {
            question: "Do I need technical knowledge to use this system?",
            answer: "Not at all! Our platform is designed to be user-friendly for everyone. Whether you're issuing, receiving, or verifying certificates, the process is simple and intuitive. We handle all the blockchain complexity behind the scenes.",
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
                        <span className="text-sm font-medium text-accent">Got Questions?</span>
                    </div>

                    <h2 className="font-heading text-4xl md:text-5xl font-bold">
                        Frequently Asked <span className="text-accent">Questions</span>
                    </h2>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Everything you need to know about blockchain credentials
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
                        Still have questions?
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium transition-colors"
                    >
                        Contact our support team
                        <ChevronDown className="h-4 w-4 -rotate-90" />
                    </a>
                </div>
            </div>
        </section>
    );
};
