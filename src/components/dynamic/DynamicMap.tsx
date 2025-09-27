import dynamic from 'next/dynamic';
const DynamicMap = dynamic(() => import('leaflet'), { ssr: false, loading: () => <div className="h-[500px] bg-gray-50" /> });
export default DynamicMap;
