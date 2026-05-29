import { AlertTriangle } from "lucide-react";

interface ConnectionBannerProps {
  error: string;
}

export function ConnectionBanner({ error }: ConnectionBannerProps) {
  return (
    <div className="rounded-lg border border-[oklch(0.65_0.22_25_/_0.3)] bg-[oklch(0.65_0.22_25_/_0.05)] p-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[oklch(0.65_0.22_25_/_0.1)] flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-[oklch(0.65_0.22_25)]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[oklch(0.65_0.22_25)]">
            Falha na conexão com o monitor
          </p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {error}
          </p>
        </div>
      </div>
    </div>
  );
}
