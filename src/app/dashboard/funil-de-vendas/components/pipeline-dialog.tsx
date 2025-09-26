'use client'

import { FormEvent, useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import {
  MAX_STAGES_PER_PIPELINE,
  PIPELINE_DESCRIPTION_MAX_LENGTH,
  PIPELINE_NAME_MAX_LENGTH,
  STAGE_NAME_MAX_LENGTH,
} from '../constants'
import { Pipeline, PipelineFormState } from '../types'
import { Modal } from './modal'

type PipelineDialogProps = {
  open: boolean
  form: PipelineFormState
  loading: boolean
  editingPipeline: Pipeline | null
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onUpdateStageName: (index: number, value: string) => void
  onUpdateStageColor: (index: number, value: string) => void
  onAddStage: () => void
  onRemoveStage: (index: number) => void
  onChangeField: (field: 'name' | 'description', value: string) => void
}

export function PipelineDialog({
  open,
  form,
  loading,
  editingPipeline,
  onClose,
  onSubmit,
  onUpdateStageName,
  onUpdateStageColor,
  onAddStage,
  onRemoveStage,
  onChangeField,
}: PipelineDialogProps) {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      describedBy={descriptionId}
      contentClassName="max-w-md"
    >
      <h2 id={titleId} className="text-lg font-semibold text-gray-900">
        {editingPipeline ? 'Editar funil' : 'Novo funil'}
      </h2>
      <p id={descriptionId} className="mt-1 text-sm text-gray-500">
        Configure detalhes do funil e organize todos os estágios antes de colocar o board em produção.
      </p>

      <form className="mt-4 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Nome do funil</label>
          <Input
            value={form.name}
            onChange={(event) => onChangeField('name', event.target.value)}
            placeholder="Ex.: Aquisição, Expansão, Ativação"
            required
            disabled={loading}
            maxLength={PIPELINE_NAME_MAX_LENGTH}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            className="h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={form.description}
            onChange={(event) => onChangeField('description', event.target.value)}
            placeholder="Explique o objetivo deste funil para o time."
            disabled={loading}
            maxLength={PIPELINE_DESCRIPTION_MAX_LENGTH}
          />
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-sm font-medium text-gray-700">Estágios do funil</label>
            <p className="text-xs text-gray-500">
              Gerencie as etapas que representam o avanço das oportunidades. ({form.stages.length}/
              {MAX_STAGES_PER_PIPELINE})
            </p>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 px-3 py-4 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando estágios...
            </div>
          ) : (
            <div className="space-y-3">
              {form.stages.map((stage, index) => (
                <div key={stage.id ?? `novo-estagio-${index}`} className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-xs font-medium text-gray-500">
                    {index + 1}
                  </span>
                  <div className="flex flex-1 items-center gap-2">
                    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1">
                      <span className="text-xs text-gray-500">Cor</span>
                      <input
                        type="color"
                        value={stage.color}
                        onChange={(event) => onUpdateStageColor(index, event.target.value)}
                        className="h-6 w-8 cursor-pointer rounded border border-slate-200 bg-white p-0"
                        aria-label={`Selecionar cor do estágio ${index + 1}`}
                        disabled={loading}
                      />
                    </div>
                    <Input
                      className="flex-1"
                      value={stage.name}
                      onChange={(event) => onUpdateStageName(index, event.target.value)}
                      placeholder={`Estágio ${index + 1}`}
                      disabled={loading}
                      maxLength={STAGE_NAME_MAX_LENGTH}
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-destructive hover:text-destructive"
                    onClick={() => onRemoveStage(index)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remover estágio</span>
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center border-dashed"
                onClick={onAddStage}
                disabled={loading || form.stages.length >= MAX_STAGES_PER_PIPELINE}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar estágio
              </Button>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
              </span>
            ) : (
              'Salvar funil'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
