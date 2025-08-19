
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import type { PackageDef, PackageSale, Patient } from "@/types/domain";
import { usePatients } from "@/hooks/use-patients";
import { useToast } from "@/hooks/use-toast";
import { generateId } from "@/lib/ids";
import { addDays, format, isBefore } from "date-fns";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function PackagesPage() {
  const { toast } = useToast();
  const { patients } = usePatients();
  const [packages] = useLocalStorage<PackageDef[]>(LS_KEYS.PACKAGES, []);
  const [packageSales, setPackageSales] = useLocalStorage<PackageSale[]>(LS_KEYS.PACKAGE_SALES, []);
  
  const [selectedPackage, setSelectedPackage] = useState<PackageDef | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  const handleSellClick = (pkg: PackageDef) => {
    setSelectedPatientId("");
    setSelectedPackage(pkg);
  };

  const handleConfirmSale = () => {
    if (!selectedPackage || !selectedPatientId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a patient.",
      });
      return;
    }

    const newSale: PackageSale = {
      id: generateId(),
      patientId: selectedPatientId,
      packageId: selectedPackage.id,
      startDate: new Date().toISOString(),
      expiryDate: addDays(new Date(), selectedPackage.durationDays).toISOString(),
      sessionsTotal: selectedPackage.sessions,
      sessionsUsed: 0,
      status: "active",
    };

    setPackageSales([...packageSales, newSale]);
    toast({
      title: "Package Sold",
      description: `${selectedPackage.name} sold to ${patients.find(p => p.id === selectedPatientId)?.name}.`,
    });
    setSelectedPackage(null);
  };
  
  const getStatusBadge = (sale: PackageSale) => {
    const isExpired = sale.expiryDate ? isBefore(new Date(sale.expiryDate), new Date()) : false;
    if (isExpired) {
        if(sale.status !== 'expired') {
            setPackageSales(sales => sales.map(s => s.id === sale.id ? {...s, status: 'expired'} : s))
        }
        return <Badge variant="destructive">Expired</Badge>;
    }

    if (sale.sessionsUsed >= sale.sessionsTotal) {
        if(sale.status !== 'completed') {
            setPackageSales(sales => sales.map(s => s.id === sale.id ? {...s, status: 'completed'} : s))
        }
        return <Badge variant="secondary">Completed</Badge>;
    }
    
    if (sale.expiryDate) {
        const daysRemaining = Math.round((new Date(sale.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysRemaining <= 7) return <Badge className="bg-orange-100 text-orange-800">Expiring Soon</Badge>;
    }


    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  }

  const getPatientName = (patientId: string) => {
    return patients.find(p => p.id === patientId)?.name || "Unknown Patient";
  }

  const getPackageName = (packageId: string) => {
    return packages.find(p => p.id === packageId)?.name || "Unknown Package";
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Therapy Packages</h1>
        <p className="text-muted-foreground">Manage and sell therapy packages to patients.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.durationDays} days</TableCell>
                  <TableCell>${pkg.price}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="link" className="p-0 h-auto" onClick={() => handleSellClick(pkg)}>
                      Sell
                    </Button>
                  </TableCell>
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
              {packageSales.length > 0 ? packageSales.map((sale) => (
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
      
      {selectedPackage && (
        <AlertDialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Sell '{selectedPackage.name}'</AlertDialogTitle>
                <AlertDialogDescription>
                    Select a patient to assign this package to. This action will create a new package sale record.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Label htmlFor="patient-select">Patient</Label>
                   <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                        <SelectTrigger id="patient-select">
                            <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                        <SelectContent>
                            {patients.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedPackage(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmSale} disabled={!selectedPatientId}>
                    Confirm Sale
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
