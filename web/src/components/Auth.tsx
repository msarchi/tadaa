import React from 'react';
import { Button, Stack, Avatar } from '@mui/material';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut, useDeviceLanguage } from 'firebase/auth';

export default function Auth() {
  useDeviceLanguage(auth);
  const user = auth.currentUser;

  const login = async () => {
    await signInWithPopup(auth, googleProvider);
  };
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
      {user ? <Avatar src={user.photoURL || undefined} alt={user.displayName || undefined} /> : null}
      <div>{user ? (user.displayName || user.email) : 'Ospite'}</div>
      {user ? (
        <Button variant="outlined" onClick={logout}>Logout</Button>
      ) : (
        <Button variant="contained" onClick={login}>Login con Google</Button>
      )}
    </Stack>
  );
}
