export interface TodoCreatedEvent {
  type: "TodoCreated";
  data: { id: string; title: string; state: string; latitude: number; longitude: number };
}

export interface TodoUpdatedEvent {
  type: "TodoUpdated";
  data: { title?: string; state?: string; latitude?: number; longitude?: number };
}

export interface TodoDeletedEvent {
  type: "TodoDeleted";
  data: Record<string, never>;
}

export type TodoEvent = TodoCreatedEvent | TodoUpdatedEvent | TodoDeletedEvent;
