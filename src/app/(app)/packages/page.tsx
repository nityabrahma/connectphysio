
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import type { PackageDef, PackageSale, Patient } from "@/types/domain";
import { usePatients } from "@/hooks/use-patients";
import { useToast } from "@/hooks/use-toast";
import { generateId } from "@/lib/ids";
import { format, isBefore } from "date-fns";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle } from "lucide-react";
import { PackageForm } from "./package-form";

export default function PackagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { patients } = usePatients();
  const [packages, setPackages] = useLocalStorage<PackageDef[]>(LS_KEYS.PACKAGES, []);
  const [packageSales, setPackageSales] = useLocalStorage<PackageSale[]>(LS_KEYS.PACKAGE_SALES, []);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageDef | null>(null);

  const centrePackages = packages.filter(p => p.centreId === user?.centreId);
  const centrePackageSales = packageSales.filter(p => p.centreId === user?.centreId);

  const handleAddClick = () => {
    setSelectedPackage(null);
    setIsFormOpen(true);
  };
  
  const handleEditClick = (pkg: PackageDef) => {
    setSelectedPackage(pkg);
    setIsFormOpen(true);
  }

  const handleFormSubmit = (values: Omit<PackageDef, 'id'>) => {
    if (selectedPackage) {
      setPackages(packages.map(p => p.id === selectedPackage.id ? { ...p, ...values } : p));
      toast({ title: "Package updated" });
    } else {
      const newPackage: PackageDef = {
        ...values,
        id: generateId(),
      };
      setPackages([...packages, newPackage]);
      toast({ title: "Package created" });
    }
    setIsFormOpen(false);
  };
  
  const handleDelete = (packageId: string) => {
    setPackages(packages.filter(p => p.id !== packageId));
    toast({ title: "Package deleted", variant: "destructive" });
    setIsFormOpen(false);
  }

  const getStatusBadge = (sale: PackageSale) => {
    const isExpired = sale.expiryDate ? isBefore(new Date(sale.expiryDate), new Date()) : false;
    if (isExpired && sale.status !== 'expired') {
        setPackageSales(sales => sales.map(s => s.id === sale.id ? {...s, status: 'expired'} : s))
    }
    if (sale.sessionsUsed >= sale.sessionsTotal && sale.status !== 'completed') {
        setPackageSales(sales => sales.map(s => s.id === sale.id ? {...s, status: 'completed'} : s))
    }
    
    switch(sale.status) {
        case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
        case 'completed': return <Badge variant="secondary">Completed</Badge>;
        case 'expired': return <Badge variant="destructive">Expired</Badge>;
        default: return <Badge variant="outline">{sale.status}</Badge>;
    }
  }

  const getPatientName = (patientId: string) => {
    return patients.find(p => p.id === patientId)?.name || "Unknown Patient";
  }

  const getPackageName = (packageId: string) => {
    return packages.find(p => p.id === packageId)?.name || "Unknown Package";
  }
  
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Therapy Packages</h1>
        <p className="text-muted-foreground">Manage and sell therapy packages to patients.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Available Packages</CardTitle>
            <CardDescription>Packages available for your centre.</CardDescription>
          </div>
          {isAdmin && <Button onClick={handleAddClick}><PlusCircle/>New Package</Button>}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package Name</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {centrePackages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.sessions}</TableCell>
                  <TableCell>{pkg.durationDays} days</TableCell>
                  <TableCell>${pkg.price}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(pkg)}>
                        Edit
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Package Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Sessions Remaining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {centrePackageSales.length > 0 ? centrePackageSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{getPatientName(sale.patientId)}</TableCell>
                  <TableCell>{getPackageName(sale.packageId)}</TableCell>
                  <TableCell>{sale.sessionsTotal - sale.sessionsUsed}</TableCell>
                  <TableCell>{getStatusBadge(sale)}</TableCell>
                  <TableCell>{sale.expiryDate ? format(new Date(sale.expiryDate), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">No package sales yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {isAdmin && (
        <PackageForm
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleFormSubmit}
          onDelete={handleDelete}
          pkg={selectedPackage}
        />
      )}
    </div>
  );
}
