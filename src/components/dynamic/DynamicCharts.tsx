import dynamic from 'next/dynamic';
export default dynamic(() => import('@/components/analytics/AnalyticsDashboard').then(mod => mod.AnalyticsDashboard), { ssr:false, loading:() => <div className="h-64 animate-pulse bg-gray-100 rounded"/> });
