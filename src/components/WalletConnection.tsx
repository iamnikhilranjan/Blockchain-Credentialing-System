import { useEffect } from 'react';
import { ConnectButton } from 'thirdweb/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useBlockchain } from '@/contexts/BlockchainContext';
import { thirdwebClient, wallets, customTheme } from '@/lib/thirdweb';
import { useActiveAccount } from 'thirdweb/react';

interface WalletConnectionProps {
  showDetails?: boolean;
  className?: string;
}

export function WalletConnection({ showDetails = true, className = "" }: WalletConnectionProps) {
  const {
    isConnected,
    isAuthorized,
    address,
    userRole,
    connectWallet,
    disconnect
  } = useBlockchain();

  // Get the active account from Thirdweb
  const activeAccount = useActiveAccount();

  const getRoleDisplay = (role: string | null) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator', variant: 'default' as const, color: 'bg-purple-500/10 text-purple-400 border-purple-400/20' };
      case 'institute':
        return { label: 'Institute', variant: 'default' as const, color: 'bg-blue-500/10 text-blue-400 border-blue-400/20' };
      case 'staff':
        return { label: 'Staff Member', variant: 'default' as const, color: 'bg-green-500/10 text-green-400 border-green-400/20' };
      case 'learner':
        return { label: 'Learner', variant: 'default' as const, color: 'bg-yellow-500/10 text-yellow-400 border-yellow-400/20' };
      default:
        return { label: 'Unauthorized', variant: 'destructive' as const, color: 'bg-red-500/10 text-red-400 border-red-400/20' };
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Sync Thirdweb connection with blockchain context
  useEffect(() => {
    if (activeAccount?.address && !isConnected) {
      // Thirdweb connected but blockchain context not connected yet
      connectWallet();
    } else if (!activeAccount && isConnected) {
      // Thirdweb disconnected but blockchain context still connected
      disconnect();
    }
  }, [activeAccount, isConnected]);

  if (!showDetails && !isConnected) {
    return (
      <div className={className}>
        <ConnectButton client={thirdwebClient} wallets={wallets} theme={customTheme} />
      </div>
    );
  }

  if (!showDetails && isConnected) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="default" className="gap-1 px-3 py-1">
          <CheckCircle className="h-3 w-3" />
          {formatAddress(address!)}
        </Badge>
        <ConnectButton client={thirdwebClient} wallets={wallets} theme={customTheme} />
      </div>
    );
  }

  return (
    <Card className={`shadow-card bg-card/50 backdrop-blur-sm border-border/50 ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold">Wallet Status</h3>
            {isConnected && (
              <div className="scale-90">
                <ConnectButton client={thirdwebClient} wallets={wallets} />
              </div>
            )}
          </div>

          {!isConnected ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="text-muted-foreground mb-4">
                  Connect your wallet to access blockchain features
                </p>
                <div className="flex justify-center">
                  <ConnectButton client={thirdwebClient} wallets={wallets} theme={customTheme} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {formatAddress(address!)}
                </Badge>
              </div>

              {/* Authorization Status */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {isAuthorized ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className="text-sm font-medium">
                    {isAuthorized ? 'Authorized' : 'Unauthorized'}
                  </span>
                </div>
                {userRole && (
                  <Badge
                    variant={getRoleDisplay(userRole).variant}
                    className={getRoleDisplay(userRole).color}
                  >
                    {getRoleDisplay(userRole).label}
                  </Badge>
                )}
              </div>

              {/* Warning for unauthorized users */}
              {!isAuthorized && (
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-400 mb-1">Limited Access</p>
                    <p className="text-yellow-400/80">
                      Your wallet is not registered for issuing or managing certificates.
                      Contact an administrator to get access.
                    </p>
                  </div>
                </div>
              )}

              {/* Role-specific information */}
              {isAuthorized && userRole && (
                <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                  <div className="text-sm">
                    <p className="font-medium text-accent mb-1">Access Level: {getRoleDisplay(userRole).label}</p>
                    <p className="text-muted-foreground">
                      {userRole === 'institute' && 'You can manage staff, learners, and certificate templates.'}
                      {userRole === 'staff' && 'You can issue and revoke certificates for registered learners.'}
                      {userRole === 'learner' && 'You can view and share your certificates.'}
                      {userRole === 'admin' && 'You have full administrative access to the system.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
