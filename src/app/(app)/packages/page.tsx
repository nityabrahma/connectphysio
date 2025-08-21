
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LS_KEYS } from "@/lib/constants";
import type { PackageDef } from "@/types/domain";
import { useToast } from "@/hooks/use-toast";
import { generateId } from "@/lib/ids";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle } from "lucide-react";
import { PackageForm } from "./package-form";

export default function PackagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useLocalStorage<PackageDef[]>(LS_KEYS.PACKAGES, []);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageDef | null>(null);

  const centrePackages = packages.filter(p => p.centreId === user?.centreId);

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
              {centrePackages.length > 0 ? centrePackages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell>{pkg.sessions}</TableCell>
                  <TableCell>{pkg.durationDays} days</TableCell>
                  <TableCell>₹{pkg.price}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(pkg)}>
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
