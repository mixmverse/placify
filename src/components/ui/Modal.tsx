// src/components/ui/Modal.tsx
"use client";
export function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-950" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
