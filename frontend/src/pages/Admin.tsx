import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Plus, Building2, Trash2, Edit, CheckCircle, XCircle, Shield, Users, BarChart3 } from "lucide-react";

interface Institution {
  id: string;
  name: string;
  walletAddress: string;
  status: "Active" | "Blocked";
  dateAdded: string;
  certificatesIssued: number;
}

const Admin = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([
    {
      id: "1",
      name: "XYZ Technical Institute",
      walletAddress: "0x742d35Cc6634C0532925a3b8D598A0c5df4b6de8",
      status: "Active",
      dateAdded: "2025-01-15",
      certificatesIssued: 2847
    },
    {
      id: "2", 
      name: "ABC Skill Development Center",
      walletAddress: "0x892f41B4C8f4321a9be9A8D5e6F3c7D8E9F0A1B2",
      status: "Active",
      dateAdded: "2025-02-01",
      certificatesIssued: 1523
    },
    {
      id: "3",
      name: "DEF Vocational Training",
      walletAddress: "0x123a45B6C7d8E9f0A1b2C3d4E5f6G7h8I9j0K1l2",
      status: "Blocked",
      dateAdded: "2024-12-20",
      certificatesIssued: 456
    }
  ]);

  const [newInstitution, setNewInstitution] = useState({
    name: "",
    walletAddress: ""
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddInstitution = () => {
    if (!newInstitution.name || !newInstitution.walletAddress) return;

    const institution: Institution = {
      id: Date.now().toString(),
      name: newInstitution.name,
      walletAddress: newInstitution.walletAddress,
      status: "Active",
      dateAdded: new Date().toISOString().split('T')[0],
      certificatesIssued: 0
    };

    setInstitutions([...institutions, institution]);
    setNewInstitution({ name: "", walletAddress: "" });
    setIsAddDialogOpen(false);
  };

  const toggleInstitutionStatus = (id: string) => {
    setInstitutions(institutions.map(inst => 
      inst.id === id 
        ? { ...inst, status: inst.status === "Active" ? "Blocked" : "Active" }
        : inst
    ));
  };

  const removeInstitution = (id: string) => {
    setInstitutions(institutions.filter(inst => inst.id !== id));
  };

  const totalCertificates = institutions.reduce((sum, inst) => sum + inst.certificatesIssued, 0);
  const activeInstitutions = institutions.filter(inst => inst.status === "Active").length;

  return (
    <div className="min-h-screen bg-secondary/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage NCVET-approved institutions and monitor certificate issuance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Institutions</p>
                  <p className="text-3xl font-bold text-foreground">{activeInstitutions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Institutions</p>
                  <p className="text-3xl font-bold text-foreground">{institutions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Certificates Issued</p>
                  <p className="text-3xl font-bold text-foreground">{totalCertificates.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Institution Management */}
        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-primary">
                <Settings className="h-6 w-6" />
                <span>Institution Management</span>
              </CardTitle>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent hover:bg-accent-glow text-accent-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Institution
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Add New Institution</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="institutionName">Institution Name</Label>
                      <Input
                        id="institutionName"
                        placeholder="Enter institution name"
                        value={newInstitution.name}
                        onChange={(e) => setNewInstitution({...newInstitution, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="walletAddress">Wallet Public Key</Label>
                      <Input
                        id="walletAddress"
                        placeholder="0x..."
                        value={newInstitution.walletAddress}
                        onChange={(e) => setNewInstitution({...newInstitution, walletAddress: e.target.value})}
                      />
                    </div>
                    <Button 
                      onClick={handleAddInstitution}
                      disabled={!newInstitution.name || !newInstitution.walletAddress}
                      className="w-full bg-primary hover:bg-primary-glow text-primary-foreground"
                    >
                      Add Institution
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Institution Name</TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Certificates</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {institutions.map((institution) => (
                    <TableRow key={institution.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span>{institution.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {institution.walletAddress.slice(0, 10)}...{institution.walletAddress.slice(-8)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={institution.status === "Active" ? "default" : "destructive"}
                          className="flex items-center space-x-1 w-fit"
                        >
                          {institution.status === "Active" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          <span>{institution.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{institution.dateAdded}</TableCell>
                      <TableCell>{institution.certificatesIssued.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleInstitutionStatus(institution.id)}
                            className={institution.status === "Active" ? "text-destructive border-destructive" : "text-accent border-accent"}
                          >
                            {institution.status === "Active" ? "Block" : "Activate"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeInstitution(institution.id)}
                            className="text-destructive border-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="mt-8 bg-accent/5 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Security & Compliance</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Only institutions with registered wallet addresses can issue certificates. All certificate 
                  issuance activities are recorded on the blockchain for transparency and auditability.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Wallet addresses are verified before registration</li>
                  <li>• All transactions are recorded on the blockchain</li>
                  <li>• Institutions can be blocked/unblocked instantly</li>
                  <li>• Audit logs are maintained for compliance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;