/**
 * MSDS 시스템 전역 상수 정의
 */

// 페이지네이션 설정
export const PAGINATION = {
  ITEMS_PER_PAGE_DESKTOP: 12,
  ITEMS_PER_PAGE_MOBILE: 8,
  MOBILE_BREAKPOINT: 768,
} as const

// 자동 새로고침 설정
export const REFRESH = {
  INTERVAL_MS: 30000, // 30초
} as const

// UI 설정
export const UI = {
  MAX_VISIBLE_PAGES_DESKTOP: 10,
  MAX_VISIBLE_PAGES_MOBILE: 5,
  MAX_RECEPTION_DISPLAY: 2,
} as const

// API 엔드포인트
export const API_ENDPOINTS = {
  MSDS: '/api/msds',
  WARNING_SYMBOLS: '/api/warning-symbols',
  PROTECTIVE_EQUIPMENT: '/api/protective-equipment',
  CONFIG_OPTIONS: '/api/config-options',
  UPLOAD_PDF: '/api/upload/pdf',
  UPLOAD_IMAGE: '/api/upload/image',
  ADMIN_LOGIN: '/api/admin/login',
  ADMIN_VERIFY: '/api/admin/verify',
} as const

// 파일 설정
export const FILE_CONFIG = {
  MAX_PDF_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_PDF_TYPES: ['application/pdf'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const

// 메시지
export const MESSAGES = {
  LOADING: 'MSDS 데이터를 불러오는 중...',
  LOADING_SUBTITLE: '잠시만 기다려주세요',
  ERROR_TITLE: '데이터 로딩 오류',
  RETRY_BUTTON: '다시 시도',
  NO_RESULTS: '검색 결과가 없습니다',
  NO_DATA: '데이터가 없습니다',
  SEARCH_PLACEHOLDER: 'MSDS명, 용도, 장소, 관련법으로 검색...',
} as const

// 관리자 설정
export const ADMIN = {
  PASSWORD: '0000',
  SESSION_KEY: 'admin_authenticated',
} as const

// MSDS 코드 형식
export const MSDS_CODE_FORMAT = {
  PREFIX: 'M',
  PADDING: 4,
} as const

// 색상 테마
export const COLORS = {
  PRIMARY: 'blue',
  SUCCESS: 'green',
  WARNING: 'orange',
  ERROR: 'red',
  INFO: 'blue',
} as const

// 경고 표지 카테고리
export const WARNING_SYMBOL_CATEGORIES = {
  PHYSICAL: 'physical',
  HEALTH: 'health',
  ENVIRONMENTAL: 'environmental',
  CUSTOM: 'custom',
} as const

// 보호 장구 카테고리
export const PROTECTIVE_EQUIPMENT_CATEGORIES = {
  RESPIRATORY: 'respiratory',
  EYE: 'eye',
  HAND: 'hand',
  BODY: 'body',
  FOOT: 'foot',
  CUSTOM: 'custom',
} as const

// 설정 옵션 타입
export const CONFIG_TYPES = {
  USAGE: 'usage',
  RECEPTION: 'reception',
  LAWS: 'laws',
} as const
