import { createContext, useContext, useState, ReactNode } from "react";

interface BillFormStateContextType {
  selectedDueDate: number | null;
  setSelectedDueDate: (date: number | null) => void;
}

const BillFormStateContext = createContext<BillFormStateContextType | undefined>(undefined);

export function BillFormStateProvider({ children }: { children: ReactNode }) {
  const [selectedDueDate, setSelectedDueDate] = useState<number | null>(null);

  return (
    <BillFormStateContext.Provider value={{ selectedDueDate, setSelectedDueDate }}>
      {children}
    </BillFormStateContext.Provider>
  );
}

export function useBillFormState() {
  const context = useContext(BillFormStateContext);
  if (context === undefined) {
    throw new Error("useBillFormState must be used within a BillFormStateProvider");
  }
  return context;
}