import { NextResponse } from 'next/server';
import { getRepositoryDashboardData, parseRepoUrl } from '@/lib/git-service';

/**
 * GET /api/git/dashboard
 * 저장소의 대시보드 데이터를 조회합니다
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repoUrl = searchParams.get('repo');

    // 기본값: package.json의 repository URL 사용
    const defaultRepoUrl = 'https://github.com/rightrain-han/real_msds_v2.git';
    const targetRepo = repoUrl || defaultRepoUrl;

    const parsed = parseRepoUrl(targetRepo);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid repository URL' },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;
    const data = await getRepositoryDashboardData(owner, repo);

    if (!data.success) {
      return NextResponse.json(
        { error: data.error || 'Failed to fetch repository data' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Git dashboard API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch repository data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
