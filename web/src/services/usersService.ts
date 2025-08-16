import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { User } from '../types';

export async function fetchUsersOnce(): Promise<User[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ uid: d.id, ...(d.data() as any) }));
}
