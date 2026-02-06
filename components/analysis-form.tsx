"use client"

import { useState, useRef, useCallback } from "react"
import { useKeycloak } from "@/lib/keycloak"
import { Script, AnalysisRequest, AnalysisResult } from "@/types/analysis"
import { ScriptSelector } from "./script-selector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Upload, FileAudio, Loader2, CheckCircle, XCircle, CreditCard } from "lucide-react"
import { useCredit } from "@/lib/credit-context"

export function AnalysisForm() {
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [clientName, setClientName] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioDuration, setAudioDuration] = useState<number | null>(null)
  const [estimatedCredits, setEstimatedCredits] = useState<number | null>(null)
  const [isCalculatingCredits, setIsCalculatingCredits] = useState(false)
  const [scriptAnswers, setScriptAnswers] = useState<Record<string, string>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { token } = useKeycloak()
  const { refreshCredits } = useCredit()

  const handleScriptSelect = useCallback((script: Script | null) => {
    setSelectedScript(script)
    setScriptAnswers({})
    setAnalysisResult(null)
    
    if (script?.scriptItems) {
      const initialAnswers: Record<string, string> = {}
      script.scriptItems.forEach(item => {
        initialAnswers[item.id] = item.answer || ""
      })
      setScriptAnswers(initialAnswers)
    }
  }, [])

  const handleAnswerChange = (itemId: string, answer: string) => {
    setScriptAnswers(prev => ({
      ...prev,
      [itemId]: answer
    }))
  }

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      audio.src = URL.createObjectURL(file)
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(audio.src)
        resolve(audio.duration)
      })
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(audio.src)
        reject(new Error('Erro ao carregar áudio'))
      })
    })
  }

  const calculateEstimatedCredits = async (durationInSeconds: number) => {
    if (!token) return null

    try {
      setIsCalculatingCredits(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const response = await fetch(`${apiUrl}/analyze/calculate-credits?duration=${durationInSeconds}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao calcular créditos')
      }

      const result = await response.json()
      return result.estimatedCredits
    } catch (error) {
      console.error('Erro ao calcular créditos:', error)
      toast.error('Erro ao calcular custo estimado')
      return null
    } finally {
      setIsCalculatingCredits(false)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Verificar se é um arquivo de áudio
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/m4a']
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a)$/i)) {
        toast.error("Por favor, selecione um arquivo de áudio válido (MP3, WAV, OGG, M4A)")
        return
      }

      setAudioFile(file)
      setAudioDuration(null)
      setEstimatedCredits(null)

      try {
        const duration = await getAudioDuration(file)
        setAudioDuration(duration)

        const credits = await calculateEstimatedCredits(duration)
        setEstimatedCredits(credits)
      } catch (error) {
        console.error('Erro ao processar áudio:', error)
        toast.error('Erro ao processar arquivo de áudio')
      }
    }
  }

  const handleSubmit = async () => {
    if (!token) {
      toast.error("Você não está autenticado")
      return
    }

    if (!selectedScript) {
      toast.error("Por favor, selecione um script")
      return
    }

    if (!clientName.trim()) {
      toast.error("Por favor, informe o nome do cliente")
      return
    }

    if (!audioFile) {
      toast.error("Por favor, forneça um arquivo de áudio")
      return
    }

    // Verificar se todas as respostas foram preenchidas
    const unansweredQuestions = selectedScript.scriptItems?.filter(item => 
      !scriptAnswers[item.id]?.trim()
    )
    
    if (unansweredQuestions && unansweredQuestions.length > 0) {
      toast.error("Por favor, responda todas as perguntas do script")
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      const formData = new FormData()
      
      // Preparar dados do request
      const requestData: AnalysisRequest = {
        clientName: clientName.trim(),
        scriptId: selectedScript.id,
        scriptItems: selectedScript.scriptItems?.map(item => ({
          question: item.question,
          answer: scriptAnswers[item.id].trim()
        })) || []
      }

      formData.append('data', new Blob([JSON.stringify(requestData)], {
        type: 'application/json'
      }))

      if (audioFile) {
        formData.append('file', audioFile)
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const response = await fetch(`${apiUrl}/analyze/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Erro ao realizar análise: ${response.statusText}`)
      }

      const result: AnalysisResult = await response.json()
      setAnalysisResult(result)
      toast.success("Análise realizada com sucesso!")

      // Atualizar créditos após análise bem-sucedida
      await refreshCredits()

    } catch (error) {
      console.error("Erro na análise:", error)
      toast.error("Erro ao realizar análise. Tente novamente.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetForm = () => {
    setSelectedScript(null)
    setClientName("")
    setAudioFile(null)
    setAudioDuration(null)
    setEstimatedCredits(null)
    setScriptAnswers({})
    setAnalysisResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <ScriptSelector 
        onScriptSelect={handleScriptSelect} 
        selectedScript={selectedScript}
      />

      {selectedScript && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Dados da Análise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clientName">Nome do Cliente *</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Digite o nome do cliente"
                />
              </div>

              <div>
                <Label>Arquivo de Áudio (opcional)</Label>
                <div className="mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                    disabled={isCalculatingCredits}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {audioFile ? audioFile.name : "Selecionar arquivo de áudio"}
                    {isCalculatingCredits && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.mp3,.wav,.ogg,.m4a"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {audioFile && (
                    <div className="mt-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <FileAudio className="w-4 h-4 mr-1" />
                        Arquivo selecionado: {audioFile.name}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {audioFile && audioDuration !== null && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Estimativa de Custo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Duração do áudio: <span className="font-medium">{Math.ceil(audioDuration)} segundos</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Taxa: 1 crédito por 60 segundos
                    </p>
                  </div>
                  
                  <div className="text-right">
                    {isCalculatingCredits ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-sm text-muted-foreground">Calculando...</span>
                      </div>
                    ) : estimatedCredits !== null ? (
                      <div className="space-y-1">
                        <Badge variant="default" className="text-base px-3 py-1 bg-blue-600 hover:bg-blue-700">
                          {estimatedCredits} {estimatedCredits === 1 ? 'Crédito' : 'Créditos'}
                        </Badge>
                        <p className="text-xs text-muted-foreground">serão descontados</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {selectedScript && selectedScript.scriptItems && (
        <Card>
          <CardHeader>
            <CardTitle>Script: {selectedScript.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedScript.scriptItems.map((item, index) => (
                <div key={item.id} className="space-y-2">
                  <Label className="text-sm font-medium">
                    Pergunta {index + 1}
                  </Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">{item.question}</p>
                  </div>
                  <Label htmlFor={`answer-${item.id}`} className="text-sm font-medium">
                    Resposta Esperada *
                  </Label>
                  <Textarea
                    id={`answer-${item.id}`}
                    value={scriptAnswers[item.id] || ""}
                    onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                    placeholder="Digite a resposta esperada para esta pergunta"
                    rows={2}
                  />
                  {index < selectedScript.scriptItems!.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedScript && (
        <div className="flex gap-4">
          <Button 
            onClick={handleSubmit} 
            disabled={isAnalyzing}
            className="flex-1"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              "Realizar Análise"
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={resetForm}
            disabled={isAnalyzing}
          >
            Limpar
          </Button>
        </div>
      )}

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Resultado da Análise
              <Badge variant={analysisResult.approved ? "default" : "destructive"}>
                {analysisResult.approved ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Aprovado
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Reprovado
                  </>
                )}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisResult.transcription && (
              <div>
                <Label className="text-sm font-medium">Transcrição</Label>
                <div className="p-3 bg-muted rounded-md mt-1">
                  <p className="text-sm">{analysisResult.transcription}</p>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium">Análise por Pergunta</Label>
              <div className="space-y-3 mt-2">
                {analysisResult.output.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Pergunta {index + 1}</span>
                      <Badge variant={item.correct ? "default" : "destructive"}>
                        {item.correct ? "Correto" : "Incorreto"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Pergunta:</span>
                        <p className="text-sm">{item.question}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Resposta:</span>
                        <p className="text-sm">{item.answer}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Análise:</span>
                        <p className="text-sm">{item.analysis}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}