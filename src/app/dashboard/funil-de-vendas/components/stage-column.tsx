'use client'

import { Droppable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Inbox, Loader2, Plus } from 'lucide-react'
import { DealCard, Stage } from '../types'
import { DealCardItem } from './deal-card-item'
import { formatCurrency } from '../helpers'

type StageColumnProps = {
  stage: Stage
  cards: DealCard[]
  onAddCard: (stageId: string) => void
  onEditCard: (card: DealCard) => void
  onDeleteCard: (card: DealCard) => void
  isLoading: boolean
}

export function StageColumn({
  stage,
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  isLoading,
}: StageColumnProps) {
  const totalValue = cards.reduce((sum, card) => sum + (card.mrr ?? 0), 0)
  const opportunitiesLabel = cards.length === 1 ? '1 oportunidade' : `${cards.length} oportunidades`

  return (
    <section
      aria-label={`Coluna do estágio ${stage.name}`}
      className="group flex h-full w-[320px] flex-shrink-0 flex-col rounded-3xl border border-slate-100 bg-gradient-to-b from-white/90 via-white/60 to-slate-50/60 p-4 shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="mb-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Estágio</p>
            <h3 className="text-lg font-semibold text-gray-900">{stage.name}</h3>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span
              aria-live="polite"
              className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary"
            >
              {opportunitiesLabel}
            </span>
            {totalValue > 0 ? (
              <span className="text-[11px] font-medium text-slate-400">
                MRR total {formatCurrency(totalValue)}
              </span>
            ) : null}
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Arraste oportunidades para atualizar prioridades ou use o botão abaixo para registrar uma nova.
        </p>
      </div>

      <Droppable droppableId={stage.id} isDropDisabled={isLoading}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex min-h-[160px] flex-1 flex-col gap-3 overflow-y-auto pr-1 transition-all duration-200 ease-out',
              snapshot.isDraggingOver
                ? 'rounded-2xl border border-primary/20 bg-primary/5 shadow-inner'
                : 'rounded-2xl bg-white/70'
            )}
            role="list"
            aria-label={`Oportunidades do estágio ${stage.name}`}
          >
            {isLoading ? (
              <div className="flex h-32 items-center justify-center text-gray-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando
              </div>
            ) : cards.length ? (
              cards.map((card, index) => (
                <DealCardItem
                  key={card.id}
                  card={card}
                  index={index}
                  onEdit={onEditCard}
                  onDelete={onDeleteCard}
                />
              ))
            ) : (
              <div className="flex h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300/80 bg-gradient-to-br from-white via-white to-slate-50 text-center text-xs font-medium text-slate-400">
                <Inbox className="h-5 w-5 text-slate-300" aria-hidden="true" />
                <span className="uppercase tracking-wide">Área pronta para novas oportunidades</span>
                <span className="text-[11px] font-normal capitalize text-slate-400">
                  Arraste um card ou clique em “Nova oportunidade”
                </span>
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <Button
        type="button"
        variant="ghost"
        className="mt-4 w-full justify-center rounded-xl border border-dashed border-slate-300/80 bg-white/80 text-sm font-medium text-gray-600 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
        onClick={() => onAddCard(stage.id)}
      >
        <Plus className="mr-2 h-4 w-4" /> Nova oportunidade
      </Button>
    </section>
  )
}
