
"use client";

import { useRealtimeDb } from "@/hooks/use-realtime-db";
import type { Patient, Session, TreatmentPlan, Therapist } from "@/types/domain";
import { useParams } from "next/navigation";
import { usePatients } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

// A4 size in pixels at 96 DPI: 794px x 1123px
const A4_WIDTH = "210mm";
const A4_HEIGHT = "297mm";

export default function PrintPrescriptionPage() {
  const params = useParams();
  const patientId = params.id as string;
  const { user } = useAuth();
  const { getPatient } = usePatients();
  const patient = getPatient(patientId);

  const [sessions] = useRealtimeDb<Record<string, Session>>("sessions", {});
  const [treatmentPlans] = useRealtimeDb<Record<string, TreatmentPlan>>("treatmentPlans", {});
  const [therapists] = useRealtimeDb<Record<string, Therapist>>("therapists", {});

  const activeTreatmentPlan = useMemo(() => {
    const plans = Object.values(treatmentPlans).filter(
      (tp) => tp.patientId === patientId
    );
    return plans.find((p) => p.isActive) || plans[0] || null;
  }, [treatmentPlans, patientId]);

  const latestTreatment = useMemo(() => {
    if (
      !activeTreatmentPlan ||
      !activeTreatmentPlan.treatments ||
      activeTreatmentPlan.treatments.length === 0
    ) {
      return null;
    }
    return activeTreatmentPlan.treatments[0];
  }, [activeTreatmentPlan]);
  
  const patientSessions = useMemo(() => {
    if (!activeTreatmentPlan) return [];
    return Object.values(sessions)
      .filter(s => s.treatmentPlanId === activeTreatmentPlan.id && s.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, activeTreatmentPlan]);

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-8 bg-gray-50">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Patient not found
        </h2>
        <Button asChild>
          <Link href="/patients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-end mb-4 print:hidden">
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print Prescription
        </Button>
      </div>

      {/* A4 Container */}
      <div
        className="bg-white shadow-lg p-12 text-black"
        style={{ width: A4_WIDTH, minHeight: A4_HEIGHT }}
      >
        <header className="flex justify-between items-start border-b-2 border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.centreName}
            </h1>
            <p className="text-gray-600">Physiotherapy & Rehabilitation</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-semibold text-gray-800">
              Prescription
            </h2>
            <p className="text-gray-600">
              Date: {format(new Date(), "MMM d, yyyy")}
            </p>
          </div>
        </header>

        <section className="mt-8">
          <h3 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
            Patient Details
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <strong>Name:</strong> {patient.name}
            </div>
            <div>
              <strong>Age:</strong> {patient.age || "N/A"}
            </div>
            <div>
              <strong>Gender:</strong> {patient.gender || "N/A"}
            </div>
            <div>
              <strong>Phone:</strong> {patient.phone}
            </div>
            <div className="col-span-2">
              <strong>Address:</strong> {patient.address || "N/A"}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
            Clinical Information
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-700">Medical History:</h4>
              <p className="pl-4 text-gray-600 whitespace-pre-wrap">
                {patient.pastMedicalHistory || "None provided."}
              </p>
            </div>
             {activeTreatmentPlan && (
                <>
                    <div>
                        <h4 className="font-semibold text-gray-700">Chief Complaint:</h4>
                        <p className="pl-4 text-gray-600 whitespace-pre-wrap">{activeTreatmentPlan.history || "Not recorded."}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700">Examination Findings:</h4>
                        <p className="pl-4 text-gray-600 whitespace-pre-wrap">{activeTreatmentPlan.examination || "Not recorded."}</p>
                    </div>
                </>
             )}
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
            Treatment Protocol
          </h3>
           {latestTreatment ? (
                <div className="text-sm">
                    <ul className="list-disc pl-8 space-y-1">
                        {latestTreatment.treatments.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                </div>
            ) : (
                <p className="text-sm text-gray-500">No specific treatment protocol defined yet.</p>
            )}
        </section>

        <section className="mt-8">
            <h3 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">Session Summary</h3>
            {patientSessions.length > 0 ? (
                 <table className="w-full text-sm text-left">
                    <thead className="border-b">
                        <tr>
                            <th className="py-2">Date</th>
                            <th className="py-2">Therapist</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patientSessions.slice(0, 5).map(session => (
                            <tr key={session.id} className="border-b">
                                <td className="py-2">{format(new Date(session.date), "MMM d, yyyy")}</td>
                                <td className="py-2">{therapists[session.therapistId]?.name || 'Unknown'}</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            ) : (
                <p className="text-sm text-gray-500">No completed sessions for this treatment plan yet.</p>
            )}
        </section>

        <footer className="mt-16 pt-8 border-t-2 border-gray-800 text-right">
            <div className="text-lg font-bold">Signature</div>
        </footer>
      </div>
    </div>
  );
}
