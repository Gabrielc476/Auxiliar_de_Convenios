export interface ReminderType {
    id: string;
    userId: string;
    title: string;
    description: string;
    reminderDate: string;
    created: string;
    priority: "baixa" | "media" | "alta";
    status: "pending" | "completed";
    relatedConvenioId?: string;
    relatedPendenciaId?: string;
  }
  
  export interface NewReminderType {
    userId: string;
    title: string;
    description: string;
    reminderDate: string;
    priority: "baixa" | "media" | "alta";
    relatedConvenioId?: string;
    relatedPendenciaId?: string;
  }