import dynamic from 'next/dynamic';
export default dynamic(() => import('@/components/maps/ClientWorldMap'), { ssr:false, loading:() => <div className="h-[500px] bg-gray-50"/> });
