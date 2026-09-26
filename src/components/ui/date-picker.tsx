"use client";

import * as Popover from "@radix-ui/react-popover";
import { DayPicker, type Matcher } from "react-day-picker";
import "react-day-picker/style.css";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { useId, useState } from "react";

function parseDate(value?: string) {
  return value ? new Date(`${value}T12:00:00`) : undefined;
}

export function DatePicker({ label, value, onChange, min, max, error, required, name }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  error?: string;
  required?: boolean;
  name?: string;
}) {
  const selected = parseDate(value);
  const minimum = parseDate(min);
  const maximum = parseDate(max);
  const disabledDays: Matcher[] = [];
  if (minimum) disabledDays.push({ before: minimum });
  if (maximum) disabledDays.push({ after: maximum });
  const display = selected ? format(selected, "d MMMM yyyy", { locale: id }) : "Pilih tanggal";
  const [open, setOpen] = useState(false);
  const errorId = useId();

  return <div className="date-picker field">
    <span className="field__label">{label}{required && <span className="field__required"> *</span>}</span>
    {name && <input type="hidden" name={name} value={value} />}
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger type="button" className="date-picker__trigger" aria-label={`${label}: ${display}`} aria-invalid={Boolean(error)} aria-required={required} aria-describedby={error ? errorId : undefined}>
        <CalendarDays size={17} aria-hidden="true" /><span>{display}</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="date-picker__content" sideOffset={6} collisionPadding={8} align="start">
          <DayPicker mode="single" locale={id} selected={selected} defaultMonth={selected ?? minimum ?? new Date()} disabled={disabledDays} startMonth={minimum} endMonth={maximum} onSelect={(date) => { if (date) { onChange(format(date, "yyyy-MM-dd")); setOpen(false); } }} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
    {error && <small id={errorId} className="field__error" role="alert">{error}</small>}
  </div>;
}
