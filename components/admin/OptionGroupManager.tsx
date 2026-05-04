"use client";

import React, { useState } from "react";
import { formatVND } from "@/lib/formatters";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  Loader2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { AdminOptionGroup } from "@/types/admin";
import { useOptionGroupForm } from "@/hooks/use-option-group-form";
import { SortableValueRow } from "./SortableValueRow";

type Props = {
  groups: AdminOptionGroup[];
};

function buildSelectionLabel(min: number, max: number) {
  if (min === 0 && max === 1) return "Optional · Pick 1";
  if (min === 1 && max === 1) return "Required · Pick 1";
  if (min === 0) return `Optional · Pick up to ${max}`;
  return `Required · Pick ${min}–${max}`;
}

export function OptionGroupManager({ groups }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { state, actions } = useOptionGroupForm(() => setShowModal(false));
  const {
    editing,
    error,
    formName,
    formMinSelect,
    formMaxSelect,
    formValues,
    isPending,
  } = state;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const openCreate = () => {
    actions.openCreate();
    setShowModal(true);
  };

  const openEdit = (g: AdminOptionGroup) => {
    actions.openEdit(g);
    setShowModal(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
            Option Groups
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-medium text-primary bg-primary-container px-3 py-1 rounded-full">
              Total: {groups.length} groups
            </span>
          </div>
        </div>
        <Button
          onClick={openCreate}
          className="font-headline font-bold px-6 h-11 rounded-full shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> Add group
        </Button>
      </div>

      <div className="bg-surface-container-lowest rounded-[1.5rem] shadow-[0px_20px_40px_rgba(43,48,45,0.06)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/10">
              {[
                "Group name",
                "Selection",
                "Values",
                "Linked products",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 text-sm">
            {groups.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-8 py-12 text-center text-on-surface-variant"
                >
                  No option groups yet.{" "}
                  <button
                    onClick={openCreate}
                    className="text-primary font-semibold underline"
                  >
                    Create one
                  </button>
                </td>
              </tr>
            )}
            {groups.map((g) => (
              <React.Fragment key={g.id}>
                <tr className="hover:bg-surface-container/30 transition-colors">
                  {/* Name (expand toggle) */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === g.id ? null : g.id)
                      }
                      className="flex items-center gap-2 font-bold text-on-surface hover:text-primary transition-colors"
                    >
                      {expandedId === g.id ? (
                        <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                      )}
                      {g.name}
                    </button>
                  </td>

                  {/* Selection label */}
                  <td className="px-6 py-4 text-on-surface-variant text-xs">
                    {buildSelectionLabel(g.min_select, g.max_select)}
                  </td>

                  {/* Values count */}
                  <td className="px-6 py-4">
                    <span className="bg-surface-container px-2.5 py-1 rounded-full text-xs font-semibold text-on-surface-variant">
                      {g.option_values.length} values
                    </span>
                  </td>

                  {/* Linked products badges */}
                  <td className="px-6 py-4">
                    {g.linked_products && g.linked_products.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {g.linked_products.slice(0, 3).map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full"
                          >
                            <Package className="w-2.5 h-2.5" />
                            {p.name}
                          </span>
                        ))}
                        {g.linked_products.length > 3 && (
                          <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant text-xs font-medium rounded-full">
                            +{g.linked_products.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-on-surface-variant opacity-40 text-xs">
                        Not linked
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(g)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-error hover:bg-error/10"
                            />
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete option group?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete{" "}
                              <strong>{g.name}</strong> and all its values.
                              Products using this group will lose access to it.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => actions.handleDelete(g)}
                              disabled={isPending}
                            >
                              {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Delete"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>

                {/* Expanded row: values + all linked products */}
                {expandedId === g.id && (
                  <tr
                    key={`${g.id}-expanded`}
                    className="bg-surface-container/20"
                  >
                    <td colSpan={5} className="px-10 py-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                            Values
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {[...g.option_values]
                              .sort((a, b) => a.sort_order - b.sort_order)
                              .map((v) => (
                                <span
                                  key={v.id ?? v.name}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full text-xs font-medium text-on-surface-variant"
                                >
                                  {v.name}
                                  {v.price > 0 && (
                                    <span className="text-primary font-semibold">
                                      {formatVND(v.price)}
                                    </span>
                                  )}
                                </span>
                              ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                            Linked products
                          </p>
                          {g.linked_products && g.linked_products.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {g.linked_products.map((p) => (
                                <span
                                  key={p.id}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium"
                                >
                                  <Package className="w-3 h-3" />
                                  {p.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-on-surface-variant italic">
                              Not linked to any product
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-[2rem] w-full max-w-lg shadow-[0_40px_80px_rgba(0,0,0,0.15)] flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
              <h3 className="text-xl font-extrabold font-headline text-on-surface">
                {editing ? "Edit option group" : "Add option group"}
              </h3>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowModal(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="overflow-y-auto px-8 pb-8 space-y-5">
              {error && (
                <div className="px-4 py-3 bg-error/10 text-error text-sm rounded-xl">
                  {error}
                </div>
              )}

              <form
                id="og-form"
                onSubmit={actions.handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                    Group name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => actions.setFormName(e.target.value)}
                    placeholder="E.g: Ice level, Toppings, Size"
                    className="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                      Min select
                    </label>
                    <select
                      value={formMinSelect}
                      onChange={(e) =>
                        actions.setFormMinSelect(Number(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value={0}>0 (optional)</option>
                      <option value={1}>1 (required)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                      Max select
                    </label>
                    <select
                      value={formMaxSelect}
                      onChange={(e) =>
                        actions.setFormMaxSelect(Number(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={99}>Unlimited</option>
                    </select>
                  </div>
                </div>

                <div className="px-4 py-2.5 bg-primary/5 rounded-xl text-sm text-primary font-medium">
                  → {buildSelectionLabel(formMinSelect, formMaxSelect)}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-on-surface-variant">
                      Values *
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={actions.addValue}
                      className="text-primary h-7 text-xs px-2"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={actions.handleDragEnd}
                  >
                    <SortableContext
                      items={formValues.map((_, i) => i)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {formValues.map((v, i) => (
                          <SortableValueRow
                            key={i}
                            index={i}
                            value={v}
                            onChange={(key, val) =>
                              actions.updateValue(i, key, val)
                            }
                            onRemove={() => actions.removeValue(i)}
                            canRemove={formValues.length > 1}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 rounded-full shadow-lg shadow-primary/20"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : editing ? (
                      "Update"
                    ) : (
                      "Create"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
