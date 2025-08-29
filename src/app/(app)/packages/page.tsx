
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import type { PackageDef, TreatmentDef } from "@/types/domain";
import { useToast } from "@/hooks/use-toast";
import { generateId } from "@/lib/ids";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle } from "lucide-react";
import { PackageForm } from "./package-form";
import { TreatmentForm } from "./treatment-form";


export default function PackagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useLocalStorage<PackageDef[]>(LS_KEYS.PACKAGES, []);
  const [treatments, setTreatments] = useLocalStorage<TreatmentDef[]>(LS_KEYS.TREATMENT_DEFS, []);
  
  const [isPackageFormOpen, setIsPackageFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageDef | null>(null);

  const [isTreatmentFormOpen, setIsTreatmentFormOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentDef | null>(null);

  const centrePackages = packages.filter(p => p.centreId === user?.centreId);
  const centreTreatments = treatments.filter(t => t.centreId === user?.centreId);

  // Package Handlers
  const handleAddPackageClick = () => {
    setSelectedPackage(null);
    setIsPackageFormOpen(true);
  };
  
  const handleEditPackageClick = (pkg: PackageDef) => {
    setSelectedPackage(pkg);
    setIsPackageFormOpen(true);
  }

  const handlePackageFormSubmit = (values: Omit<PackageDef, 'id'>) => {
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
    setIsPackageFormOpen(false);
  };
  
  const handleDeletePackage = (packageId: string) => {
    setPackages(packages.filter(p => p.id !== packageId));
    toast({ title: "Package deleted", variant: "destructive" });
    setIsPackageFormOpen(false);
  }

  // Treatment Handlers
  const handleAddTreatmentClick = () => {
    setSelectedTreatment(null);
    setIsTreatmentFormOpen(true);
  };

  const handleEditTreatmentClick = (treatment: TreatmentDef) => {
    setSelectedTreatment(treatment);
    setIsTreatmentFormOpen(true);
  };

  const handleTreatmentFormSubmit = (values: Omit<TreatmentDef, 'id'>) => {
    if (selectedTreatment) {
        setTreatments(treatments.map(t => t.id === selectedTreatment.id ? { ...selectedTreatment, ...values } : t));
        toast({ title: "Treatment updated" });
    } else {
        const newTreatment: TreatmentDef = { ...values, id: generateId() };
        setTreatments([...treatments, newTreatment]);
        toast({ title: "Treatment created" });
    }
    setIsTreatmentFormOpen(false);
  };

  const handleDeleteTreatment = (treatmentId: string) => {
      setTreatments(treatments.filter(t => t.id !== treatmentId));
      toast({ title: "Treatment deleted", variant: "destructive" });
      setIsTreatmentFormOpen(false);
  };
  
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Packages & Treatments</h1>
        <p className="text-muted-foreground">Manage therapy packages and billable treatment types.</p>
      </div>
      
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Available Packages</CardTitle>
              <CardDescription>Discount packages available for your centre.</CardDescription>
            </div>
            {isAdmin && <Button onClick={handleAddPackageClick}><PlusCircle/>New Package</Button>}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package Name</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Discount</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {centrePackages.length > 0 ? centrePackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>{pkg.sessions}</TableCell>
                    <TableCell>{pkg.durationDays} days</TableCell>
                    <TableCell>{pkg.discountPercentage}%</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleEditPackageClick(pkg)}>
                          Edit
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )) : (
                  <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                          No packages created yet.
                      </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Billable Treatments</CardTitle>
              <CardDescription>Standard treatments and their prices.</CardDescription>
            </div>
            {isAdmin && <Button onClick={handleAddTreatmentClick}><PlusCircle/>New Treatment</Button>}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Treatment Name</TableHead>
                  <TableHead>Price (₹)</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {centreTreatments.length > 0 ? centreTreatments.map((treatment) => (
                  <TableRow key={treatment.id}>
                    <TableCell className="font-medium">{treatment.name}</TableCell>
                    <TableCell>{treatment.price}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleEditTreatmentClick(treatment)}>
                          Edit
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No treatments defined yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {isAdmin && (
        <>
          <PackageForm
            isOpen={isPackageFormOpen}
            onOpenChange={setIsPackageFormOpen}
            onSubmit={handlePackageFormSubmit}
            onDelete={handleDeletePackage}
            pkg={selectedPackage}
          />
          <TreatmentForm
            isOpen={isTreatmentFormOpen}
            onOpenChange={setIsTreatmentFormOpen}
            onSubmit={handleTreatmentFormSubmit}
            onDelete={handleDeleteTreatment}
            treatment={selectedTreatment}
           />
        </>
      )}
    </div>
  );
}
