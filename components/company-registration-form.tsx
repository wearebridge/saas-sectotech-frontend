"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CompanyRegistrationForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminUsername: "",
    adminPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + "/public/register/company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      toast.success("Empresa registrada com sucesso!", {
        description: data.message || "Verifique seu email para ativação.",
      })
      
      // Reset form on success
      setFormData({
        companyName: "",
        adminFirstName: "",
        adminLastName: "",
        adminEmail: "",
        adminUsername: "",
        adminPassword: "",
      })
      
    } catch (error) {
      toast.error("Erro ao registrar empresa", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Registrar Empresa</CardTitle>
        <CardDescription>
          Crie uma nova conta de empresa e configure o administrador inicial.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da Empresa</Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="Ex: Luciano Tech"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adminFirstName">Nome do Admin</Label>
              <Input
                id="adminFirstName"
                name="adminFirstName"
                placeholder="Luciano"
                value={formData.adminFirstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminLastName">Sobrenome do Admin</Label>
              <Input
                id="adminLastName"
                name="adminLastName"
                placeholder="Citroni"
                value={formData.adminLastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminEmail">Email do Admin</Label>
            <Input
              id="adminEmail"
              name="adminEmail"
              type="email"
              placeholder="admin@empresa.com"
              value={formData.adminEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adminUsername">Usuário (Login)</Label>
              <Input
                id="adminUsername"
                name="adminUsername"
                placeholder="joaosilva"
                value={formData.adminUsername}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Senha</Label>
              <Input
                id="adminPassword"
                name="adminPassword"
                type="password"
                value={formData.adminPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Criar Empresa"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
