'use client';

import { usePatients } from "@/hooks/use-patients";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function PatientsPage() {
    const { patients } = usePatients();

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
                <Link href="/patients/new">
                    <Button>
                        <PlusCircle />
                        Add New Patient
                    </Button>
                </Link>
            </div>
            
            <DataTable columns={columns} data={patients} />
        </div>
    );
}
