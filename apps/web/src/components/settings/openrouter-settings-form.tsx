"use client";

import { useState, type FormEvent } from "react";
import { Check, Eye, EyeOff, KeyRound, LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SettingsSummary {
  configured: boolean;
  keyHint: string | null;
  model: string;
}

export function OpenRouterSettingsForm({ initial }: { initial: SettingsSummary }) {
  const [summary, setSummary] = useState(initial);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(initial.model);
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "deleting" | "success" | "error"; message?: string }>({ kind: "idle" });

  async function save(event: FormEvent) {
    event.preventDefault();
    setStatus({ kind: "saving" });
    const response = await fetch("/api/v1/settings/openrouter", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey, model }),
    });
    const body = (await response.json().catch(() => ({}))) as SettingsSummary & { error?: string };
    if (!response.ok) {
      setStatus({ kind: "error", message: body.error ?? "No se pudo guardar la configuración" });
      return;
    }
    setSummary(body);
    setApiKey("");
    setStatus({ kind: "success", message: apiKey.trim() ? "Clave guardada y cifrada" : "Modelo guardado" });
  }

  async function remove() {
    setStatus({ kind: "deleting" });
    const response = await fetch("/api/v1/settings/openrouter", { method: "DELETE" });
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setStatus({ kind: "error", message: body.error ?? "No se pudo eliminar la clave" });
      return;
    }
    setSummary({ configured: false, keyHint: null, model: "openrouter/free" });
    setModel("openrouter/free");
    setApiKey("");
    setStatus({ kind: "success", message: "Clave eliminada" });
  }

  const busy = status.kind === "saving" || status.kind === "deleting";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <KeyRound className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display font-semibold">OpenRouter</h2>
          <p className="truncate text-sm text-muted-foreground">
            {summary.configured ? `Conectado · termina en ${summary.keyHint}` : "Sin clave configurada"}
          </p>
        </div>
        <span
          className={summary.configured
            ? "flex size-8 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
            : "size-2 rounded-full bg-muted-foreground/40"}
          aria-label={summary.configured ? "OpenRouter conectado" : "OpenRouter sin configurar"}
        >
          {summary.configured ? <Check className="size-4" /> : null}
        </span>
      </div>

      <form onSubmit={save} className="flex flex-col gap-5 p-4">
        <div className="space-y-2">
          <label htmlFor="openrouter-key" className="text-sm font-medium">Clave API personal</label>
          <div className="relative">
            <Input
              id="openrouter-key"
              name="apiKey"
              type={showKey ? "text" : "password"}
              autoComplete="off"
              spellCheck={false}
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={summary.configured ? "Pega una clave para sustituir la actual" : "sk-or-v1-…"}
              className="pr-11 font-mono"
              required={!summary.configured}
            />
            <button
              type="button"
              onClick={() => setShowKey((value) => !value)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={showKey ? "Ocultar clave" : "Mostrar clave"}
            >
              {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            RPeak la cifra antes de guardarla. La clave nunca vuelve a mostrarse ni se envía al navegador.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="openrouter-model" className="text-sm font-medium">Modelo</label>
          <Input
            id="openrouter-model"
            name="model"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="openrouter/free"
            spellCheck={false}
            className="font-mono"
            required
          />
          <p className="text-xs text-muted-foreground">
            <span className="font-mono">openrouter/free</span> deja que OpenRouter elija un modelo gratuito disponible.
          </p>
        </div>

        {status.message ? (
          <p className={status.kind === "error" ? "text-sm text-destructive" : "text-sm text-emerald-600 dark:text-emerald-400"} role="status">
            {status.message}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {summary.configured ? (
            <Button type="button" variant="danger" onClick={remove} disabled={busy}>
              {status.kind === "deleting" ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Eliminar clave
            </Button>
          ) : <span />}
          <Button type="submit" disabled={busy || (!summary.configured && apiKey.trim().length === 0)}>
            {status.kind === "saving" ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {summary.configured ? "Guardar cambios" : "Guardar clave"}
          </Button>
        </div>
      </form>
    </div>
  );
}
