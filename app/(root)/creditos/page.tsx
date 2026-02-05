"use client"

import React, { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useKeycloak } from '@/lib/keycloak'
import { Coins, CreditCard, Loader2 } from 'lucide-react'
import { CreditPackage } from '@/types/package'

// Initialize Stripe outside component to avoid recreation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function Page() {
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [loading, setLoading] = useState(false)
  const [currentCredits, setCurrentCredits] = useState<number | null>(null)
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')
  const sessionId = searchParams.get('session_id') // Get session_id
    
  const { token, authenticated, keycloak } = useKeycloak()
  const isAdmin = keycloak?.hasRealmRole('SYSTEM_ADMIN') || false;

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    if (success && sessionId && token) { 
        // Force verification on success return if session_id is present
        const verifyPayment = async () => {
             try {
                 const res = await fetch(`${apiUrl}/payment/verify-payment/${sessionId}`, {
                     headers: { 'Authorization': `Bearer ${token}` }
                 })
                 if (res.ok) {
                     const data = await res.json()
                     if (data.success) {
                         toast.success("Pagamento confirmado e créditos adicionados!")
                         // Refresh credits immediately
                         fetchCredits()
                     }
                 }
             } catch (e) {
                 console.error("Verification failed", e)
             }
        }
        verifyPayment()
    } else if (success) {
      toast.success("Pagamento realizado! Verificando créditos...")
    }

    if (canceled) {
      toast.error("Pagamento cancelado.")
    }

    // Fetch packages
    const fetchPackages = async () => {
       if (!token) return;
        try {
            console.log("Fetching packages from:", `${apiUrl}/packages`);
            const res = await fetch(`${apiUrl}/packages`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (res.ok) {
                const data = await res.json()
                setPackages(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    // Fetch credits
    const fetchCredits = async () => {
        if (!token || !keycloak?.tokenParsed) return;
        
        const companyId = (keycloak.tokenParsed as any).companyId;
        if (!companyId) return;

        try {
             const res = await fetch(`${apiUrl}/companyCredits/byCompanyId/${companyId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
             })
             if (res.ok) {
                const data = await res.json()
                setCurrentCredits(data.creditAmount)
             }
        } catch (error) {
            console.error("Failed to fetch credits", error)
        }
     }
    
    if (authenticated) {
        fetchPackages()
        fetchCredits()
    }
  }, [success, canceled, token, authenticated, keycloak])

  const handleBuy = async (packageId: string) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${apiUrl}/payment/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ packageId }),
      });

      if (!res.ok) {
         toast.error("Erro ao iniciar pagamento");
         return;
      }
      
      const { url } = await res.json();
      window.location.href = url;

    } catch(err) {
        console.error(err);
        toast.error("Erro desconhecido");
    } finally {
        setLoading(false);
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)
  }

  return (
    <div className="container max-w-5xl mx-auto py-10 space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Créditos</h1>
        <p className="text-muted-foreground">
            Acompanhe seu saldo e adquira novos pacotes para continuar utilizando nossos serviços.
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
                {currentCredits !== null ? currentCredits : <Loader2 className="h-6 w-6 animate-spin" />}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-primary-foreground/70">
                Utilize seus créditos para validar áudios e gerar relatórios.
            </p>
        </CardContent>
      </Card>

      <PackagesGrid 
        packages={packages} 
        loading={loading} 
        onBuy={handleBuy} 
        formatCurrency={formatCurrency} 
      />
    </div>
  )
}


function PackagesGrid({ 
    packages, 
    loading, 
    onBuy, 
    formatCurrency 
}: { 
    packages: CreditPackage[], 
    loading: boolean, 
    onBuy: (id: string) => void, 
    formatCurrency: (val: number) => string 
}) {
  return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pacotes Disponíveis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.length === 0 && !loading ? (
                <div className="col-span-3 text-center py-10 text-muted-foreground">
                    Carregando pacotes ou nenhum disponível...
                </div>
            ) : null}

            {packages.map((pack) => (
            <Card key={pack.id} className="flex flex-col relative overflow-hidden transition-all hover:shadow-md border-muted">
                <div className="absolute top-0 right-0 p-3 bg-muted/50 rounded-bl-xl">
                   <Coins className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardHeader>
                    <CardTitle className="text-xl">{pack.name}</CardTitle>
                    <CardDescription className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">
                            {pack.credits}
                        </span>
                        <span>créditos</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pt-6">
                    <div className="text-2xl font-bold text-primary">
                        {formatCurrency(pack.priceInCents)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Pagamento único
                    </p>
                </CardContent>
                <CardFooter className="pt-4">
                <Button 
                    onClick={() => onBuy(pack.identifier)} 
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
  )
}

export default Page
