import ZipUploader from '../components/ZipUploader';
import PageLayout from '../components/PageLayout';

export default function UnzipPage() {
  return (
    <PageLayout
      title="Unzip Files"
      description="Upload and extract ZIP files"
      heroType="simple"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          ZIP File Extractor
        </h1>
        <ZipUploader />
      </div>
    </PageLayout>
  );
} 