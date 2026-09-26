"use client";

import { Children, isValidElement, useEffect, useId, useState, type ChangeEvent, type ReactNode, type SelectHTMLAttributes } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import clsx from "clsx";

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  children: ReactNode;
  label?: string;
  hint?: string;
  error?: string;
};

type Option = { value: string; label: ReactNode; disabled: boolean };
const EMPTY_VALUE = "__sipinter_empty__";

export function Select({ children, label, hint, error, className, id, name, value, defaultValue, onChange, required, disabled, ...props }: Props) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const options: Option[] = Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ value?: string; disabled?: boolean; children?: ReactNode }>(child)) return [];
    return [{ value: String(child.props.value ?? child.props.children ?? ""), label: child.props.children, disabled: Boolean(child.props.disabled) }];
  });
  const emptyLabel = options.find((option) => option.value === "")?.label ?? "Pilih opsi";
  const firstOptionValue = options[0]?.value ?? "";
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? firstOptionValue));
  useEffect(() => { if (value === undefined) setInternalValue(String(defaultValue ?? firstOptionValue)); }, [defaultValue, value, firstOptionValue]);
  const selected = value !== undefined ? String(value) : internalValue;
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

  function update(nextValue: string) {
    const next = nextValue === EMPTY_VALUE ? "" : nextValue;
    if (value === undefined) setInternalValue(next);
    onChange?.({ target: { value: next }, currentTarget: { value: next } } as ChangeEvent<HTMLSelectElement>);
  }

  return <div className="modern-select-field">
    {label && <label className="field__label" htmlFor={selectId}>{label}{required && <span className="field__required"> *</span>}</label>}
    <SelectPrimitive.Root value={selected} onValueChange={update} disabled={disabled}>
      <SelectPrimitive.Trigger id={selectId} className={clsx("select", "modern-select__trigger", error && "input--error", className)} aria-label={props["aria-label"]} aria-describedby={describedBy} aria-invalid={Boolean(error)} aria-required={required}>
        <SelectPrimitive.Value placeholder={emptyLabel} />
        <SelectPrimitive.Icon><ChevronDown size={16} aria-hidden="true" /></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="modern-select__content" position="popper" sideOffset={6} collisionPadding={8}>
          <SelectPrimitive.Viewport className="modern-select__viewport">
            {options.map((option) => <SelectPrimitive.Item className="modern-select__option" key={option.value} value={option.value || EMPTY_VALUE} disabled={option.disabled}>
              <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              <SelectPrimitive.ItemIndicator><Check size={15} aria-hidden="true" /></SelectPrimitive.ItemIndicator>
            </SelectPrimitive.Item>)}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
    {name && <input type="hidden" name={name} value={selected} />}
    {error ? <span className="field__error" id={`${selectId}-error`}>{error}</span> : hint ? <span className="field__hint" id={`${selectId}-hint`}>{hint}</span> : null}
  </div>;
}
