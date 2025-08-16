import React from 'react';
import { Card, CardContent, Typography, IconButton, Box, Chip, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import dayjs from 'dayjs';
import type { Todo, User } from '../types';

type Props = {
  todo: Todo;
  assigneeLookup?: Record<string, User | undefined>;
  onEdit: (t: Todo) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  children?: React.ReactNode;
};

export default function TodoItem({ todo, assigneeLookup = {}, onEdit, onDelete, onToggleComplete, children }: Props) {
  const chips = (todo.assignees || []).map(uid => {
    const u = assigneeLookup[uid];
    const label = u?.displayName || u?.email || uid;
    return <Chip key={uid} label={label} size="small" />;
  });

  return (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => onToggleComplete(todo.id, !todo.completed)}>
          {todo.completed ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1">{todo.name}</Typography>
          {todo.description ? <Typography variant="body2">{todo.description}</Typography> : null}
          <Stack direction="row" spacing={1} sx={{ my: 0.5 }}>{chips}</Stack>
          {todo.dueDate ? <Typography variant="caption">Scade: {dayjs(todo.dueDate).format('YYYY-MM-DD')}</Typography> : null}
          <Typography variant="caption" sx={{ ml: 1 }}>Progresso: {todo.progress ?? 0}%</Typography>
        </Box>
        <IconButton onClick={() => onEdit(todo)}><EditIcon /></IconButton>
        <IconButton onClick={() => onDelete(todo.id)}><DeleteIcon /></IconButton>
      </CardContent>
      {children}
    </Card>
  );
}
