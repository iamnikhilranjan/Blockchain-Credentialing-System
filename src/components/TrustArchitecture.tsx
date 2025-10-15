import React from "react";
import { Shield, Building2, Users, GraduationCap, CheckCircle } from "lucide-react";

export const TrustArchitecture: React.FC = () => {
  return (
    <section className="w-full bg-background trust-architecture-section">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">

        {/* Role-Based UI Information */}
        <div className="mt-8 bg-gradient-to-br from-accent/10 via-accent/5 to-accent/15 dark:from-accent/20 dark:via-accent/10 dark:to-accent/25 rounded-2xl p-6  border border-accent/30 shadow-lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center shadow-xl mr-4">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h4 className="text-xl md:text-2xl font-bold text-accent dark:text-accent">
                Role-Based User Interface
              </h4>
            </div>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
              The platform features an <strong className="text-accent">intelligent role-based UI system</strong> that dynamically adapts to each user's authority level and responsibilities within the blockchain ecosystem.
            </p>

            {/* Role-specific features grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-background/50 rounded-xl p-4 border border-accent/20">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="font-semibold text-sm text-blue-700 dark:text-blue-300">NVCET Managers</span>
                </div>
                <p className="text-xs text-muted-foreground">Institution management, approval workflows, system oversight</p>
              </div>

              <div className="bg-background/50 rounded-xl p-4 border border-accent/20">
                <div className="flex items-center mb-2">
                  <Building2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-semibold text-sm text-green-700 dark:text-green-300">Institutions</span>
                </div>
                <p className="text-xs text-muted-foreground">Template creation, staff management, learner registration</p>
              </div>

              <div className="bg-background/50 rounded-xl p-4 border border-accent/20">
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="font-semibold text-sm text-purple-700 dark:text-purple-300">Certifiers</span>
                </div>
                <p className="text-xs text-muted-foreground">Certificate issuance, learner verification, credential management</p>
              </div>

              <div className="bg-background/50 rounded-xl p-4 border border-accent/20">
                <div className="flex items-center mb-2">
                  <GraduationCap className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="font-semibold text-sm text-amber-700 dark:text-amber-300">Learners</span>
                </div>
                <p className="text-xs text-muted-foreground">Credential viewing, verification requests, achievement tracking</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <div className="w-full max-w-2xl rounded-xl overflow-hidden shadow-lg border border-accent/20 bg-background">
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src="https://www.youtube.com/embed/lxMeQc8yjxI"
                    title="Website Prototype Overview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-64 md:h-96"
                  />
                </div>
                <div className="p-4 text-center">
                  <h5 className="font-semibold text-base md:text-lg mb-2">Website Prototype Overview</h5>
                  <p className="text-sm text-muted-foreground">
                    For Institutional access, kindly Contact Us - <span className="font-medium text-accent">rahulkumarmahto334@gmail.com</span>
                  </p>
                </div>
              </div>
            </div>

            {/* <div className="mt-6 p-4 bg-accent/5 rounded-xl border border-accent/20">
              <p className="text-sm text-muted-foreground">
                <strong className="text-accent">Smart Permissions:</strong> Each role has tailored functionality,
                blockchain permissions, and interface elements that match their specific responsibilities
                within the decentralized credentialing ecosystem.
              </p>
            </div> */}
          </div>
        </div>
        {/* Three-Level Authority Structure */}
        <div className="mt-12 md:mt-16 lg:mt-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4">
                Three-Level Authority Structure
              </h3>
              <p className="text-muted-foreground text-base md:text-lg">
                A hierarchical system ensuring trust and verification at every level
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
              {/* Level 1: NVCET Managers */}
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/30 shadow-lg">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        NVCET Managers
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Top-level administrators who approve and manage institutions
                      </p>
                    </div>
                  </div>
                </div>
                {/* Arrow pointing down */}
                <div className="hidden md:block absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-400"></div>
                </div>
              </div>

              {/* Level 2: Institutions */}
              <div className="relative">
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800/30 shadow-lg">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                        Institutions
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Educational institutions approved by managers to create templates
                      </p>
                    </div>
                  </div>
                </div>
                {/* Arrow pointing down */}
                <div className="hidden md:block absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-400"></div>
                </div>
              </div>

              {/* Level 3: Certifiers */}
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800/30 shadow-lg">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                        Certifiers
                      </h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Staff members who issue certificates to registered learners
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Flow */}
            <div className="bg-gradient-to-r from-accent/5 to-accent/10 rounded-2xl p-6 md:p-8 border border-accent/20">
              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
                <div className="flex items-center space-x-3">
                  <GraduationCap className="h-6 w-6 text-accent" />
                  <span className="font-medium">Registered Learners</span>
                </div>
                <div className="hidden md:block text-accent">→</div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-accent" />
                  <span className="font-medium">Certificate Issued</span>
                </div>
                <div className="hidden md:block text-accent">→</div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-accent" />
                  <span className="font-medium">Public Verification</span>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Certifiers issue certificates to registered learners, and anyone can verify the certificate authenticity
              </p>
            </div>


          </div>
        </div>


        {/* Contracts Architecture Card */}
        <div className="mt-16">
          <div className="max-w-5xl mx-auto">
            <div className=" text-center mb-8">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight leading-tight mb-2">
                  <span className="bg-gradient-to-r from-accent via-accent/80 to-accent bg-clip-text text-transparent">
                    Transforming Education Credentials
                  </span>
                  <span className="text-foreground ml-2">
                    Through Blockchain Technology
                  </span>
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-2xl mx-auto">
                  Five smart contracts working together to create tamper-proof, instantly verifiable certificates for every skill and achievement.
                </p>
              </div>
              <div className="mt-8 md:mt-10 lg:mt-12 grid grid-cols-1 gap-8 items-center">
                <div className="w-full">
                  <img
                    src="/contracts-architecture.png"
                    alt="Five smart contracts architecture diagram"
                    className="mx-auto w-full max-w-5xl h-auto object-contain border-2 border-accent/40 rounded-2xl shadow-md"
                    style={{ imageRendering: "-webkit-optimize-contrast" }}
                  />
                </div>
                <div className="max-w-3xl mx-auto text-center text-muted-foreground text-base md:text-lg leading-relaxed">
                  <p>
                    Our platform runs on a five-contract blockchain architecture—a decentralized “chain of trust.” Each contract has a defined role, from verifying institutions to securing individual credentials. This structure makes every achievement tamper-proof, scalable, and permanently verifiable without third-party servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TrustArchitecture;


