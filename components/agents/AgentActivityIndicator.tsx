"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session, RealtimeChannel } from "@supabase/supabase-js";
import { supabasebrowser } from "@/lib/supabaseClient";
import { cn } from "@/components/ui/utils";

type AgentStatus = "active" | "inactive" | "loading" | "error";

type RobotMood = "happy" | "sad" | "neutral";

const STATUS_LABELS: Record<AgentStatus, string> = {
  active: "Agente de IA ativo",
  inactive: "Nenhum agente ativo",
  loading: "Verificando agentes...",
  error: "Não foi possível carregar o status do agente",
};

const STATUS_COLORS: Record<AgentStatus, string> = {
  active: "text-emerald-600",
  inactive: "text-amber-600",
  loading: "text-slate-500",
  error: "text-red-600",
};

function RobotFace({ mood, className }: { mood: RobotMood; className?: string }) {
  const mouthPath = useMemo(() => {
    switch (mood) {
      case "happy":
        return "M8 15c1.5 2 6.5 2 8 0";
      case "sad":
        return "M8 16c1.5-2 6.5-2 8 0";
      default:
        return "M8 15h8";
    }
  }, [mood]);

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-hidden="true"
      className={cn("h-6 w-6", className)}
    >
      <rect x={4.5} y={6} width={15} height={11} rx={3.5} />
      <path d="M8 6V4m8 2V4" />
      <circle cx={10} cy={11} r={1.5} />
      <circle cx={14} cy={11} r={1.5} />
      <path d={mouthPath} />
      <path d="M6 18h12" />
    </svg>
  );
}

export default function AgentActivityIndicator() {
  const [status, setStatus] = useState<AgentStatus>("loading");

  useEffect(() => {
    let isMounted = true;
    let channel: RealtimeChannel | null = null;
    let lastUserId: string | null = null;
    let authSubscription:
      | ReturnType<typeof supabasebrowser.auth.onAuthStateChange>["data"]["subscription"]
      | null = null;

    const cleanupChannel = () => {
      if (channel) {
        supabasebrowser.removeChannel(channel);
        channel = null;
      }
    };

    const fetchAgentStatus = async (companyId: number) => {
      const { data, error } = await supabasebrowser
        .from("agents")
        .select("id")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .limit(1);

      if (!isMounted) return;

      if (error) {
        setStatus("error");
        return;
      }

      setStatus(data && data.length > 0 ? "active" : "inactive");
    };

    const setupForUser = async (userId: string) => {
      cleanupChannel();
      setStatus("loading");

      const { data: company, error } = await supabasebrowser
        .from("company")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!isMounted) return;

      if (error || !company) {
        setStatus("error");
        return;
      }

      await fetchAgentStatus(company.id);

      channel = supabasebrowser
        .channel(`agents:company:${company.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "agents",
            filter: `company_id=eq.${company.id}`,
          },
          () => {
            void fetchAgentStatus(company.id);
          }
        )
        .subscribe();
    };

    const handleSession = async (session: Session | null) => {
      const userId = session?.user?.id ?? null;
      if (!userId) {
        lastUserId = null;
        cleanupChannel();
        if (isMounted) setStatus("loading");
        return;
      }

      if (userId === lastUserId && channel) return;
      lastUserId = userId;
      await setupForUser(userId);
    };

    supabasebrowser.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      void handleSession(session);
    });

    const { data } = supabasebrowser.auth.onAuthStateChange((_, session) => {
      void handleSession(session);
    });
    authSubscription = data.subscription;

    return () => {
      isMounted = false;
      cleanupChannel();
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  const mood: RobotMood =
    status === "active" ? "happy" : status === "inactive" ? "sad" : "neutral";

  return (
    <div
      className="mr-3 inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-xs sm:text-sm shadow-sm"
      aria-live="polite"
      title={STATUS_LABELS[status]}
    >
      <RobotFace mood={mood} className={STATUS_COLORS[status]} />
      <span className="hidden md:inline text-gray-700">{STATUS_LABELS[status]}</span>
    </div>
  );
}
