import React, { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, Slider, Checkbox, FormControlLabel, Autocomplete, CircularProgress } from '@mui/material';
import type { Todo, User } from '../types';
import { fetchUsersOnce } from '../services/usersService';

type Props = {
  defaultValues?: Partial<Todo> & { id?: string };
  onSubmit: (id: string | null, payload: Partial<Todo>) => Promise<any>;
  parentId?: string | null;
};

export default function TodoForm({ defaultValues = {}, onSubmit, parentId }: Props) {
  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      name: '',
      description: '',
      dueDate: '',
      progress: 0,
      completed: false,
      assignees: [] as string[],
      ...defaultValues
    }
  });

  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoadingUsers(true);
    fetchUsersOnce().then(list => {
      if (mounted) setUsersList(list);
    }).finally(() => mounted && setLoadingUsers(false));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (defaultValues.assignees && usersList.length) {
      const selected = usersList.filter(u => (defaultValues.assignees as string[]).includes(u.uid));
      setValue('assignees', selected.map(u => u.uid));
    }
  }, [defaultValues.assignees, usersList, setValue]);

  const submit = async (data: any) => {
    const payload: Partial<Todo> = {
      ...data,
      parentId: parentId || (data.parentId ?? null),
      updatedAt: new Date().toISOString() as any
    };
    const id = (defaultValues as any).id || null;
    await onSubmit(id, payload);
    if (!id) reset();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(submit)} sx={{ display: 'grid', gap: 1 }}>
      <Controller name="name" control={control} rules={{ required: 'Nome richiesto' }} render={({ field, fieldState }) => (
        <TextField {...field} label="Nome" error={!!fieldState.error} helperText={fieldState.error?.message} />
      )} />

      <Controller name="description" control={control} render={({ field }) => (
        <TextField {...field} label="Descrizione (opzionale)" multiline minRows={2} />
      )} />

      <Controller name="dueDate" control={control} render={({ field }) => (
        <TextField {...field} type="date" label="Data scadenza" InputLabelProps={{ shrink: true }} />
      )} />

      <Controller name="progress" control={control} render={({ field }) => (
        <>
          <div>Progresso: {field.value}%</div>
          <Slider {...field} min={0} max={100} />
        </>
      )} />

      <Controller name="assignees" control={control} render={({ field }) => (
        <Autocomplete
          multiple
          options={usersList}
          getOptionLabel={(user) => user.displayName || user.email || user.uid}
          filterSelectedOptions
          onChange={(_, value) => field.onChange(value.map(u => u.uid))}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Assegna ad utenti"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingUsers ? <CircularProgress size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      )} />

      <Controller name="completed" control={control} render={({ field }) => (
        <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="Completato" />
      )} />

      <Button type="submit" variant="contained">Salva</Button>
    </Box>
  );
}
