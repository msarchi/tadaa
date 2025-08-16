import { useEffect, useState, useCallback } from 'react';
import type { Todo } from '../types';
import { subscribeTodosForUser, createTodo, updateTodo, deleteTodo, toggleCompleted } from '../services/todosService';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!uid) { setTodos([]); return; }
    const unsub = subscribeTodosForUser(uid, setTodos);
    return () => unsub();
  }, [uid]);

  const addOrUpdate = useCallback(async (id: string | null, payload: Partial<Todo>) => {
    if (!id) {
      return createTodo(payload);
    } else {
      return updateTodo(id, payload);
    }
  }, []);

  const remove = useCallback(async (id: string) => deleteTodo(id), []);
  const setCompleted = useCallback(async (id: string, completed: boolean) => toggleCompleted(id, completed), []);

  return { uid, todos, addOrUpdate, remove, setCompleted };
}
