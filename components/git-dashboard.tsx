'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Repository {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  language: string;
}

interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
}

interface Branch {
  name: string;
  protected: boolean;
}

interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

interface DashboardData {
  repository: Repository;
  commits: Commit[];
  branches: Branch[];
  contributors: Contributor[];
  languages: { [key: string]: number };
  success: boolean;
}

export function GitDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/git/dashboard');

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load data');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 30) return `${diffDays}일 전`;
    return formatDate(dateString);
  };

  const calculateLanguagePercentages = (languages: { [key: string]: number }) => {
    const total = Object.values(languages).reduce((sum, val) => sum + val, 0);
    return Object.entries(languages)
      .map(([name, bytes]) => ({
        name,
        percentage: ((bytes / total) * 100).toFixed(1)
      }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">오류 발생</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              다시 시도
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { repository, commits, branches, contributors, languages } = data;
  const languageStats = calculateLanguagePercentages(languages);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Repository Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8v-7.5z"/>
            </svg>
            {repository.full_name}
          </CardTitle>
          <CardDescription>{repository.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-yellow-600">⭐ {repository.stargazers_count}</div>
              <div className="text-sm text-gray-600">Stars</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-blue-600">🔱 {repository.forks_count}</div>
              <div className="text-sm text-gray-600">Forks</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-red-600">📋 {repository.open_issues_count}</div>
              <div className="text-sm text-gray-600">Issues</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-green-600">🌿 {branches.length}</div>
              <div className="text-sm text-gray-600">Branches</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>마지막 푸시: {formatRelativeTime(repository.pushed_at)}</p>
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              GitHub에서 보기 →
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="commits" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="commits">커밋</TabsTrigger>
          <TabsTrigger value="branches">브랜치</TabsTrigger>
          <TabsTrigger value="contributors">기여자</TabsTrigger>
          <TabsTrigger value="languages">언어</TabsTrigger>
        </TabsList>

        {/* Commits Tab */}
        <TabsContent value="commits">
          <Card>
            <CardHeader>
              <CardTitle>최근 커밋</CardTitle>
              <CardDescription>최근 10개의 커밋 히스토리</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commits.map((commit) => (
                  <div key={commit.sha} className="flex gap-4 p-4 border rounded hover:bg-gray-50">
                    {commit.author && (
                      <img
                        src={commit.author.avatar_url}
                        alt={commit.author.login}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{commit.commit.message}</p>
                      <div className="flex gap-4 text-sm text-gray-600 mt-1">
                        <span>{commit.author?.login || commit.commit.author.name}</span>
                        <span>{formatRelativeTime(commit.commit.author.date)}</span>
                        <a
                          href={commit.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-mono"
                        >
                          {commit.sha.substring(0, 7)}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches">
          <Card>
            <CardHeader>
              <CardTitle>브랜치 목록</CardTitle>
              <CardDescription>저장소의 모든 브랜치</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {branches.map((branch) => (
                  <div
                    key={branch.name}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25z"/>
                      </svg>
                      <span className="font-mono">{branch.name}</span>
                      {branch.name === repository.default_branch && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          기본
                        </span>
                      )}
                    </div>
                    {branch.protected && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        보호됨
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contributors Tab */}
        <TabsContent value="contributors">
          <Card>
            <CardHeader>
              <CardTitle>기여자</CardTitle>
              <CardDescription>프로젝트 기여자 및 기여도</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {contributors.map((contributor) => (
                  <a
                    key={contributor.login}
                    href={contributor.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={contributor.avatar_url}
                        alt={contributor.login}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{contributor.login}</p>
                        <p className="text-sm text-gray-600">
                          {contributor.contributions} 기여
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl">→</div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Languages Tab */}
        <TabsContent value="languages">
          <Card>
            <CardHeader>
              <CardTitle>사용 언어</CardTitle>
              <CardDescription>프로젝트에서 사용된 프로그래밍 언어</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {languageStats.map((lang) => (
                  <div key={lang.name}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{lang.name}</span>
                      <span className="text-gray-600">{lang.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${lang.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
