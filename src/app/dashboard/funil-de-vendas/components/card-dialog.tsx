'use client'

import { FormEvent, useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CARD_CONTACT_MAX_LENGTH } from '../constants'
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
        Cadastre o contato responsável e organize as oportunidades por estágio.
      </p>

      <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
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
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Contato</label>
          <Input
            value={form.contact}
            onChange={(event) => onChangeField('contact', event.target.value)}
            placeholder="Ex.: Ana Souza"
            required
            maxLength={CARD_CONTACT_MAX_LENGTH}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>

      <p className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
        <Sparkles className="h-4 w-4" /> Estamos trabalhando em novas ferramentas e campos.
      </p>
    </Modal>
  )
}
