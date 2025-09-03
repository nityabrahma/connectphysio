

'use client';

import { useRealtimeDb } from './use-realtime-db';
import type { Bill } from '@/types/domain';
import { generateId } from '@/lib/ids';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';
import { useMemo } from 'react';

// A simple counter for bill numbers, in a real app this should be managed server-side
// to prevent race conditions and ensure uniqueness across multiple users.
let billCounter = 1; 

export function useBills() {
  const { user: currentUser } = useAuth();
  const [bills, setBills] = useRealtimeDb<Record<string, Bill>>('bills', {});
  const { toast } = useToast();
  
  // This is a client-side approximation for bill numbering.
  // It will restart on page refresh. A robust solution needs a server-side counter.
  useMemo(() => {
    const billCount = Object.keys(bills).length;
    billCounter = billCount > 0 ? billCount + 1 : 1;
  }, [bills]);


  const centreBills = useMemo(() => {
    return Object.values(bills)
        .filter(b => b.centreId === currentUser?.centreId)
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },[bills, currentUser]);

  const addBill = (billData: Omit<Bill, 'id' | 'billNumber' | 'createdAt'>) => {
    const newId = generateId();
    const billNumber = `INV-${new Date().getFullYear()}-${String(billCounter).padStart(4, '0')}`;
    billCounter++;
    
    const newBill: Bill = {
      ...billData,
      id: newId,
      billNumber: billNumber,
      createdAt: new Date().toISOString(),
    };
    setBills({ ...bills, [newId]: newBill });
    toast({
      title: "Bill Generated",
      description: `Bill ${newBill.billNumber} has been successfully created.`
    })
    return newBill;
  };

  const getBill = (id: string) => {
    return bills[id];
  };

  const updateBill = (id: string, updates: Partial<Omit<Bill, 'id' | 'createdAt'>>) => {
    const billToUpdate = bills[id];
    if (billToUpdate) {
        const updatedBill = { ...billToUpdate, ...updates };
        setBills({ ...bills, [id]: updatedBill });
        toast({
            title: "Bill Updated",
            description: `Bill ${updatedBill.billNumber} has been updated.`
        });
    }
  };

  const deleteBill = (id: string) => {
    const billToDelete = bills[id];
    if (billToDelete) {
      const { [id]: _, ...remainingBills } = bills;
      setBills(remainingBills);
      toast({
        title: "Bill Deleted",
        description: `Bill ${billToDelete.billNumber} has been deleted.`,
        variant: "destructive",
      })
    }
  };

  return {
    bills: centreBills,
    addBill,
    getBill,
    updateBill,
    deleteBill,
  };
}
