"use client";

import { ShoppingBasket } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { CartQuickView } from "./CartQuickView";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function HeaderCartButton() {
  const { totalItems } = useCartStore();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return (
      <div className="p-2 scale-95 transition-transform text-primary-dim/50 cursor-pointer rounded-full">
        <ShoppingBasket strokeWidth={1.5} className="w-6 h-6" />
      </div>
    );
  }

  const trigger = (
    <button
      type="button"
      className="p-2 scale-95 active:scale-90 transition-transform relative hover:bg-primary/10 rounded-full group cursor-pointer"
    >
      <ShoppingBasket
        strokeWidth={1.5}
        className="w-6 h-6 group-hover:text-primary transition-colors"
      />
      {totalItems() > 0 && (
        <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-on-error shadow-sm animate-in zoom-in duration-300">
          {totalItems()}
        </span>
      )}
    </button>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={trigger} />
        <PopoverContent
          align="end"
          className="w-[360px] p-0 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-surface-container-highest overflow-hidden bg-surface-container-lowest"
        >
          <CartQuickView close={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger} />
      <SheetContent
        side="bottom"
        className="h-[80vh] rounded-t-[1.5rem] p-0 overflow-hidden bg-surface-container-lowest border-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Giỏ hàng</SheetTitle>
        </SheetHeader>
        <div className="pt-2">
          <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-2" />
          <CartQuickView close={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
