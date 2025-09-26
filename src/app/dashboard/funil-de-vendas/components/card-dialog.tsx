'use client'

import { FormEvent, useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CARD_COMPANY_MAX_LENGTH,
  CARD_OWNER_MAX_LENGTH,
  CARD_STATUS_MAX_LENGTH,
  CARD_TAG_MAX_LENGTH,
  CARD_TITLE_MAX_LENGTH,
} from '../constants'
import { CardFormState, DealCard, Stage } from '../types'
import { Modal } from './modal'

type CardDialogProps = {
  open: boolean
  editingCard: DealCard | null
  form: CardFormState
  stages: Stage[]
  selectedStageId: string | null
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onChangeField: <K extends keyof CardFormState>(field: K, value: CardFormState[K]) => void
  onSelectStage: (stageId: string) => void
}

export function CardDialog({
  open,
  editingCard,
  form,
  stages,
  selectedStageId,
  onClose,
  onSubmit,
  onChangeField,
  onSelectStage,
}: CardDialogProps) {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      describedBy={descriptionId}
      contentClassName="max-w-2xl"
    >
      <h2 id={titleId} className="text-lg font-semibold text-gray-900">
        {editingCard ? 'Editar oportunidade' : 'Nova oportunidade'}
      </h2>
      <p id={descriptionId} className="mt-1 text-sm text-gray-500">
        Mantenha as informações atualizadas para priorizar o follow-up.
      </p>

      <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Estágio</label>
          <Select
            value={selectedStageId ?? ''}
            onValueChange={(value) => {
              onSelectStage(value)
            }}
            disabled={!stages.length}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um estágio" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: stage.color ?? '#CBD5F5' }}
                    />
                    <span>{stage.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Contato / Empresa</label>
          <Input
            value={form.title}
            onChange={(event) => onChangeField('title', event.target.value)}
            placeholder="Ex.: Ana Souza - InovaTech"
            required
            maxLength={CARD_TITLE_MAX_LENGTH}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Empresa</label>
          <Input
            value={form.companyName}
            onChange={(event) => onChangeField('companyName', event.target.value)}
            placeholder="Nome da empresa"
            maxLength={CARD_COMPANY_MAX_LENGTH}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Responsável</label>
          <Input
            value={form.owner}
            onChange={(event) => onChangeField('owner', event.target.value)}
            placeholder="Quem está cuidando"
            maxLength={CARD_OWNER_MAX_LENGTH}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Input
            value={form.status}
            onChange={(event) => onChangeField('status', event.target.value)}
            placeholder="Ex.: Qualificado, Em risco"
            maxLength={CARD_STATUS_MAX_LENGTH}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Tag</label>
          <Input
            value={form.tag}
            onChange={(event) => onChangeField('tag', event.target.value)}
            placeholder="Ex.: Trial, Prioridade"
            maxLength={CARD_TAG_MAX_LENGTH}
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
    </Modal>
  )
}
