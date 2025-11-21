import { NextResponse } from 'next/server';
import { getBranches, parseRepoUrl } from '@/lib/git-service';

/**
 * GET /api/git/branches
 * 브랜치 목록을 조회합니다
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repoUrl = searchParams.get('repo') || 'https://github.com/rightrain-han/real_msds_v2.git';

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid repository URL' },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;
    const branches = await getBranches(owner, repo);

    return NextResponse.json({ branches, success: true });
  } catch (error) {
    console.error('Git branches API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch branches',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
