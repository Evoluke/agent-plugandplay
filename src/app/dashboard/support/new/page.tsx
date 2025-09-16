// app/support/new/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChangeEvent, FormEvent, useState } from "react"
import { toast } from "sonner"
import { CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const motivos = [
    { value: "bug", label: "Erro no sistema" },
    { value: "suporte", label: "Dúvida / Suporte" },
    { value: "feature", label: "Sugestão de melhoria" },
    { value: "other", label: "Outros" },
]

export default function NewSupportPage() {
  const [titulo, setTitulo] = useState("")
  const [motivo, setMotivo] = useState<string | undefined>(undefined)
  const [descricao, setDescricao] = useState("")
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [fileError, setFileError] = useState("")
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
  const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "application/pdf",
  ]
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileError("")
    const file = e.target.files?.[0] ?? null
    if (file && !ALLOWED_TYPES.includes(file.type)) {
      setArquivo(null)
      setFileError("Formato não suportado. Apenas PNG, JPG ou PDF.")
      e.currentTarget.value = ""
      return
    }
    if (file && file.size > MAX_FILE_SIZE) {
      setArquivo(null)
      setFileError("Arquivo muito grande (máx. 5 MB).")
      e.currentTarget.value = "" // limpa seleção
      return
    }
    setArquivo(file)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    if (fileError) {
      toast.error(fileError)
      return
    }

    if (!motivo) {
      toast.error("Por favor, selecione um motivo.")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("title", titulo)
      formData.append("reason", motivo)
      formData.append("description", descricao)
      if (arquivo) {
        formData.append("attachment", arquivo)
      }

      const res = await fetch("/api/support/new", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        let message = "Erro ao criar chamado."
        try {
          const err = await res.json()
          if (err?.error) message = err.error
        } catch (error) {
          console.error("Resposta inválida da API de suporte:", error)
        }
        toast.error("Erro: " + message)
        return
      }

      toast.success("Chamado criado!")
      router.push("/dashboard/support")
    } catch (error) {
      console.error("Erro ao enviar chamado:", error)
      toast.error("Erro ao enviar chamado.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-full px-4 sm:max-w-md md:max-w-lg">
        <Link href="/dashboard/support">
          <Button variant="ghost" className="mb-4">
            ← Voltar
          </Button>
        </Link>
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white p-6 rounded-lg shadow"
        >
          <CardTitle className="text-xl font-semibold text-gray-800 mb-6">Novo Chamado</CardTitle>

          <label className="block mb-1">Título do Chamado</label>
          <Input
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Digite o título"
            required
            maxLength={100}
            className="mb-4"
          />

          <label className="block mb-1">Motivo</label>
          <Select onValueChange={setMotivo} value={motivo}>
            <SelectTrigger className="w-full mb-4">
              <SelectValue placeholder="Selecione o motivo" />
            </SelectTrigger>
            <SelectContent>
              {motivos.map(m => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="block mb-1">Descrição</label>
          <Textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Explique em detalhes"
            required
            rows={5}
            maxLength={800}
            className="mb-4"
          />

          <label className="block mb-1">Anexo (PNG, JPG, PDF)</label>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={handleFileChange}
            className="mb-6 text-blue-600 hover:text-blue-800"
          />

          {fileError && <p className="text-sm text-destructive mb-4">{fileError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar"}
          </Button>
        </form>
      </div>
    </main>
  )
}
