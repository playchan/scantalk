import { createClient } from '@/lib/supabase/server'
import AnalysisForm from './AnalysisForm'
import type { Product } from '@/types'

export default async function NewAnalysisPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('id, name, price, description, features')
    .eq('is_active', true)
    .order('sort_order')

  return <AnalysisForm products={(data ?? []) as Product[]} />
}
