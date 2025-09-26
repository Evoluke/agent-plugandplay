'use client'

import { FormEvent } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Pipeline, PipelineFormState } from '../types'

type PipelineDialogProps = {
  open: boolean
  form: PipelineFormState
  loading: boolean
  editingPipeline: Pipeline | null
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onUpdateStageName: (index: number, value: string) => void
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
  onAddStage,
  onRemoveStage,
  onChangeField,
}: PipelineDialogProps) {
  if (!open) {
    return null
  }

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            {editingPipeline ? 'Editar funil' : 'Novo funil'}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-gray-500">
            Configure detalhes do funil e organize todos os estágios antes de colocar o board em produção.
          </Dialog.Description>

          <form className="mt-4 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nome do funil</label>
              <Input
                value={form.name}
                onChange={(event) => onChangeField('name', event.target.value)}
                placeholder="Ex.: Aquisição, Expansão, Ativação"
                required
                disabled={loading}
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
              />
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Estágios do funil</label>
                <p className="text-xs text-gray-500">Gerencie as etapas que representam o avanço das oportunidades.</p>
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
                      <Input
                        value={stage.name}
                        onChange={(event) => onUpdateStageName(index, event.target.value)}
                        placeholder={`Estágio ${index + 1}`}
                        disabled={loading}
                      />
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
                    disabled={loading}
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
