'use client'

import { FormEvent } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DealCard, CardFormState } from '../types'

type CardDialogProps = {
  open: boolean
  editingCard: DealCard | null
  form: CardFormState
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onChangeField: <K extends keyof CardFormState>(field: K, value: CardFormState[K]) => void
}

export function CardDialog({ open, editingCard, form, onClose, onSubmit, onChangeField }: CardDialogProps) {
  if (!open) {
    return null
  }

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            {editingCard ? 'Editar oportunidade' : 'Nova oportunidade'}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-gray-500">
            Mantenha as informações atualizadas para priorizar o follow-up.
          </Dialog.Description>

          <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Contato / Empresa</label>
              <Input
                value={form.title}
                onChange={(event) => onChangeField('title', event.target.value)}
                placeholder="Ex.: Ana Souza - InovaTech"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Empresa</label>
              <Input
                value={form.companyName}
                onChange={(event) => onChangeField('companyName', event.target.value)}
                placeholder="Nome da empresa"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Responsável</label>
              <Input
                value={form.owner}
                onChange={(event) => onChangeField('owner', event.target.value)}
                placeholder="Quem está cuidando"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Input
                value={form.status}
                onChange={(event) => onChangeField('status', event.target.value)}
                placeholder="Ex.: Qualificado, Em risco"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tag</label>
              <Input
                value={form.tag}
                onChange={(event) => onChangeField('tag', event.target.value)}
                placeholder="Ex.: Trial, Prioridade"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">MRR estimado (R$)</label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.mrr}
                onChange={(event) => onChangeField('mrr', event.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mensagens</label>
              <Input
                type="number"
                min={0}
                value={form.messagesCount}
                onChange={(event) => onChangeField('messagesCount', event.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Último contato</label>
              <Input
                type="datetime-local"
                value={form.lastMessageAt}
                onChange={(event) => onChangeField('lastMessageAt', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Próxima ação</label>
              <Input
                type="datetime-local"
                value={form.nextActionAt}
                onChange={(event) => onChangeField('nextActionAt', event.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
