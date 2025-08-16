export interface Todo {
  id: string;
  name: string;
  description?: string;
  dueDate: string | null;
  progress: number;         // 0..100
  completed: boolean;
  ownerId: string;          // UID creatore
  assignees: string[];      // UIDs assegnati
  parentId?: string | null; // per struttura gerarchica
  createdAt?: any;
  updatedAt?: any;
  completedAt?: any;
}

export interface User {
  uid: string;
  displayName?: string;
  email?: string;
}
