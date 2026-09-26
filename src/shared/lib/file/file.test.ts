import { describe, expect, it } from 'vitest';

import { parseAttachmentFilename } from './content-disposition';
import { formatFileSize } from './file-size';

describe('parseAttachmentFilename', () => {
  it('RFC 5987 인코딩(filename*)의 한글 파일명을 복원한다', () => {
    const header = "attachment; filename*=UTF-8''%EC%B1%84%EC%B7%A8%EA%B8%B0%EB%A1%9D%EB%B6%80.zip";
    expect(parseAttachmentFilename(header)).toBe('채취기록부.zip');
  });

  it('filename* 이 filename 보다 우선한다', () => {
    const header = "attachment; filename=\"fallback.zip\"; filename*=UTF-8''%ED%95%9C%EA%B8%80.zip";
    expect(parseAttachmentFilename(header)).toBe('한글.zip');
  });

  it('인코딩이 깨졌으면 ASCII filename 으로 물러선다', () => {
    const header = "attachment; filename=\"plain.zip\"; filename*=UTF-8''%E0%A4%A";
    expect(parseAttachmentFilename(header)).toBe('plain.zip');
  });

  it('따옴표 없는 filename 도 읽는다', () => {
    expect(parseAttachmentFilename('attachment; filename=report.xlsx')).toBe('report.xlsx');
  });

  it('헤더가 없거나 파일명이 없으면 null', () => {
    expect(parseAttachmentFilename(undefined)).toBeNull();
    expect(parseAttachmentFilename('inline')).toBeNull();
  });
});

describe('formatFileSize', () => {
  it('1KB 미만은 바이트, 그 이상은 소수 한 자리', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(20 * 1024 * 1024)).toBe('20.0 MB');
  });

  it('0·음수는 0 B, 값이 없으면 빈 문자열', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(-3)).toBe('0 B');
    expect(formatFileSize(null)).toBe('');
    expect(formatFileSize(Number.NaN)).toBe('');
  });
});
