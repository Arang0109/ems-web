import type { AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";

import { unwrapBlob } from "./blob-error";
import { ApiResponseError, unwrap } from "./response";

const blobResponse = (status: number, body: string, headers: Record<string, string> = {}) =>
  ({ status, data: new Blob([body]), headers }) as unknown as AxiosResponse<Blob>;

const OPTIONS = {
  fallbackMessage: "다운로드에 실패했습니다.",
  messageByStatus: { 404: "파일을 찾을 수 없습니다." },
  fallbackFilename: "파일.bin",
};

describe("unwrapBlob", () => {
  it("성공이면 blob 과 헤더의 파일명을 돌려준다", async () => {
    const res = blobResponse(200, "data", { "content-disposition": "attachment; filename=\"report.xlsx\"" });
    const out = await unwrapBlob(res, OPTIONS);
    expect(out.filename).toBe("report.xlsx");
    expect(out.blob).toBe(res.data);
  });

  it("헤더에 파일명이 없으면 fallbackFilename 을 쓴다", async () => {
    const out = await unwrapBlob(blobResponse(200, "data"), OPTIONS);
    expect(out.filename).toBe("파일.bin");
  });

  it("실패 본문의 서버 문구를 상태 코드와 함께 던진다", async () => {
    const res = blobResponse(409, JSON.stringify({ status: false, message: "이미 삭제된 문서입니다." }));
    const err = await unwrapBlob(res, OPTIONS).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiResponseError);
    expect((err as ApiResponseError).message).toBe("이미 삭제된 문서입니다.");
    expect((err as ApiResponseError).status).toBe(409);
  });

  it("서버 문구가 없으면 상태별 문구, 그것도 없으면 기본 문구", async () => {
    await expect(unwrapBlob(blobResponse(404, "<html>"), OPTIONS)).rejects.toThrow("파일을 찾을 수 없습니다.");
    await expect(unwrapBlob(blobResponse(500, "<html>"), OPTIONS)).rejects.toThrow("다운로드에 실패했습니다.");
  });
});

describe("unwrap", () => {
  const envelope = (status: number, body: { status: boolean; message: string; data: unknown }) =>
    ({ status, data: body }) as unknown as AxiosResponse<{ status: boolean; message: string; data: unknown }>;

  it("성공 봉투면 data 를 꺼낸다", () => {
    expect(unwrap(envelope(200, { status: true, message: "", data: 7 }))).toBe(7);
  });

  it("실패면 HTTP 상태 코드를 실어 던진다 — 409 는 isConflict", () => {
    try {
      unwrap(envelope(409, { status: false, message: "다른 사용자가 먼저 저장했습니다.", data: null }));
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(ApiResponseError);
      expect((err as ApiResponseError).isConflict).toBe(true);
      expect((err as ApiResponseError).message).toBe("다른 사용자가 먼저 저장했습니다.");
    }
  });
});
