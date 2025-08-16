import React, { useMemo, useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import { Box } from '@mui/material';
import type { Todo, User } from '../types';
import { fetchUsersOnce } from '../services/usersService';

function buildTree(flat: Todo[]) {
  const map = new Map<string, (Todo & { children: Todo[] })>();
  flat.forEach(item => map.set(item.id, { ...item, children: [] }));
  const roots: (Todo & { children: Todo[] })[] = [];
  map.forEach(item => {
    if (item.parentId) {
      const parent = map.get(item.parentId);
      if (parent) parent.children.push(item);
      else roots.push(item);
    } else {
      roots.push(item);
    }
  });
  return roots;
}

type Props = {
  todos: Todo[];
  addOrUpdate: (id: string | null, payload: Partial<Todo>) => Promise<any>;
  remove: (id: string) => Promise<any>;
  setCompleted: (id: string, completed: boolean) => Promise<any>;
};

export default function TodoList({ todos, addOrUpdate, remove, setCompleted }: Props) {
  const tree = useMemo(() => buildTree(todos), [todos]);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => { fetchUsersOnce().then(setUsers); }, []);
  const lookup = useMemo(() => Object.fromEntries(users.map(u => [u.uid, u])), [users]);

  const renderNode = (node: any, depth = 0) => (
    <Box key={node.id} sx={{ ml: depth * 3 }}>
      <TodoItem
        todo={node}
        assigneeLookup={lookup}
        onEdit={(t) => setEditing(t)}
        onDelete={(id) => remove(id)}
        onToggleComplete={(id, completed) => setCompleted(id, completed)}
      />
      {editing && editing.id === node.id && (
        <TodoForm defaultValues={editing} onSubmit={async (id, payload) => { await addOrUpdate(id, payload); setEditing(null); }} />
      )}
      {node.children?.map((c: Todo) => renderNode(c, depth + 1))}
    </Box>
  );

  return (
    <Box>
      <TodoForm onSubmit={addOrUpdate} />
      <Box sx={{ mt: 2 }}>
        {tree.map(root => renderNode(root))}
      </Box>
    </Box>
  );
}
