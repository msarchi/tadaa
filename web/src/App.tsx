import React, { useEffect, useState } from 'react';
import { Container, Typography, Divider } from '@mui/material';
import useTodos from './hooks/useTodos';
import TodoList from './components/TodoList';
import Auth from './components/Auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';

export default function App() {
  const { uid, todos, addOrUpdate, remove, setCompleted } = useTodos();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => setReady(true));
    return () => unsub();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Todo Gerarchica</Typography>
      <Auth />
      <Divider sx={{ mb: 2 }} />
      {ready && uid ? (
        <TodoList todos={todos} addOrUpdate={addOrUpdate} remove={remove} setCompleted={setCompleted} />
      ) : (
        <Typography variant="body1">Accedi per gestire i tuoi task.</Typography>
      )}
    </Container>
  );
}
