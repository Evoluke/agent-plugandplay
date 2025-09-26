'use client'

import { Droppable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
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
  return (
    <div className="flex h-full w-[320px] flex-shrink-0 flex-col rounded-2xl bg-slate-50/80 p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Estágio</p>
          <h3 className="text-lg font-semibold text-gray-900">{stage.name}</h3>
          <p className="text-xs text-gray-500">{cards.length} oportunidades</p>
        </div>
      </div>

      <Droppable droppableId={stage.id} isDropDisabled={isLoading}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 space-y-3 overflow-y-auto pr-1"
          >
            {isLoading ? (
              <div className="flex h-32 items-center justify-center text-gray-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Carregando
              </div>
            ) : (
              cards.map((card, index) => (
                <DealCardItem
                  key={card.id}
                  card={card}
                  index={index}
                  onEdit={onEditCard}
                  onDelete={onDeleteCard}
                />
              ))
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
