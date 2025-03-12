"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Componente de Loading
interface LoadingProps {
  text?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  text = "Carregando...",
  className,
}) => (
  <div
    className={cn("flex flex-col items-center justify-center p-6", className)}
  >
    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
    <p className="text-muted-foreground">{text}</p>
  </div>
);

// Componentes de Erro
interface ErrorProps {
  message: string;
  className?: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorProps> = ({
  message,
  className,
  onRetry,
}) => (
  <div
    className={cn("rounded-lg bg-destructive/10 p-4 text-center", className)}
  >
    <p className="text-destructive">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2 text-sm text-primary hover:underline"
      >
        Tentar novamente
      </button>
    )}
  </div>
);

// Componente para estados vazios
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => (
  <div className={cn("text-center p-8 max-w-md mx-auto", className)}>
    {icon && <div className="mb-4 flex justify-center">{icon}</div>}
    <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
    {description && <p className="text-muted-foreground mb-4">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
