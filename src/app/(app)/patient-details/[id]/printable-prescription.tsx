
"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import type { Patient, Session, Treatment, TreatmentPlan, Therapist } from "@/types/domain";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useRealtimeDb } from "@/hooks/use-realtime-db";
import { createPortal } from "react-dom";

// A4 size in pixels at 96 DPI: 794px x 1123px
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

interface PrintablePrescriptionProps {
  patient: Patient;
  activeTreatmentPlan: TreatmentPlan;
  latestTreatment: Treatment | null;
}

export const PrintablePrescription = forwardRef(
  function PrintablePrescription({ patient, activeTreatmentPlan, latestTreatment }: PrintablePrescriptionProps, ref) {
    const { user } = useAuth();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);

    const [sessions] = useRealtimeDb<Record<string, Session>>("sessions", {});
    const [therapists] = useRealtimeDb<Record<string, Therapist>>("therapists", {});
    
    // State to hold the props to ensure the iframe content updates
    const [printData, setPrintData] = useState({ patient, activeTreatmentPlan, latestTreatment });

    useEffect(() => {
        setPrintData({ patient, activeTreatmentPlan, latestTreatment });
    }, [patient, activeTreatmentPlan, latestTreatment]);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
            setIframeBody(iframe.contentWindow.document.body);
        }
    }, []);

    const patientSessions = useMemo(() => {
        if (!printData.activeTreatmentPlan) return [];
        return Object.values(sessions)
          .filter(s => s.treatmentPlanId === printData.activeTreatmentPlan.id && s.status === 'completed')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sessions, printData.activeTreatmentPlan]);


    useImperativeHandle(ref, () => ({
      handlePrint() {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.focus();
          iframeRef.current.contentWindow.print();
        }
      },
    }));
    
    const printContent = (
         <div
            id="printable-area"
            className="bg-white p-12 text-black"
            style={{ width: `${A4_WIDTH_PX}px`, minHeight: `${A4_HEIGHT_PX}px` }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                body { font-family: 'Inter', sans-serif; }
                .grid { display: grid; }
                .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                .col-span-2 { grid-column: span 2 / span 2; }
                .gap-x-8 { column-gap: 2rem; }
                .gap-y-2 { row-gap: 0.5rem; }
                .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
                .font-semibold { font-weight: 600; }
                .border-b { border-bottom-width: 1px; }
                .border-gray-300 { border-color: #D1D5DB; }
                .pb-2 { padding-bottom: 0.5rem; }
                .mb-4 { margin-bottom: 1rem; }
                .mt-8 { margin-top: 2rem; }
                .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
                .pl-4 { padding-left: 1rem; }
                .text-gray-600 { color: #4B5563; }
                .whitespace-pre-wrap { white-space: pre-wrap; }
                .list-disc { list-style-type: disc; }
                .pl-8 { padding-left: 2rem; }
                .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
                .w-full { width: 100%; }
                .text-left { text-align: left; }
                .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
                .mt-16 { margin-top: 4rem; }
                .pt-8 { padding-top: 2rem; }
                .border-t-2 { border-top-width: 2px; }
                .border-gray-800 { border-color: #1F2937; }
                .text-right { text-align: right; }
                .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
                .font-bold { font-weight: 700; }
                header { display: flex; justify-content: space-between; align-items: flex-start; }
                .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
                .text-gray-900 { color: #111827; }
                .text-2xl { font-size: 1.5rem; line-height: 2rem; }
                .text-gray-800 { color: #1F2937; }
            `}</style>
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
                <strong>Name:</strong> {printData.patient.name}
              </div>
              <div>
                <strong>Age:</strong> {printData.patient.age || "N/A"}
              </div>
              <div>
                <strong>Gender:</strong> {printData.patient.gender || "N/A"}
              </div>
              <div>
                <strong>Phone:</strong> {printData.patient.phone}
              </div>
              <div className="col-span-2">
                <strong>Address:</strong> {printData.patient.address || "N/A"}
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
                  {printData.patient.pastMedicalHistory || "None provided."}
                </p>
              </div>
              {printData.activeTreatmentPlan && (
                <>
                  <div>
                    <h4 className="font-semibold text-gray-700">Chief Complaint:</h4>
                    <p className="pl-4 text-gray-600 whitespace-pre-wrap">{printData.activeTreatmentPlan.history || "Not recorded."}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Examination Findings:</h4>
                    <p className="pl-4 text-gray-600 whitespace-pre-wrap">{printData.activeTreatmentPlan.examination || "Not recorded."}</p>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
              Treatment Protocol
            </h3>
            {printData.latestTreatment && Array.isArray(printData.latestTreatment.treatments) ? (
              <div className="text-sm">
                <ul className="list-disc pl-8 space-y-1">
                  {printData.latestTreatment.treatments.map((t, i) => <li key={i}>{t}</li>)}
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
    );

    return (
      <iframe
        ref={iframeRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "0",
          height: "0",
          border: "none",
        }}
        title="Printable Prescription"
      >
        {iframeBody && createPortal(printContent, iframeBody)}
      </iframe>
    );
  }
);
