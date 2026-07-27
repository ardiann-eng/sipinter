import { Download, FileText, ImageIcon, Paperclip } from "lucide-react";
import { formatFileSize } from "@/lib/format";
import { Button } from "./ui/primitives";

export interface DocumentPlaceholderProps {
  name: string;
  type?: "pdf" | "image" | "document";
  size?: number;
  description?: string;
  onDownload?: () => void;
}

export function DocumentPlaceholder({ name, type = "document", size, description, onDownload }: DocumentPlaceholderProps) {
  const Icon = type === "image" ? ImageIcon : type === "pdf" ? FileText : Paperclip;
  return <div className="document"><div className="document__preview"><Icon aria-hidden="true" /><span>{type.toUpperCase()}</span></div><div className="document__info"><strong>{name}</strong>{description && <p>{description}</p>}<span>{size !== undefined ? formatFileSize(size) : "Ukuran tidak tersedia"}</span></div>{onDownload && <Button variant="ghost" size="icon" onClick={onDownload} aria-label={`Unduh ${name}`}><Download size={18} /></Button>}</div>;
}
