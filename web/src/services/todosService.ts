import { db } from './firebase';
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, where
} from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { app } from './firebase';
import type { Todo } from '../types';
import { onAuthStateChanged, getAuth } from 'firebase/auth';

const todosCol = collection(db, 'todos');
const functions = getFunctions(app);

const createTodoFn = httpsCallable(functions, 'createTodo');
const updateTodoFn = httpsCallable(functions, 'updateTodo');
const deleteTodoFn = httpsCallable(functions, 'deleteTodo');

// Subscriptions: esegue due query (owner e assignee) e unisce i risultati
export function subscribeTodosForUser(uid: string, callback: (todos: Todo[]) => void) {
  const qOwner = query(todosCol, where('ownerId', '==', uid), orderBy('createdAt', 'desc'));
  const qAssignee = query(todosCol, where('assignees', 'array-contains', uid), orderBy('createdAt', 'desc'));

  const map = new Map<string, Todo>();

  const emit = () => callback(Array.from(map.values()).sort((a, b) => {
    const at = (a.createdAt?.toMillis?.() ?? 0);
    const bt = (b.createdAt?.toMillis?.() ?? 0);
    return bt - at;
  }));

  const unsub1 = onSnapshot(qOwner, (snap) => {
    snap.docChanges().forEach(change => {
      const t = { id: change.doc.id, ...(change.doc.data() as any) } as Todo;
      if (change.type === 'removed') map.delete(change.doc.id);
      else map.set(change.doc.id, t);
    });
    emit();
  });

  const unsub2 = onSnapshot(qAssignee, (snap) => {
    snap.docChanges().forEach(change => {
      const t = { id: change.doc.id, ...(change.doc.data() as any) } as Todo;
      if (change.type === 'removed') map.delete(change.doc.id);
      else map.set(change.doc.id, t);
    });
    emit();
  });

  return () => { unsub1(); unsub2(); };
}

export async function createTodo(payload: Partial<Todo>): Promise<Todo> {
  const res = await createTodoFn(payload);
  return res.data as any;
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
  const res = await updateTodoFn({ id, updates });
  return res.data as any;
}

export async function deleteTodo(id: string): Promise<{ success: boolean }> {
  const res = await deleteTodoFn({ id });
  return res.data as any;
}

export async function toggleCompleted(id: string, completed: boolean) {
  return updateTodo(id, { completed, completedAt: completed ? new Date().toISOString() as any : null });
}
