import { requireSession } from '@/lib/auth-utils';
import { getKpis } from '@/lib/data/evaluacion';
import DashboardEstadisticas from '@/components/ui/commite/dashboardEstadisticas';

export default async function CommitteePage() {
  await requireSession(['COMITE', 'ADMIN']);
  const kpiData = await getKpis();

  return <DashboardEstadisticas kpiData={kpiData} />;
}
