'use client'

import { Draggable } from '@hello-pangea/dnd'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
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
import { DealCard, Pipeline } from '../types'
import { formatCurrency, formatShortDate } from '../helpers'

type DealCardItemProps = {
  card: DealCard
  index: number
  pipelines: Pipeline[]
  onEdit: (card: DealCard) => void
  onDelete: (card: DealCard) => void
  onTransfer: (card: DealCard, pipelineId: string) => void
}

export function DealCardItem({
  card,
  index,
  pipelines,
  onEdit,
  onDelete,
  onTransfer,
}: DealCardItemProps) {
  const lastContact = formatShortDate(card.last_message_at)
  const nextAction = formatShortDate(card.next_action_at)
  const otherPipelines = pipelines.filter((pipeline) => pipeline.id !== card.pipeline_id)

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
            <div className="min-w-0 space-y-1">
              <h4 className="clamp-2-lines text-sm font-semibold text-gray-900" title={card.title}>
                {card.title}
              </h4>
              {card.company_name ? (
                <p className="text-xs text-gray-500" title={card.company_name}>
                  <span className="block truncate">{card.company_name}</span>
                </p>
              ) : null}
            </div>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-500 hover:text-gray-800"
                  onClick={(event) => {
                    event.stopPropagation()
                  }}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className="z-50 min-w-[200px] rounded-md border border-slate-200 bg-white p-1.5 text-sm shadow-lg"
                >
                  {otherPipelines.length ? (
                    <DropdownMenu.Sub>
                      <DropdownMenu.SubTrigger className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-gray-700 outline-none transition hover:bg-slate-100 focus:bg-slate-100">
                        Transferir para outro funil
                      </DropdownMenu.SubTrigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.SubContent className="z-50 min-w-[220px] rounded-md border border-slate-200 bg-white p-1.5 text-sm shadow-lg">
                          {otherPipelines.map((pipeline) => (
                            <DropdownMenu.Item
                              key={pipeline.id}
                              className="cursor-pointer rounded-md px-3 py-2 text-gray-700 outline-none transition hover:bg-slate-100 focus:bg-slate-100"
                              onSelect={() => {
                                onTransfer(card, pipeline.id)
                              }}
                            >
                              {pipeline.name}
                            </DropdownMenu.Item>
                          ))}
                        </DropdownMenu.SubContent>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Sub>
                  ) : (
                    <DropdownMenu.Item
                      disabled
                      className="cursor-not-allowed rounded-md px-3 py-2 text-gray-400"
                    >
                      Nenhum outro funil disponível
                    </DropdownMenu.Item>
                  )}
                  <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />
                  <DropdownMenu.Item
                    className="cursor-pointer rounded-md px-3 py-2 text-destructive outline-none transition hover:bg-destructive/10 focus:bg-destructive/10"
                    onSelect={() => {
                      onDelete(card)
                    }}
                  >
                    Remover oportunidade
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
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
              <div className="flex min-w-0 items-center gap-2">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span className="flex-1 truncate" title={card.owner}>
                  {card.owner}
                </span>
              </div>
            ) : null}
            {lastContact ? (
              <div className="flex min-w-0 items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                <span>Último contato: {lastContact}</span>
              </div>
            ) : null}
            {nextAction ? (
              <div className="flex min-w-0 items-center gap-2 text-indigo-600">
                <Clock className="h-3.5 w-3.5" />
                <span>Próxima ação: {nextAction}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex justify-end text-[11px] text-gray-400">
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
