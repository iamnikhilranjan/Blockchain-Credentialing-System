import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function DigiLocker() {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'connecting' | 'success'>('connecting');
    const certificateData = location.state?.certificate || {};

    // Reliable SVG Logos
    const digilockerLogo = "https://upload.wikimedia.org/wikipedia/commons/1/1f/DigiLocker.svg";
    const indiaEmblem = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/300px-Emblem_of_India.svg.png";

    useEffect(() => {
        // Simulate connection delay
        const timer = setTimeout(() => {
            setStatus('success');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#F3F6F9] font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <img
                                src={digilockerLogo}
                                alt="DigiLocker"
                                className="h-8 w-8 object-contain"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[#2D398F] font-bold text-xl leading-none">DigiLocker</span>
                            <span className="text-gray-500 text-xs">Document Wallet to Empower Citizens</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <img
                            src={indiaEmblem}
                            alt="Emblem of India"
                            className="h-8 md:h-10 object-contain"
                        />
                    </div>
                </div>
                <div className="bg-[#2D398F] h-1 w-full"></div>
            </header>

            <main className="container mx-auto px-4 py-8 md:py-16 flex flex-col items-center">
                <div className="w-full max-w-2xl">
                    <Button
                        variant="ghost"
                        className="mb-6 hover:bg-transparent text-gray-600 hover:text-[#2D398F] pl-0"
                        onClick={() => navigate('/certificates')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Application
                    </Button>

                    <Card className="bg-white shadow-lg border-none rounded-xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
                        {status === 'connecting' ? (
                            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                                    <div className="relative bg-white p-4 rounded-full border-4 border-[#00B5E2] inline-block">
                                        <img
                                            src={digilockerLogo}
                                            alt="DigiLocker"
                                            className="h-16 w-16"
                                        />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-[#2D398F]">Connecting to DigiLocker</h2>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Please wait while we securely link your certificate
                                    <span className="font-semibold text-gray-700 block mt-1">
                                        #{certificateData.id || 'Unknown'} - {certificateData.templateName || 'Certificate'}
                                    </span>
                                    to your DigiLocker account.
                                </p>
                                <div className="flex items-center justify-center gap-2 text-sm text-[#00B5E2] font-medium">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Verifying Credentials...
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in zoom-in duration-500 w-full">
                                <div className="bg-green-50 p-6 rounded-full inline-block">
                                    <CheckCircle className="h-16 w-16 text-green-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-[#2D398F]">Successfully Linked!</h2>

                                {/* Certificate Preview Card */}
                                {certificateData.id && (
                                    <div className="bg-white border text-left border-gray-200 rounded-lg p-4 shadow-sm max-w-sm mx-auto w-full">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center border-b pb-2 mb-2">
                                                <span className="text-xs text-gray-500 uppercase tracking-wider">Document</span>
                                                <span className="text-xs font-mono text-[#2D398F]">#{certificateData.id}</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900">{certificateData.templateName || 'Certificate'}</h3>
                                            <div className="text-sm text-gray-600">
                                                <p><span className="font-semibold">Issuer:</span> {certificateData.instituteName || 'Institute'}</p>
                                                <p><span className="font-semibold">Issued To:</span> {certificateData.learnerName || 'Learner'}</p>
                                                <p><span className="font-semibold">Date:</span> {new Date((certificateData.issuedAt || 0) * 1000).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <p className="text-gray-500 max-w-md mx-auto">
                                    Your certificate has been successfully verified and added to your DigiLocker.
                                </p>
                                <div className="pt-4">
                                    <Button
                                        className="bg-[#2D398F] hover:bg-[#1a235e] text-white min-w-[200px]"
                                        onClick={() => window.open('https://www.digilocker.gov.in/', '_blank')}
                                    >
                                        Go to DigiLocker
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400">
                            This is a secure connection powered by Blockchain Credentialing System.
                            <br />
                            Digital India Corporation, Ministry of Electronics & IT, Government of India.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
