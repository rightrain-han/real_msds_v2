import { GitDashboard } from '@/components/git-dashboard';

export const metadata = {
  title: 'Git Repository Dashboard - MSDS System',
  description: 'GitHub 저장소 정보 및 통계 대시보드',
};

export default function GitPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Git Repository Dashboard</h1>
          <p className="text-gray-600 mt-1">실시간 저장소 정보 및 통계</p>
        </div>
      </header>
      <GitDashboard />
    </div>
  );
}
