/**
 * 한글 조사 선택 — 앞말의 받침에 따라 갈리는 조사를 붙인다.
 *
 * 화면 문구를 `{이름}이(가)` 처럼 두 형태 병기로 두면 읽기 어색하고, 그렇다고 문장마다
 * 분기를 두면 문구가 흩어진다. 앞말의 마지막 글자만 보면 되는 규칙이라 여기서 처리한다.
 */

const HANGUL_SYLLABLE_START = 0xac00;
const HANGUL_SYLLABLE_END = 0xd7a3;
/** 종성 개수 — 유니코드 한글 음절은 (초성×21 + 중성)×28 + 종성 순으로 배열된다 */
const FINAL_CONSONANT_COUNT = 28;

/**
 * 받침이 있으면 `true`, 없으면 `false`.
 * 한글 음절이 아니면(영문·숫자·기호) 판별할 수 없어 `null`.
 */
const hasFinalConsonant = (word: string): boolean | null => {
  const last = word.trim().at(-1);
  if (!last) return null;

  const code = last.charCodeAt(0);
  if (code < HANGUL_SYLLABLE_START || code > HANGUL_SYLLABLE_END) return null;

  return (code - HANGUL_SYLLABLE_START) % FINAL_CONSONANT_COUNT !== 0;
};

/**
 * 주격 조사를 붙인다 — `"수분 채취"` → `"수분 채취가"`, `"총 채취시간"` → `"총 채취시간이"`.
 *
 * 한글이 아닌 말(`"THC"`, `"NOx"`)은 읽는 사람마다 발음이 갈리므로 병기형으로 남긴다.
 */
export const withSubjectJosa = (word: string): string => {
  const final = hasFinalConsonant(word);
  if (final === null) return `${word}이(가)`;

  return `${word}${final ? "이" : "가"}`;
};
