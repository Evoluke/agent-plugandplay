'use client'

import { Draggable } from '@hello-pangea/dnd'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, MoreHorizontal } from 'lucide-react'
import { DealCard, Pipeline } from '../types'

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
              <h4 className="clamp-2-lines text-sm font-semibold text-gray-900" title={card.contact}>
                {card.contact}
              </h4>
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
