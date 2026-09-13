import type React from "react";

import { cn } from "@/lib/utils";

/**
 * 값 영역이 라벨을 피해 가는 여백 — 라벨 위 6px(`top-1.5`) + 캡션 한 줄 15.4px 을 비운다.
 * **라벨 위치를 바꾸면 이 값도 같이 바뀐다.** 그래서 한곳에 둔다.
 */
export const IN_FIELD_VALUE_CLASS = "pt-[22px] pb-1";

/** 인필드 라벨이 얹힌 한 줄 컨트롤의 프레임 높이 — 38px 한 줄 입력이 라벨 한 줄만큼 큰다 */
export const IN_FIELD_CONTROL_HEIGHT = "h-12";

/**
 * 컨트롤 안 **우측 아이콘**(셀렉트 꺽쇠·달력)을 프레임 세로 중앙에 고정한다.
 * 값 영역에 위 패딩을 주면 자식 아이콘도 같이 내려가므로 패딩과 무관하게 절대 배치한다.
 * 아이콘 요소에 직접 건다 — 아이콘을 직접 그리지 못하는 Select 는 아래 `IN_FIELD_SELECT_CLASS`.
 */
export const IN_FIELD_ICON_CLASS = "absolute top-1/2 right-3 -translate-y-1/2";

/**
 * `IN_FIELD_ICON_CLASS` 의 Select 트리거 판 — 꺽쇠는 `SelectTrigger` 가 `data-slot="select-icon"`
 * 으로 그리므로 트리거에서 자손 선택자로 잡는다. 값 글줄은 아이콘 자리(우측 36px)를 비운다.
 */
export const IN_FIELD_SELECT_CLASS = cn(
  "relative pr-9",
  "[&_[data-slot=select-icon]]:absolute [&_[data-slot=select-icon]]:top-1/2",
  "[&_[data-slot=select-icon]]:right-3 [&_[data-slot=select-icon]]:-translate-y-1/2",
);

/**
 * 라벨이 칸 안에 들어오면 라벨과 같은 문구의 placeholder 는 같은 자리에서 두 번 읽힌다.
 * 라벨이 있을 때는 "라벨이 못 하는 말"(형식 예시 등)일 때만 placeholder 를 남긴다.
 */
export const inFieldPlaceholder = (placeholder: string | undefined, label: React.ReactNode) =>
  placeholder === undefined || placeholder === label ? undefined : placeholder;
