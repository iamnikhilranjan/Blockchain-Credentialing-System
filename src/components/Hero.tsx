import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-blockchain.jpg";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 blockchain-grid opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/20" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/50 border border-accent/20 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse-slow" />
            <span className="text-sm font-medium text-accent">Powered by Blockchain Technology</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight">
            Blockchain-Powered
            <br />
            <span className="bg-gradient-to-r from-accent via-accent to-foreground bg-clip-text text-transparent text-glow">
              Credentials
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Secure, tamper-proof digital credentials that are instantly verifiable and trusted forever
          </p>

          {/* Features List */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
            {['Immutable Records', 'Instant Verification', 'Lifetime Ownership'].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              variant="hero"
              size="lg"
              className="text-lg px-8 py-6 h-auto"
              onClick={() => navigate('/verify')}
            >
              Verify Certificate
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 h-auto border-accent/30 hover:border-accent hover:bg-accent/5"
              onClick={() => {
                // Scroll to the next section (TrustArchitecture)
                const nextSection = document.querySelector('.trust-architecture-section');
                if (nextSection) {
                  nextSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Load More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            {[
              { value: '50K+', label: 'Certificates Issued' },
              { value: '99.9%', label: 'Verification Success' },
              { value: '24/7', label: 'Instant Validation' },
            ].map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="font-heading text-3xl md:text-4xl font-bold text-accent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
