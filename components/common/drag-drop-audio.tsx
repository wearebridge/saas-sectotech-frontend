"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragDropAudioProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isCalculatingCredits: boolean;
  selectedFileName?: string | null;
  accept?: string;
  className?: string;
}

export function DragDropAudio({
  fileInputRef,
  onFileSelect,
  isCalculatingCredits,
  selectedFileName,
  accept = "audio/*,video/mp4,application/mp4,video/mpeg,application/mpeg,.mpeg,.mpg,.mpga",
  className,
}: DragDropAudioProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleSelect = (files: FileList | null | undefined) => {
    if (!files?.length) {
      return;
    }

    const singleFile = files.item(0);
    if (!singleFile) {
      return;
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(singleFile);

    onFileSelect({
      target: { files: dataTransfer.files },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handlePick = () => fileInputRef.current?.click();

  return (
    <div
      className={cn(
        "flex cursor-pointer items-center justify-center rounded-md border border-dashed p-6 transition-all duration-200",
        "min-h-48 bg-muted/30 hover:bg-muted/50",
        isDragActive &&
          "border-brand/60 bg-brand/5 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]",
        className,
      )}
      role="button"
      tabIndex={0}
      onClick={handlePick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handlePick();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragActive(false);
        handleSelect(event.dataTransfer.files);
      }}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Upload className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isDragActive
              ? "Solte aqui para enviar"
              : "Arraste e solte o audio aqui"}
          </p>
          <p className="text-xs text-muted-foreground">
            Qualquer formato de áudio (incluindo MPEG)
          </p>
          {selectedFileName ? (
            <div className="flex items-center justify-center">
              <span className="rounded-md border border-brand/30 bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
                {selectedFileName}
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Clique para selecionar um arquivo de audio
            </p>
          )}
        </div>
        {isCalculatingCredits && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
            Calculando...
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(event) => handleSelect(event.target.files)}
        className="hidden"
      />
    </div>
  );
}
