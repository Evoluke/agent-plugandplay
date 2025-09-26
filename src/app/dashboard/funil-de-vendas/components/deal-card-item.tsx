'use client'

import { Draggable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  MoreHorizontal,
  User,
} from 'lucide-react'
import { DealCard } from '../types'
import { formatCurrency, formatShortDate } from '../helpers'

type DealCardItemProps = {
  card: DealCard
  index: number
  onEdit: (card: DealCard) => void
  onDelete: (card: DealCard) => void
}

export function DealCardItem({ card, index, onEdit, onDelete }: DealCardItemProps) {
  const lastContact = formatShortDate(card.last_message_at)
  const nextAction = formatShortDate(card.next_action_at)

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          className={cn(
            'rounded-xl border bg-white p-4 shadow-sm transition-shadow',
            snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/30' : 'hover:shadow-md'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-gray-900">{card.title}</h4>
              {card.company_name ? (
                <p className="text-xs text-gray-500">{card.company_name}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-1">
              {card.tag ? (
                <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                  {card.tag}
                </span>
              ) : null}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-500 hover:text-gray-800"
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit(card)
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {card.status ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {card.status}
              </span>
            ) : null}
            {card.mrr ? (
              <span className="rounded-full bg-purple-50 px-2 py-1 font-medium text-purple-600">
                {formatCurrency(card.mrr)} MRR
              </span>
            ) : null}
            {card.messages_count ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">
                <MessageSquare className="h-3.5 w-3.5" />
                {card.messages_count} mensagens
              </span>
            ) : null}
          </div>

          <div className="mt-4 space-y-2 text-xs text-gray-500">
            {card.owner ? (
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span>{card.owner}</span>
              </div>
            ) : null}
            {lastContact ? (
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                <span>Último contato: {lastContact}</span>
              </div>
            ) : null}
            {nextAction ? (
              <div className="flex items-center gap-2 text-indigo-600">
                <Clock className="h-3.5 w-3.5" />
                <span>Próxima ação: {nextAction}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400">
            <button
              type="button"
              className="font-medium text-destructive hover:underline"
              onClick={(event) => {
                event.stopPropagation()
                onDelete(card)
              }}
            >
              Remover
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              onClick={(event) => {
                event.stopPropagation()
                onEdit(card)
              }}
            >
              Abrir detalhes
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  )
}
