'use client'

import { Droppable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2, Plus } from 'lucide-react'
import { DealCard, Stage } from '../types'
import { DealCardItem } from './deal-card-item'

function normalizeHexColor(value: string) {
  const hex = value.trim()
  const match = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex)
  if (!match) return null
  const normalized = match[1]
  if (normalized.length === 3) {
    return `#${normalized
      .split('')
      .map((char) => char.repeat(2))
      .join('')}`
  }
  return `#${normalized}`
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = normalizeHexColor(hex)
  if (!normalized) return null
  const value = normalized.slice(1)
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  const clampedAlpha = Math.min(1, Math.max(0, alpha))
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`
}

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
  const accentColor = stage.background_color ?? null
  const gradientStart = accentColor ? hexToRgba(accentColor, 0.24) : null
  const gradientEnd = accentColor ? hexToRgba(accentColor, 0.08) : null
  const borderColor = accentColor ? hexToRgba(accentColor, 0.38) : null
  const dragHoverColor = accentColor ? hexToRgba(accentColor, 0.22) : null
  const fallbackBackground = accentColor ? hexToRgba(accentColor, 0.12) : null

  const columnStyles = accentColor
    ? {
        background:
          gradientStart && gradientEnd
            ? `linear-gradient(180deg, ${gradientStart} 0%, ${gradientEnd} 100%)`
            : fallbackBackground ?? accentColor,
        borderColor: borderColor ?? accentColor,
      }
    : undefined

  const emptyStateStyles = accentColor
    ? {
        borderColor: hexToRgba(accentColor, 0.45) ?? accentColor,
        backgroundColor: hexToRgba(accentColor, 0.16) ?? undefined,
      }
    : undefined

  const addButtonStyles = accentColor
    ? {
        borderColor: hexToRgba(accentColor, 0.4) ?? accentColor,
        backgroundColor: hexToRgba(accentColor, 0.12) ?? undefined,
      }
    : undefined

  return (
    <div
      className={cn(
        'flex h-full min-w-[260px] flex-shrink-0 flex-col rounded-2xl border border-transparent bg-slate-50/80 p-4 shadow-sm',
        'w-full snap-start sm:w-[280px] lg:w-[320px]'
      )}
      style={columnStyles}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-600">Estágio</p>
          <h3 className="text-lg font-semibold text-gray-900">{stage.name}</h3>
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
            style={
              accentColor && snapshot.isDraggingOver
                ? { backgroundColor: dragHoverColor ?? undefined }
                : undefined
            }
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
              <div
                className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/70 text-xs font-medium uppercase tracking-wide text-slate-600"
                style={emptyStateStyles}
              >
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
        className="mt-4 w-full justify-center border border-dashed border-slate-300 bg-white/60 text-sm text-gray-600 transition-colors hover:bg-white/80"
        style={addButtonStyles}
        onClick={() => onAddCard(stage.id)}
      >
        <Plus className="mr-2 h-4 w-4" /> Nova oportunidade
      </Button>
    </div>
  )
}
