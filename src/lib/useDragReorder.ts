import { useState, type DragEvent } from 'react';
import { supabase } from './supabase';

interface Row {
  id: string;
  sort_order?: number;
}

/**
 * Drag-and-drop ordering for a list of rows that carry a `sort_order` column. Spread `handlers(id)`
 * onto the element that stands for a row; dropping it on another row moves it to that position. The new
 * order shows at once and is then saved (every row gets its index, which also repairs duplicate values).
 */
export function useDragReorder<T extends Row>(
  table: 'projects' | 'logos',
  items: T[],
  setItems: (items: T[]) => void,
  reload: () => void,
) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const reset = () => {
    setDragId(null);
    setOverId(null);
  };

  const drop = async (targetId: string) => {
    const from = items.findIndex(i => i.id === dragId);
    const to = items.findIndex(i => i.id === targetId);
    reset();
    if (from < 0 || to < 0 || from === to) return;

    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next.map((row, i) => ({ ...row, sort_order: i })));

    const results = await Promise.all(
      next.map((row, i) => (row.sort_order === i ? null : supabase.from(table).update({ sort_order: i }).eq('id', row.id))),
    );
    const failed = results.find(r => r?.error);
    if (failed?.error) alert(`Could not save the new order: ${failed.error.message}`);
    reload();
  };

  const handlers = (id: string) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => {
      setDragId(id);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
    },
    onDragOver: (e: DragEvent) => {
      if (!dragId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (overId !== id) setOverId(id);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      void drop(id);
    },
    onDragEnd: reset,
  });

  return { dragId, overId, handlers };
}

/**
 * Drag-and-drop ordering for a list kept in component state (no saving here, the caller does that).
 * `handleProps(id)` goes on a small grip, so text fields inside a row stay selectable; `targetProps(id)`
 * goes on the whole row, which is also what the browser shows while dragging.
 */
export function useDragList<T extends { id: string }>(items: T[], onChange: (items: T[]) => void) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const reset = () => {
    setDragId(null);
    setOverId(null);
  };

  const handleProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: DragEvent<HTMLElement>) => {
      const row = e.currentTarget.closest('[data-drag-row]');
      if (row) e.dataTransfer.setDragImage(row, 24, 24);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
      setDragId(id);
    },
    onDragEnd: reset,
  });

  const targetProps = (id: string) => ({
    'data-drag-row': '',
    onDragOver: (e: DragEvent<HTMLElement>) => {
      if (!dragId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (overId !== id) setOverId(id);
    },
    onDrop: (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      const from = items.findIndex(i => i.id === dragId);
      const to = items.findIndex(i => i.id === id);
      reset();
      if (from < 0 || to < 0 || from === to) return;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onChange(next);
    },
  });

  return { dragId, overId, handleProps, targetProps };
}
