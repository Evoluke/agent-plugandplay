'use client'

import { Droppable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2, Plus } from 'lucide-react'
import { DealCard, Stage } from '../types'
import { DealCardItem } from './deal-card-item'

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
  const stageColor = stage.color ?? '#CBD5F5'

  return (
    <div
      className={cn(
        'flex h-full min-w-[260px] flex-shrink-0 flex-col rounded-2xl border-t-4 border-transparent bg-slate-50/80 p-4 shadow-sm',
        'w-full snap-start sm:w-[280px] lg:w-[320px]'
      )}
      style={{ borderTopColor: stageColor }}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-600">Estágio</p>
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: stageColor }}
            />
            <h3 className="text-lg font-semibold text-gray-900">{stage.name}</h3>
          </div>
          <p className="text-xs text-gray-500">{cards.length} oportunidades</p>
        </div>
      </div>

      <Droppable droppableId={stage.id} isDropDisabled={isLoading}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex min-h-[120px] flex-1 flex-col gap-3 overflow-y-auto pr-1 transition-colors',
              snapshot.isDraggingOver ? 'bg-white/80' : undefined
            )}
          >
            {isLoading ? (
              <div className="flex h-32 items-center justify-center text-gray-600">
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
              <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/70 text-xs font-medium uppercase tracking-wide text-slate-600">
                Arraste oportunidades para cá
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <Button
        type="button"
        variant="ghost"
        className="mt-4 w-full justify-center border border-dashed border-slate-300 bg-white/60 text-sm text-gray-600 hover:border-primary hover:text-primary"
        onClick={() => onAddCard(stage.id)}
      >
        <Plus className="mr-2 h-4 w-4" /> Nova oportunidade
      </Button>
    </div>
  )
}
