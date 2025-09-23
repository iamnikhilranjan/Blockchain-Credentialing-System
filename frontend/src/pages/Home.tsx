import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, Globe, Lock, Zap, Users, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-blockchain.jpg";

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: "Tamper-Proof Security",
      description: "Blockchain technology ensures certificates cannot be forged or duplicated, providing absolute trust in credentials.",
      color: "text-accent"
    },
    {
      icon: CheckCircle,
      title: "Instant Verification",
      description: "Verify certificates in seconds through QR codes or manual entry, eliminating lengthy verification processes.",
      color: "text-primary"
    },
    {
      icon: Globe,
      title: "Global Portability",
      description: "Certificates are recognized internationally, enabling seamless skill recognition across borders.",
      color: "text-accent"
    },
    {
      icon: Lock,
      title: "Data Privacy",
      description: "Learner consent controls information access, ensuring privacy while enabling verification.",
      color: "text-primary"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Decentralized verification provides instant results without database dependencies.",
      color: "text-accent"
    },
    {
      icon: Users,
      title: "Multi-Stakeholder",
      description: "Serves learners, employers, institutions, and regulators with tailored interfaces.",
      color: "text-primary"
    }
  ];

  const benefits = [
    {
      title: "For Learners",
      points: ["Lifetime ownership of credentials", "Global recognition", "Instant sharing capability", "Fraud protection"]
    },
    {
      title: "For Employers",
      points: ["Instant verification", "Reduced hiring fraud", "Trusted skill assessment", "Streamlined recruitment"]
    },
    {
      title: "For Institutions",
      points: ["Secure issuance process", "Reduced administrative burden", "Enhanced reputation", "Compliance assurance"]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-gradient-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 25, 47, 0.8), rgba(10, 25, 47, 0.9)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="outline" className="mb-6 border-accent text-accent bg-accent/10">
            NCVET Blockchain Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Trusted Certificates on the{" "}
            <span className="text-transparent bg-gradient-accent bg-clip-text">
              Blockchain
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed">
            Revolutionizing India's vocational education with tamper-proof, instantly verifiable digital credentials. 
            Built for learners, employers, and institutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/verify">
              <Button size="lg" className="group bg-accent hover:bg-accent-glow text-accent-foreground text-lg px-8 py-4 shadow-glow-accent">
                Verify Certificate
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-black hover:bg-white hover:text-primary text-lg px-8 py-4"
            >
              Learn More
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">1M+</div>
              <div className="text-gray-300 text-sm">Certificates Issued</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">500+</div>
              <div className="text-gray-300 text-sm">Institutions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">99.9%</div>
              <div className="text-gray-300 text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-gray-300 text-sm">Verification</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose Blockchain Certificates?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built on cutting-edge blockchain technology to solve the challenges of traditional certificate systems
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-card transition-all duration-300 bg-gradient-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg bg-accent/10 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Benefits for Everyone</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform creates value for all stakeholders in the vocational education ecosystem
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-card">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-primary mb-6">{benefit.title}</h3>
                  <ul className="space-y-3">
                    {benefit.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Secure Your Certificates?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join thousands of institutions and learners who trust our blockchain platform for certificate management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/verify">
              <Button size="lg" className="bg-accent hover:bg-accent-glow text-accent-foreground text-lg px-8 py-4 shadow-glow-accent">
                Start Verification
              </Button>
            </Link>
            <Link to="/upload">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-black hover:bg-white hover:text-primary text-lg px-8 py-4"
              >
                Issue Certificates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-8 w-8 text-accent" />
                <div>
                  <div className="text-xl font-bold">CertifyIndia</div>
                  <div className="text-sm text-gray-300">Secure Certificates</div>
                </div>
              </div>
              <p className="text-gray-300 max-w-md">
                Empowering India's vocational education with blockchain-secured certificates. 
                Built for trust, designed for the future.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/verify" className="hover:text-accent transition-colors">Verify Certificates</Link></li>
                <li><Link to="/upload" className="hover:text-accent transition-colors">Issue Certificates</Link></li>
                <li><Link to="/admin" className="hover:text-accent transition-colors">Admin Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-accent transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>&copy; 2025 CertifyIndia. Built with blockchain technology for secure certificate management.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;