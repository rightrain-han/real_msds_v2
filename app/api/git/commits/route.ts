import { NextResponse } from 'next/server';
import { getRecentCommits, parseRepoUrl } from '@/lib/git-service';

/**
 * GET /api/git/commits
 * 최근 커밋 목록을 조회합니다
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repoUrl = searchParams.get('repo') || 'https://github.com/rightrain-han/real_msds_v2.git';
    const branch = searchParams.get('branch') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid repository URL' },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;
    const commits = await getRecentCommits(owner, repo, branch, limit);

    return NextResponse.json({ commits, success: true });
  } catch (error) {
    console.error('Git commits API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch commits',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
