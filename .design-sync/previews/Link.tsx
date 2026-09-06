import { Link } from "ems-web";

/**
 * 라우터 링크. `react-router` 의 `Link` 위에 디자인 시스템 스타일을 얹은 것이라
 * `to` 를 비롯한 라우터 prop 을 그대로 받는다.
 */
export const Default = () => (
  <div className="flex flex-col items-start gap-2">
    <Link to="/forgot-password">비밀번호를 잊으셨나요?</Link>
    <Link to="/sign-up">계정이 없으신가요? 회원가입</Link>
  </div>
);

/** 문장 안에 섞였을 때 */
export const InSentence = () => (
  <p className="text-body-1">
    측정 결과에 이의가 있으면 <Link to="/support">고객지원</Link> 으로 문의하세요.
  </p>
);

/** 로그인 폼 하단의 실제 배치 */
export const InFormFooter = () => (
  <div className="flex items-center justify-between gap-4 border-t border-rule p-3">
    <span className="text-body-3 text-muted-ink">EMS 측정관리 시스템</span>
    <Link to="/forgot-password">비밀번호 찾기</Link>
  </div>
);
