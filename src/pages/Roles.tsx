import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { WalletConnection } from "@/components/WalletConnection";
import { useToast } from "@/hooks/use-toast";
import { useBlockchain } from "@/contexts/BlockchainContext";
import blockchainService from "@/lib/blockchain";

export default function Roles() {
  const { toast } = useToast();
  const { isConnected, isAuthorized, userRole } = useBlockchain();
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [showAddInstitute, setShowAddInstitute] = useState(false);
  
  // Form states
  const [instituteForm, setInstituteForm] = useState({ name: "", wallet: "" });

  const [institutions, setInstitutions] = useState([]);
  const [isFetchingInstitutes, setIsFetchingInstitutes] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Fetch institutes from blockchain
  const fetchInstitutes = async (forceRefresh = false) => {
    // Cache for 30 seconds to avoid unnecessary refetches
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime < 30000 && institutions.length > 0) {
      console.log('Using cached institutes data');
      return;
    }

    setIsFetchingInstitutes(true);
    try {
      console.log('Fetching institutes from blockchain...');
      const result = await blockchainService.getAllInstitutes();
      console.log('Fetch result:', result);
      
      if (result.success && result.institutes) {
        const formattedInstitutes = result.institutes.map(inst => ({
          id: inst.id,
          name: inst.name,
          wallet: blockchainService.formatAddress(inst.wallet),
          status: inst.active ? "active" : "inactive",
          uniqueId: inst.uniqueId,
        }));
        console.log('Formatted institutes:', formattedInstitutes);
        setInstitutions(formattedInstitutes);
        setLastFetchTime(now);
      } else {
        console.log('No institutes found or error:', result.error);
        setInstitutions([]);
      }
    } catch (error) {
      console.error('Error fetching institutes:', error);
      setInstitutions([]);
    } finally {
      setIsFetchingInstitutes(false);
    }
  };

  // Fetch institutes on component mount
  useEffect(() => {
    if (isConnected && isAuthorized) {
      fetchInstitutes();
    }
  }, [isConnected, isAuthorized]);

  // Blockchain functions
  const handleAddInstitute = async () => {
    if (!instituteForm.name || !instituteForm.wallet) {
      toast({
        title: "Missing Information",
        description: "Please fill in both institute name and wallet address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await blockchainService.addInstitute(instituteForm.name, instituteForm.wallet);
      
      if (result.success) {
        toast({
          title: "Institute Added Successfully! 🎉",
          description: `${instituteForm.name} has been registered on the blockchain`,
        });
        
        // Refresh institutes list from blockchain to get the actual ID
        await fetchInstitutes(true);
        
        setInstituteForm({ name: "", wallet: "" });
        setShowAddInstitute(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Failed to Add Institute",
        description: error.message || "An error occurred while adding the institute",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleRevokeInstitute = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await blockchainService.revokeInstitute(parseInt(id));
      
      if (result.success) {
        toast({
          title: "Institute Revoked",
          description: "Institute access has been revoked",
        });
        
        // Refresh institutes list from blockchain
        await fetchInstitutes(true);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Failed to Revoke Institute",
        description: error.message || "An error occurred while revoking the institute",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user can manage roles (admin only)
  const canManageRoles = isAuthorized && userRole === 'admin';

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Role Management</h1>
            <p className="text-muted-foreground mb-8">Please connect your wallet to manage roles</p>
            <WalletConnection />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-8">You don't have permission to access this page</p>
            <WalletConnection />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
              Role Management
            </h1>
          </div>

          {/* Wallet Connection */}
          <div className="mb-8">
            <WalletConnection />
          </div>

          {/* Institutions Section */}
          <Card className="shadow-card bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-2xl">Institutions</CardTitle>
                  <CardDescription>Manage registered educational institutions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fetchInstitutes(true)}
                    disabled={isFetchingInstitutes}
                    className="gap-2"
                  >
                    {isFetchingInstitutes ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Building2 className="h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                  <Dialog open={showAddInstitute} onOpenChange={setShowAddInstitute}>
                  <DialogTrigger asChild>
                    <Button variant="neon" className="gap-2" disabled={!canManageRoles}>
                      <Plus className="h-4 w-4" />
                      Add Institution
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Institution</DialogTitle>
                      <DialogDescription>
                        Register a new educational institution on the blockchain
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="instituteName">Institution Name</Label>
                        <Input
                          id="instituteName"
                          placeholder="e.g., ISM Dhanbad"
                          value={instituteForm.name}
                          onChange={(e) => setInstituteForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instituteWallet">Wallet Address</Label>
                        <Input
                          id="instituteWallet"
                          placeholder="0x..."
                          value={instituteForm.wallet}
                          onChange={(e) => setInstituteForm(prev => ({ ...prev, wallet: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowAddInstitute(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAddInstitute} 
                          disabled={isLoading}
                          className="flex-1"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Adding...
                            </>
                          ) : (
                            'Add Institution'
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-secondary/50">
                    <TableRow>
                      <TableHead>S.No</TableHead>
                      <TableHead>Institute ID</TableHead>
                      <TableHead>Institution Name</TableHead>
                      <TableHead>Wallet Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isFetchingInstitutes ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center gap-4">
                            <div className="relative">
                              <Loader2 className="h-8 w-8 animate-spin text-accent" />
                              <div className="absolute inset-0 rounded-full border-2 border-accent/20"></div>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-medium">Loading institutes...</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Fetching data from blockchain
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : institutions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Building2 className="h-8 w-8 opacity-50" />
                            <p>No institutes found</p>
                            <p className="text-sm">Add your first institute to get started</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      institutions.map((inst, index) => (
                        <TableRow key={inst.id} className="hover:bg-secondary/20">
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-mono text-sm font-bold text-accent">{inst.uniqueId}</TableCell>
                          <TableCell className="font-medium">{inst.name}</TableCell>
                          <TableCell className="font-mono text-sm">{inst.wallet}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={inst.status === "active" ? "default" : "secondary"}
                              className={inst.status === "active" ? "bg-accent/10 text-accent border-accent/20" : ""}
                            >
                              {inst.status === "active" ? (
                                <ShieldCheck className="h-3 w-3 mr-1" />
                              ) : (
                                <ShieldOff className="h-3 w-3 mr-1" />
                              )}
                              {inst.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:text-destructive"
                              onClick={() => handleRevokeInstitute(inst.id)}
                              disabled={!canManageRoles || isLoading || inst.status === "inactive"}
                            >
                              {inst.status === "inactive" ? "Revoked" : "Revoke"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>

      <Footer />
    </div>
  );
}