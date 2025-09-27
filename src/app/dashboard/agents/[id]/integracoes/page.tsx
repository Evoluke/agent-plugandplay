"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import AgentMenu from "@/components/agents/AgentMenu";
import AgentGuide from "@/components/agents/AgentGuide";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DeactivateAgentButton from "@/components/agents/DeactivateAgentButton";
import ActivateAgentButton from "@/components/agents/ActivateAgentButton";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";

type Agent = {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  company_id: number | null;
};

const DEFAULT_SCHEDULE_START = "08:00";
const DEFAULT_SCHEDULE_END = "17:00";
const DEFAULT_SCHEDULE_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];
const DEFAULT_SCHEDULE_DURATION = 60;

export default function AgentIntegrationsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [connected, setConnected] = useState(false);
  const [scheduleStart, setScheduleStart] = useState(DEFAULT_SCHEDULE_START);
  const [scheduleEnd, setScheduleEnd] = useState(DEFAULT_SCHEDULE_END);
  const [scheduleDays, setScheduleDays] = useState<string[]>([
    ...DEFAULT_SCHEDULE_DAYS,
  ]);
  const [scheduleDuration, setScheduleDuration] = useState(
    DEFAULT_SCHEDULE_DURATION.toString(),
  );
  const [disconnectOpen, setDisconnectOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabasebrowser
      .from("agents")
      .select("id,name,type,is_active,company_id")
      .eq("id", id)
      .single<Agent>()
      .then(({ data }) => {
        setAgent(data ?? null);
      });

    supabasebrowser
      .from("agent_google_tokens")
      .select("schedule_start, schedule_end, schedule_days, schedule_duration")
      .eq("agent_id", id)
      .single()
      .then(({ data }) => {
        setConnected(!!data);
        setScheduleStart(data?.schedule_start ?? DEFAULT_SCHEDULE_START);
        setScheduleEnd(data?.schedule_end ?? DEFAULT_SCHEDULE_END);
        setScheduleDays(
          data?.schedule_days ?? [...DEFAULT_SCHEDULE_DAYS],
        );
        setScheduleDuration(
          data?.schedule_duration?.toString() ??
            DEFAULT_SCHEDULE_DURATION.toString(),
        );
      });
  }, [id]);

  useEffect(() => {
    if (agent && agent.type !== "sdr") {
      router.replace(`/dashboard/agents/${id}`);
    }
  }, [agent, id, router]);

  if (!agent) return <div>Carregando...</div>;
  if (agent.type !== "sdr") return null;

  const handleConnect = () => {
    if (!id) return;
    window.location.href = `/api/google-calendar/auth?agent_id=${id}`;
  };

  const handleDisconnect = async () => {
    if (!id) return;
    await fetch(`/api/google-calendar/disconnect?agent_id=${id}`, {
      method: "DELETE",
    });
    setConnected(false);
    setScheduleStart(DEFAULT_SCHEDULE_START);
    setScheduleEnd(DEFAULT_SCHEDULE_END);
    setScheduleDays([...DEFAULT_SCHEDULE_DAYS]);
    setScheduleDuration(DEFAULT_SCHEDULE_DURATION.toString());
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const startParts = scheduleStart.split(":").map(Number);
    const endParts = scheduleEnd.split(":").map(Number);
    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];

    if (endMinutes <= startMinutes) {
      toast.error("O horário final deve ser maior que o inicial.");
      return;
    }

    if (endMinutes - startMinutes < 180) {
      toast.error("A janela de disponibilidade deve ter no mínimo 3 horas.");
      return;
    }

    const durationMinutes = parseInt(scheduleDuration, 10);
    if (
      Number.isNaN(durationMinutes) ||
      durationMinutes < 15 ||
      durationMinutes > 720
    ) {
      toast.error("A duração deve estar entre 15 e 720 minutos.");
      return;
    }

    const { error } = await supabasebrowser
      .from("agent_google_tokens")
      .update({
        schedule_start: scheduleStart,
        schedule_end: scheduleEnd,
        schedule_days: scheduleDays,
        schedule_duration: durationMinutes,
      })
      .eq("agent_id", id);
    if (error) {
      toast.error("Erro ao salvar horários.");
    } else {
      toast.success("Horários salvos com sucesso.");
    }
  };

  const weekdays = [
    { value: "monday", label: "Segunda" },
    { value: "tuesday", label: "Terça" },
    { value: "wednesday", label: "Quarta" },
    { value: "thursday", label: "Quinta" },
    { value: "friday", label: "Sexta" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" },
  ];

  return (
    <div className="space-y-6">
      <AgentMenu agent={agent} />
      <AgentGuide />
      <div className="flex justify-center">
        <Card className="w-full md:w-[90%] p-6 space-y-4 text-left">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Google Calendar</h2>
            <p className="text-sm text-muted-foreground">
              {connected
                ? "Google Calendar conectado."
                : "Conecte seu calendário para sincronizar eventos."}
            </p>
          </div>
          {connected ? (
            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="scheduleStart" className="text-sm font-medium">
                    Início da janela
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Horário inicial em que o agente pode agendar eventos.
                  </p>
                  <Input
                    id="scheduleStart"
                    type="time"
                    value={scheduleStart}
                    onChange={(e) => setScheduleStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="scheduleEnd" className="text-sm font-medium">
                    Fim da janela
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Horário final permitido para agendar eventos.
                  </p>
                  <Input
                    id="scheduleEnd"
                    type="time"
                    value={scheduleEnd}
                    onChange={(e) => setScheduleEnd(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="scheduleDuration"
                    className="text-sm font-medium"
                  >
                    Duração dos eventos
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Tempo de cada evento em minutos (15 - 720).
                  </p>
                  <Input
                    id="scheduleDuration"
                    type="number"
                    min={15}
                    max={720}
                    step={15}
                    value={scheduleDuration}
                    onChange={(e) => setScheduleDuration(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Dias de atendimento</label>
                <p className="text-xs text-muted-foreground">
                  Selecione os dias em que o agente pode agendar eventos.
                </p>
                <div className="flex flex-wrap gap-2">
                  {weekdays.map((day) => (
                    <label key={day.value} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={scheduleDays.includes(day.value)}
                        onChange={() =>
                          setScheduleDays((prev) =>
                            prev.includes(day.value)
                              ? prev.filter((d) => d !== day.value)
                              : [...prev, day.value]
                          )
                        }
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Salvar horários</Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDisconnectOpen(true)}
                >
                  Desconectar
                </Button>
              </div>
            </form>
          ) : (
            <Button onClick={handleConnect}>Conectar</Button>
          )}
        </Card>
      </div>
      <div className="flex justify-center">
        <div className="w-full md:w-[90%] flex justify-end gap-2">
          {agent.is_active ? (
            <DeactivateAgentButton
              agentId={id}
              onDeactivated={() =>
                setAgent((a) => (a ? { ...a, is_active: false } : a))
              }
            />
          ) : (
            <ActivateAgentButton
              agentId={id}
              onActivated={() =>
                setAgent((a) => (a ? { ...a, is_active: true } : a))
              }
            />
          )}
        </div>
      </div>
      <Dialog.Root open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow space-y-4">
            <Dialog.Title className="text-lg font-semibold">
              Desconectar Google Calendar
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600">
              Tem certeza que deseja desabilitar o Google Calendar? Desabilitando o agente de IA não estará agendando horários.
            </Dialog.Description>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDisconnectOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setDisconnectOpen(false);
                  handleDisconnect();
                }}
              >
                Desconectar
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

