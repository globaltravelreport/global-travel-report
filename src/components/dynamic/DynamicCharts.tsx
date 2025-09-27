import dynamic from 'next/dynamic';
const DynamicCharts = dynamic(() => import('recharts'), { ssr: false, loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded" /> });
export default DynamicCharts;
