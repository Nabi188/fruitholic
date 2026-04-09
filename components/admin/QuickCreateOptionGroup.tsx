"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createOptionGroup } from "@/app/actions/admin/option-groups";
import type { AdminOptionGroup } from "@/types/admin";

type Props = {
  onCreated: (group: AdminOptionGroup) => void;
};

export function QuickCreateOptionGroup({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [minSelect, setMinSelect] = useState(0);
  const [maxSelect, setMaxSelect] = useState(1);
  const [values, setValues] = useState([{ name: "", price: 0 }]);

  const addValue = () => setValues((p) => [...p, { name: "", price: 0 }]);
  const removeValue = (i: number) =>
    setValues((p) => p.filter((_, idx) => idx !== i));
  const updateValue = (
    i: number,
    key: "name" | "price",
    val: string | number,
  ) =>
    setValues((p) => p.map((v, idx) => (idx === i ? { ...v, [key]: val } : v)));

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Group name is required.");
      return;
    }
    if (values.some((v) => !v.name.trim())) {
      toast.error("All value names are required.");
      return;
    }
    startTransition(async () => {
      const result = await createOptionGroup({
        name,
        min_select: minSelect,
        max_select: maxSelect,
        values: values.map((v, i) => ({
          ...v,
          sort_order: i,
          is_active: true,
        })),
      });
      if (result.error) {
        toast.error("Failed to create option group");
        return;
      }
      toast.success(`Option group "${name}" created`);

      const newGroup: AdminOptionGroup = {
        id: (result as any).groupId ?? "",
        name,
        min_select: minSelect,
        max_select: maxSelect,
        option_values: values.map((v, i) => ({
          ...v,
          sort_order: i,
          is_active: true,
        })),
      };

      onCreated(newGroup);
      setName("");
      setMinSelect(0);
      setMaxSelect(1);
      setValues([{ name: "", price: 0 }]);
      setOpen(false);
    });
  };

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 rounded-full border-dashed"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-3.5 h-3.5" />
        Quick create group
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-[2rem] p-6 w-full max-w-lg shadow-[0_40px_80px_rgba(0,0,0,0.15)] flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold font-headline text-on-surface">
            Quick Create Option Group
          </h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-surface-container rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">
                Group Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="e.g. Size, Toppings..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">
                Min selection
              </label>
              <input
                type="number"
                min={0}
                value={minSelect}
                onChange={(e) => setMinSelect(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">
                Max selection
              </label>
              <input
                type="number"
                min={1}
                value={maxSelect}
                onChange={(e) => setMaxSelect(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Option Values
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-primary"
                onClick={addValue}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add value
              </Button>
            </div>
            <div className="space-y-2">
              {values.map((v, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => updateValue(i, "name", e.target.value)}
                    className="flex-1 px-4 py-2 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Value name"
                  />
                  <input
                    type="number"
                    value={v.price}
                    onChange={(e) =>
                      updateValue(i, "price", Number(e.target.value))
                    }
                    className="w-24 px-4 py-2 bg-surface-container-low border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Price"
                  />
                  {values.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeValue(i)}
                      className="p-2 hover:bg-error/10 text-error rounded-full transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-outline-variant/10 mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="flex-1 rounded-full h-11"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={isPending}
            className="flex-1 rounded-full h-11"
          >
            {isPending ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </div>
    </div>
  );
}
