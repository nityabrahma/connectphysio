
"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import type { Patient, Bill } from "@/types/domain";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { createPortal } from "react-dom";

// A4 size in pixels at 96 DPI: 794px x 1123px
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

interface PrintableBillProps {
  patient: Patient;
  bill: Bill;
}

export const PrintableBill = forwardRef(
  function PrintableBill({ patient, bill }: PrintableBillProps, ref) {
    const { user } = useAuth();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);

    const formatCurrency = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
            setIframeBody(iframe.contentWindow.document.body);
        }
    }, []);

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
                body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
                .grid { display: grid; }
                .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                .col-span-2 { grid-column: span 2 / span 2; }
                .gap-x-8 { column-gap: 2rem; }
                .gap-y-2 { row-gap: 0.5rem; }
                .gap-4 { gap: 1rem; }
                .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
                .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
                .font-semibold { font-weight: 600; }
                .font-bold { font-weight: 700; }
                .border-b { border-bottom-width: 1px; }
                .border-gray-300 { border-color: #D1D5DB; }
                .pb-2 { padding-bottom: 0.5rem; }
                .mb-4 { margin-bottom: 1rem; }
                .mt-8 { margin-top: 2rem; }
                .mt-16 { margin-top: 4rem; }
                .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
                .text-gray-600 { color: #4B5563; }
                .text-muted-foreground { color: #6b7280; }
                .w-full { width: 100%; }
                .text-left { text-align: left; }
                .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
                .pt-8 { padding-top: 2rem; }
                .border-t-2 { border-top-width: 2px; }
                .border-gray-800 { border-color: #1F2937; }
                .text-right { text-align: right; }
                header { display: flex; justify-content: space-between; align-items: flex-start; }
                .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
                .text-gray-900 { color: #111827; }
                .text-2xl { font-size: 1.5rem; line-height: 2rem; }
                .text-gray-800 { color: #1F2937; }
                .font-medium { font-weight: 500; }
                .capitalize { text-transform: capitalize; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 0.75rem 0; }
                thead tr { border-bottom: 1px solid #D1D5DB; }
                tbody tr { border-bottom: 1px solid #e5e7eb; }
                .text-destructive { color: #ef4444; }
                .divider { border-top: 1px solid #e5e7eb; margin: 2rem 0; }
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
                Invoice
              </h2>
              <p className="text-gray-600">
                <strong>Bill #:</strong> {bill.billNumber}
              </p>
            </div>
          </header>

          <section className="mt-8">
            <h3 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
              Patient Details
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div><strong>Name:</strong> {patient.name}</div>
                <div><strong>Age:</strong> {patient.age || "N/A"}</div>
                <div><strong>Gender:</strong> <span className="capitalize">{patient.gender || "N/A"}</span></div>
                <div><strong>Phone:</strong> {patient.phone}</div>
                {patient.address && <div className="col-span-2"><strong>Address:</strong> {patient.address}</div>}
            </div>
          </section>
          
           <div className="divider"></div>
          
          <section>
             <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground">Bill Date</p>
                    <p className="font-medium">{format(new Date(bill.createdAt), "PPP")}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Session Date</p>
                    <p className="font-medium">{bill.sessionDate ? format(new Date(bill.sessionDate), "PPP") : 'N/A'}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-semibold capitalize">{bill.status}</p>
                </div>
             </div>
          </section>

           <div className="divider"></div>

            <section>
                <h3 className="text-lg font-semibold border-b border-gray-300 pb-2 mb-4">
                    Billable Items
                </h3>
                 <table>
                    <thead>
                        <tr>
                            <th className="text-left font-semibold">Treatment</th>
                            <th className="text-right font-semibold">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.treatments.map((treatment) => (
                        <tr key={treatment.treatmentDefId}>
                            <td className="font-medium">{treatment.name}</td>
                            <td className="text-right">{formatCurrency(treatment.price)}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            
            <div className="divider"></div>

            <section>
                <div style={{ width: '50%', marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted-foreground">Subtotal per session</span>
                        <span>{formatCurrency(bill.treatments.reduce((sum, t) => sum + t.price, 0))}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted-foreground">Number of Sessions</span>
                        <span>x {bill.numberOfSessions}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="font-semibold">Total Before Discount</span>
                        <span className="font-semibold">{formatCurrency(bill.subtotal)}</span>
                    </div>
                    {bill.discount && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-muted-foreground">Discount ({bill.discount.packageName} - {bill.discount.percentage}%)</span>
                            <span className="text-destructive">- {formatCurrency(bill.discount.amount)}</span>
                        </div>
                    )}
                    <div className="divider" style={{margin: '0.5rem 0'}}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 700 }}>
                        <span>Grand Total</span>
                        <span>{formatCurrency(bill.grandTotal)}</span>
                    </div>
                </div>
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
        title="Printable Bill"
      >
        {iframeBody && createPortal(printContent, iframeBody)}
      </iframe>
    );
  }
);
