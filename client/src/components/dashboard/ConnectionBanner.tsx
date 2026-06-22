import { AlertTriangle, RefreshCw } from "lucide-react";

interface ConnectionBannerProps {
  error: string;
  onRetry?: () => void;
}

export function ConnectionBanner({ error, onRetry }: ConnectionBannerProps) {
  return (
    <div className="rounded-lg border border-[oklch(0.65_0.22_25_/_0.3)] bg-[oklch(0.65_0.22_25_/_0.05)] p-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[oklch(0.65_0.22_25_/_0.1)] flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-[oklch(0.65_0.22_25)]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[oklch(0.65_0.22_25)]">
            Falha na conexão com o monitor
          </p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
            {error}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-auto flex items-center gap-1.5 rounded-md border border-[oklch(0.65_0.22_25_/_0.3)] px-2.5 py-1.5 text-xs font-mono text-[oklch(0.65_0.22_25)] hover:bg-[oklch(0.65_0.22_25_/_0.1)] transition-colors duration-150 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}
