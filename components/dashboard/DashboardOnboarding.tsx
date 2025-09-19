"use client";

import { RefObject, useEffect, useMemo, useState } from "react";
import { Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";

type StepPlacement = "right" | "left" | "bottom" | "top";

type StepConfig = {
  id: string;
  ref: RefObject<HTMLElement>;
  title: string;
  description: string;
  placement?: StepPlacement;
};

type StepPosition = {
  top: number;
  left: number;
};

const STORAGE_KEY = "dashboard-onboarding-completed";

interface DashboardOnboardingProps {
  steps: StepConfig[];
}

export function DashboardOnboarding({ steps }: DashboardOnboardingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [positions, setPositions] = useState<Record<string, StepPosition>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasCompleted = window.localStorage.getItem(STORAGE_KEY);
    if (!hasCompleted) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const highlightedElements: HTMLElement[] = [];

    steps.forEach((step) => {
      const element = step.ref.current;
      if (element) {
        highlightedElements.push(element);
        element.classList.add("onboarding-highlight");
      }
    });

    return () => {
      highlightedElements.forEach((element) => {
        element.classList.remove("onboarding-highlight");
      });
    };
  }, [isVisible, steps]);

  useEffect(() => {
    if (!isVisible) return;

    const updatePositions = () => {
      const nextPositions: Record<string, StepPosition> = {};

      steps.forEach((step) => {
        const element = step.ref.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        switch (step.placement) {
          case "left":
            nextPositions[step.id] = {
              top: rect.top + scrollY + rect.height / 2,
              left: rect.left + scrollX - 24,
            };
            break;
          case "bottom":
            nextPositions[step.id] = {
              top: rect.bottom + scrollY + 24,
              left: rect.left + scrollX + rect.width / 2,
            };
            break;
          case "top":
            nextPositions[step.id] = {
              top: rect.top + scrollY - 24,
              left: rect.left + scrollX + rect.width / 2,
            };
            break;
          case "right":
          default:
            nextPositions[step.id] = {
              top: rect.top + scrollY + rect.height / 2,
              left: rect.right + scrollX + 24,
            };
            break;
        }
      });

      setPositions(nextPositions);
    };

    updatePositions();
    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions, { passive: true });

    return () => {
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions);
    };
  }, [isVisible, steps]);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }

    setIsVisible(false);
  };

  const placementClass = useMemo(
    () => ({
      right: "-translate-y-1/2",
      left: "-translate-y-1/2 -translate-x-full",
      bottom: "-translate-x-1/2",
      top: "-translate-x-1/2 -translate-y-full",
    }),
    [],
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="pointer-events-none absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />

      <div className="absolute inset-0 pointer-events-none">
        {steps.map((step) => {
          const position = positions[step.id];
          if (!position) return null;

          const placement = step.placement ?? "right";

          return (
            <div
              key={step.id}
              style={{ top: position.top, left: position.left }}
              className={cn(
                "absolute pointer-events-auto max-w-xs",
                placementClass[placement],
              )}
            >
              <div className="relative rounded-xl border border-emerald-200 bg-white/95 p-4 shadow-xl shadow-emerald-200/40">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  {step.title}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
                <div className="absolute -top-3 right-3">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    Dica
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-6 right-6 flex items-center gap-3 rounded-full bg-white/95 px-4 py-2 shadow-lg shadow-emerald-200/40">
        <p className="text-sm text-slate-600">
          Comece por aqui para aproveitar todos os recursos.
        </p>
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          Entendi
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
