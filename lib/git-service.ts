/**
 * Git Service
 * GitHub API를 통한 저장소 정보 조회 서비스
 */

export interface GitRepository {
  name: string
  full_name: string
  description: string
  html_url: string
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  default_branch: string
  language: string
}

export interface GitCommit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    message: string
  }
  author: {
    login: string
    avatar_url: string
  } | null
  html_url: string
}

export interface GitBranch {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
}

export interface GitContributor {
  login: string
  avatar_url: string
  contributions: number
  html_url: string
}

export interface GitLanguages {
  [key: string]: number
}

/**
 * GitHub API 기본 설정
 */
const GITHUB_API_BASE = "https://api.github.com"
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

/**
 * API 요청 헤더 생성
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  }

  if (GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`
  }

  return headers
}

/**
 * 저장소 정보에서 owner와 repo 추출
 */
export function parseRepoUrl(repoUrl: string): { owner: string; repo: string } | null {
  try {
    // https://github.com/owner/repo.git 형식
    const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)(\.git)?$/)
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
      }
    }
    return null
  } catch (error) {
    console.error("Failed to parse repo URL:", error)
    return null
  }
}

/**
 * 저장소 정보 조회
 */
export async function getRepositoryInfo(owner: string, repo: string): Promise<GitRepository> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
    headers: getHeaders(),
    next: { revalidate: 300 }, // 5분 캐시
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch repository info: ${response.statusText}`)
  }

  return response.json()
}

/**
 * 최근 커밋 목록 조회
 */
export async function getRecentCommits(owner: string, repo: string, branch?: string, limit = 10): Promise<GitCommit[]> {
  const params = new URLSearchParams({
    per_page: limit.toString(),
  })

  if (branch) {
    params.append("sha", branch)
  }

  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?${params}`, {
    headers: getHeaders(),
    next: { revalidate: 60 }, // 1분 캐시
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch commits: ${response.statusText}`)
  }

  return response.json()
}

/**
 * 브랜치 목록 조회
 */
export async function getBranches(owner: string, repo: string): Promise<GitBranch[]> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/branches`, {
    headers: getHeaders(),
    next: { revalidate: 300 }, // 5분 캐시
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch branches: ${response.statusText}`)
  }

  return response.json()
}

/**
 * 기여자 목록 조회
 */
export async function getContributors(owner: string, repo: string): Promise<GitContributor[]> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors`, {
    headers: getHeaders(),
    next: { revalidate: 3600 }, // 1시간 캐시
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch contributors: ${response.statusText}`)
  }

  return response.json()
}

/**
 * 언어 통계 조회
 */
export async function getLanguages(owner: string, repo: string): Promise<GitLanguages> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`, {
    headers: getHeaders(),
    next: { revalidate: 3600 }, // 1시간 캐시
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch languages: ${response.statusText}`)
  }

  return response.json()
}

/**
 * 특정 커밋 정보 조회
 */
export async function getCommit(owner: string, repo: string, sha: string): Promise<GitCommit> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${sha}`, {
    headers: getHeaders(),
    next: { revalidate: 3600 }, // 1시간 캐시
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch commit: ${response.statusText}`)
  }

  return response.json()
}

/**
 * 저장소의 모든 정보를 한 번에 조회
 */
export async function getRepositoryDashboardData(owner: string, repo: string) {
  try {
    const [repoInfo, commits, branches, contributors, languages] = await Promise.all([
      getRepositoryInfo(owner, repo),
      getRecentCommits(owner, repo, undefined, 10),
      getBranches(owner, repo),
      getContributors(owner, repo),
      getLanguages(owner, repo),
    ])

    return {
      repository: repoInfo,
      commits,
      branches,
      contributors,
      languages,
      success: true,
    }
  } catch (error) {
    console.error("Failed to fetch repository dashboard data:", error)
    return {
      repository: null,
      commits: [],
      branches: [],
      contributors: [],
      languages: {},
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
