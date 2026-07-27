import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown, LoaderCircle } from "lucide-react";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({ className, variant = "primary", size = "md", loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button className={cx("button", `button--${variant}`, `button--${size}`, className)} disabled={disabled || loading} {...props}>
      {loading && <LoaderCircle className="button__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, className, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <label className="field" htmlFor={inputId}>
      {label && <span className="field__label">{label}{props.required && <span className="field__required"> *</span>}</span>}
      <input id={inputId} className={cx("input", error && "input--error", className)} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props} />
      {error ? <span className="field__error" id={`${inputId}-error`}>{error}</span> : hint ? <span className="field__hint" id={`${inputId}-hint`}>{hint}</span> : null}
    </label>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Select({ label, hint, error, className, id, children, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? props.name ?? generatedId;
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;
  return (
    <label className="field" htmlFor={selectId}>
      {label && <span className="field__label">{label}{props.required && <span className="field__required"> *</span>}</span>}
      <span className="select-wrap">
        <select id={selectId} className={cx("select", error && "input--error", className)} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props}>{children}</select>
        <ChevronDown size={16} aria-hidden="true" />
      </span>
      {error ? <span className="field__error" id={`${selectId}-error`}>{error}</span> : hint ? <span className="field__hint" id={`${selectId}-hint`}>{hint}</span> : null}
    </label>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className, id, ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? props.name ?? generatedId;
  const describedBy = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;
  return <label className="field" htmlFor={textareaId}>
    {label && <span className="field__label">{label}{props.required && <span className="field__required"> *</span>}</span>}
    <textarea id={textareaId} className={cx("textarea", error && "input--error", className)} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props} />
    {error ? <span className="field__error" id={`${textareaId}-error`}>{error}</span> : hint ? <span className="field__hint" id={`${textareaId}-hint`}>{hint}</span> : null}
  </label>;
}
