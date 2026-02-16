'use client'

import { useEffect, useState, useCallback } from 'react'
import { useKeycloak } from '@/lib/keycloak'
import { useCredit } from '@/lib/credit-context'
import { CreditTransaction } from '@/types/credit-transaction'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUpCircle, ArrowDownCircle, User, Loader2 } from 'lucide-react'

export function PurchaseHistory() {
  const { token, keycloak } = useKeycloak()
  const { credits } = useCredit()
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    if (!token || !keycloak?.tokenParsed) return

    const companyId = (keycloak.tokenParsed as any).companyId
    if (!companyId) return

    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL

      // First get the company credit ID
      const creditRes = await fetch(`${apiUrl}/companyCredits/byCompanyId/${companyId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!creditRes.ok) {
        setTransactions([])
        return
      }

      const creditData = await creditRes.json()

      // Then fetch transactions
      const txRes = await fetch(`${apiUrl}/creditTransactions/byCompanyCredit/${creditData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (txRes.ok) {
        const txData: CreditTransaction[] = await txRes.json()
        // Sort by date descending
        txData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setTransactions(txData)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }, [token, keycloak])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions, credits]) // Re-fetch when credits change (after purchase)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-28" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ArrowUpCircle className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">Nenhuma transação encontrada</p>
        <p className="text-sm">As transações de compra de créditos aparecerão aqui.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Créditos</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Comprado por</TableHead>
            <TableHead>Sessão Stripe</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const isCredit = tx.amount > 0
            return (
              <TableRow key={tx.id}>
                <TableCell className="font-mono text-sm">
                  {formatDate(tx.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {isCredit ? (
                      <ArrowUpCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={isCredit ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                      {isCredit ? '+' : ''}{Number(tx.amount).toFixed(2)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={isCredit ? 'default' : 'secondary'}>
                    {isCredit ? 'Compra' : 'Uso'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {tx.purchasedByName ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{tx.purchasedByName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {tx.stripeSessionId ? (
                    <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px] inline-block" title={tx.stripeSessionId}>
                      {tx.stripeSessionId.substring(0, 20)}...
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
