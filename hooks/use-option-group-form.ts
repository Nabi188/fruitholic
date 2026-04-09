"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  createOptionGroup,
  updateOptionGroup,
  deleteOptionGroup,
} from "@/app/actions/admin/option-groups";
import type { AdminOptionGroup, AdminOptionValue } from "@/types/admin";

export function useOptionGroupForm(onComplete: () => void) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<AdminOptionGroup | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formMinSelect, setFormMinSelect] = useState(0);
  const [formMaxSelect, setFormMaxSelect] = useState(1);
  const [formValues, setFormValues] = useState<AdminOptionValue[]>([
    { name: "", price: 0, sort_order: 0, is_active: true },
  ]);

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setFormMinSelect(0);
    setFormMaxSelect(1);
    setFormValues([{ name: "", price: 0, sort_order: 0, is_active: true }]);
    setError(null);
  };

  const openEdit = (g: AdminOptionGroup) => {
    setEditing(g);
    setFormName(g.name);
    setFormMinSelect(g.min_select);
    setFormMaxSelect(g.max_select);
    setFormValues(
      g.option_values.length > 0
        ? [...g.option_values].sort((a, b) => a.sort_order - b.sort_order)
        : [{ name: "", price: 0, sort_order: 0, is_active: true }],
    );
    setError(null);
  };

  const addValue = () =>
    setFormValues((prev) => [
      ...prev,
      { name: "", price: 0, sort_order: prev.length, is_active: true },
    ]);

  const removeValue = (i: number) =>
    setFormValues((prev) => prev.filter((_, idx) => idx !== i));

  const updateValue = (
    i: number,
    key: keyof AdminOptionValue,
    val: string | number | boolean,
  ) =>
    setFormValues((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, [key]: val } : v)),
    );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFormValues((prev) =>
        arrayMove(prev, active.id as number, over.id as number),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError("Name is required");
      return;
    }
    setError(null);
    const data = {
      name: formName,
      min_select: formMinSelect,
      max_select: formMaxSelect,
      values: formValues.map((v, i) => ({ ...v, sort_order: i })),
    };
    startTransition(async () => {
      const result = editing
        ? await updateOptionGroup(editing.id, data)
        : await createOptionGroup(data);
      if (result.error) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "An error occurred.",
        );
      } else {
        toast.success(
          editing ? `"${formName}" updated` : `"${formName}" created`,
        );
        onComplete();
      }
    });
  };

  const handleDelete = (g: AdminOptionGroup) => {
    startTransition(async () => {
      const result = await deleteOptionGroup(g.id);
      if (result.error) {
        toast.error("Failed to delete option group");
      } else {
        toast.success(`"${g.name}" deleted`);
        onComplete();
      }
    });
  };

  return {
    state: {
      editing,
      error,
      formName,
      formMinSelect,
      formMaxSelect,
      formValues,
      isPending,
    },
    actions: {
      setFormName,
      setFormMinSelect,
      setFormMaxSelect,
      setFormValues,
      openCreate,
      openEdit,
      addValue,
      removeValue,
      updateValue,
      handleDragEnd,
      handleSubmit,
      handleDelete,
    },
  };
}
