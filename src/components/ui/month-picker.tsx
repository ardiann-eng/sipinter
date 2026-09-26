"use client";

import { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const months = Array.from({ length: 12 }, (_, month) => new Intl.DateTimeFormat("id-ID", { month: "short" }).format(new Date(2026, month, 1)));
const monthName = (value: string) => {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
};

export function MonthPicker({ name, value, label = "Bulan" }: { name: string; value: string; label?: string }) {
  const [selected, setSelected] = useState(value);
  const [year, setYear] = useState(Number(value.slice(0, 4)));
  const [open, setOpen] = useState(false);
  useEffect(() => { setSelected(value); setYear(Number(value.slice(0, 4))); }, [value]);

  return <div className="month-picker">
    <input type="hidden" name={name} value={selected} />
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="month-picker__trigger" type="button" aria-label={`${label}: ${monthName(selected)}`}>
        <span>{monthName(selected)}</span><CalendarDays size={17} aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="month-picker__content" sideOffset={6} collisionPadding={8} align="start">
          <div className="month-picker__header">
            <button type="button" aria-label="Tahun sebelumnya" onClick={() => setYear((current) => current - 1)}><ChevronLeft size={18} /></button>
            <strong>{year}</strong>
            <button type="button" aria-label="Tahun berikutnya" onClick={() => setYear((current) => current + 1)}><ChevronRight size={18} /></button>
          </div>
          <div className="month-picker__months" aria-label={`Pilih bulan tahun ${year}`}>
            {months.map((month, index) => {
              const candidate = `${year}-${String(index + 1).padStart(2, "0")}`;
              return <button key={candidate} type="button" aria-pressed={selected === candidate} onClick={() => { setSelected(candidate); setOpen(false); }}>{month}</button>;
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  </div>;
}
