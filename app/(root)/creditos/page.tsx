"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useKeycloak } from '@/lib/keycloak'
import { useCredit } from '@/lib/credit-context'
import { Coins, CreditCard, Loader2, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StripeProduct } from '@/types/package'

function Page() {
  const [products, setProducts] = useState<StripeProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')
  const sessionId = searchParams.get('session_id')
    
  const { token, authenticated, keycloak } = useKeycloak()
  const { credits: currentCredits, loading: creditsLoading, refreshCredits } = useCredit()

  const recurringProducts = useMemo(
    () => products.filter(p => p.type === 'recurring'),
    [products]
  )
  const oneTimeProducts = useMemo(
    () => products.filter(p => p.type === 'one_time'),
    [products]
  )

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    if (success && sessionId && token) { 
      const verifyPayment = async () => {
        setVerifyingPayment(true)
        try {
          const res = await fetch(`${apiUrl}/payment/verify-payment/${sessionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (res.ok) {
            const data = await res.json()
            if (data.success) {
              toast.success("Pagamento confirmado e créditos adicionados!")
              await refreshCredits()
            }
          }
        } catch (e) {
          console.error("Verification failed", e)
        } finally {
          setVerifyingPayment(false)
        }
      }
      verifyPayment()
    } else if (success) {
      toast.success("Pagamento realizado! Verificando créditos...")
    }

    if (canceled) {
      toast.error("Pagamento cancelado.")
    }

    const fetchProducts = async () => {
      if (!token) return
      setLoadingProducts(true)
      try {
        const res = await fetch(`${apiUrl}/packages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setProducts(data)
        }
      } catch (error) {
        console.error(error)
        toast.error("Erro ao carregar produtos")
      } finally {
        setLoadingProducts(false)
      }
    }

    if (authenticated) {
      fetchProducts()
    }
  }, [success, canceled, token, authenticated, keycloak])

  const handleBuy = async (priceId: string) => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${apiUrl}/payment/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ priceId }),
      })

      if (!res.ok) {
        toast.error("Erro ao iniciar pagamento")
        return
      }
      
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      console.error(err)
      toast.error("Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (cents: number | string | null | undefined) => {
    const numericValue = typeof cents === 'string' ? parseInt(cents, 10) : cents
    if (!numericValue || isNaN(numericValue)) {
      return 'R$ 0,00'
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue / 100)
  }

  const formatInterval = (interval?: string) => {
    switch (interval) {
      case 'month': return '/mês'
      case 'year': return '/ano'
      case 'week': return '/semana'
      case 'day': return '/dia'
      default: return ''
    }
  }

  return (
    <div className="container max-w-5xl mx-auto py-10 space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Créditos</h1>
        <p className="text-muted-foreground">
          Acompanhe seu saldo e adquira créditos para continuar utilizando nossos serviços.
        </p>
      </div>
      
      {/* Current Balance Card */}
      <Card className="bg-primary text-primary-foreground border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardDescription className="text-primary-foreground/80 font-medium">
            Saldo Disponível
          </CardDescription>
          <CardTitle className="text-4xl font-bold flex items-center gap-2">
            <Coins className="h-8 w-8" />
            {creditsLoading || verifyingPayment ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              currentCredits
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-primary-foreground/70">
            Utilize seus créditos para validar áudios e gerar relatórios.
          </p>
        </CardContent>
      </Card>

      {loadingProducts ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Recurring Plans */}
          {recurringProducts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Planos Recorrentes
              </h2>
              <p className="text-sm text-muted-foreground">
                Receba créditos automaticamente a cada cobrança.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recurringProducts.map((product) => (
                  <Card key={product.priceId} className="flex flex-col relative overflow-hidden transition-all hover:shadow-md border-muted">
                    <div className="absolute top-0 right-0 p-2">
                      <Badge variant="secondary">
                        Recorrente
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">{product.name}</CardTitle>
                      <CardDescription className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">
                          {product.credits}
                        </span>
                        <span>créditos{formatInterval(product.interval)}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pt-6">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(product.unitAmount)}{formatInterval(product.interval)}
                      </div>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {product.description}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="pt-4">
                      <Button 
                        onClick={() => handleBuy(product.priceId)} 
                        disabled={loading}
                        className="w-full"
                        size="lg"
                      >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Assinar
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* One-time Packages */}
          {oneTimeProducts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pacotes Avulsos
              </h2>
              <p className="text-sm text-muted-foreground">
                Compra única de créditos sem compromisso.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {oneTimeProducts.map((product) => (
                  <Card key={product.priceId} className="flex flex-col relative overflow-hidden transition-all hover:shadow-md border-muted">
                    <div className="absolute top-0 right-0 p-3 bg-muted/50 rounded-bl-xl">
                      <Coins className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">{product.name}</CardTitle>
                      <CardDescription className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">
                          {product.credits}
                        </span>
                        <span>créditos</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pt-6">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(product.unitAmount)}
                      </div>
                      {product.description ? (
                        <p className="text-sm text-muted-foreground mt-2">
                          {product.description}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">
                          Pagamento único
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="pt-4">
                      <Button 
                        onClick={() => handleBuy(product.priceId)} 
                        disabled={loading}
                        className="w-full"
                        size="lg"
                      >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Comprar Agora
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {products.length === 0 && (
            <Card>
              <CardContent className="text-center py-10 text-muted-foreground">
                Nenhum produto disponível no momento.
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

export default Page
