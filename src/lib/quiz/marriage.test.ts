import { describe, expect, test } from 'vitest'
import {
  GENDER_KEY,
  QUESTIONS,
  QUESTION_COUNT,
  RESULT_TYPE_LIST,
  calcQuizResult,
  getResultTypeDef,
  questionsForGender,
  validateAnswers,
  type Answers,
  type AxisKey,
  type Gender,
} from './marriage'

// 특정 성별·특정 인덱스의 선택지로 전체 응답 구성 (0=첫 번째 선택지)
function answersByIndex(gender: Gender, optionIndex: number): Answers {
  const base: Answers = { [GENDER_KEY]: gender }
  questionsForGender(gender).forEach((q) => {
    base[q.id] = q.options[optionIndex].id
  })
  return base
}

describe('QUESTIONS 구조', () => {
  test('정의된 문항은 72종이다 (공통 66 + 남녀 전용 각 3)', () => {
    expect(QUESTIONS).toHaveLength(72)
  })

  test('남녀 응답 문항 수는 동일하다 (각 69문항)', () => {
    expect(questionsForGender('male')).toHaveLength(69)
    expect(questionsForGender('female')).toHaveLength(69)
    expect(QUESTION_COUNT).toBe(69)
  })

  test('모든 문항은 4~5지선다이고 옵션 id가 전역에서 고유하다', () => {
    const ids = new Set<string>()
    QUESTIONS.forEach((q) => {
      expect(q.options.length).toBeGreaterThanOrEqual(4)
      expect(q.options.length).toBeLessThanOrEqual(5)
      q.options.forEach((o) => {
        expect(ids.has(o.id)).toBe(false)
        ids.add(o.id)
      })
    })
  })

  test('모든 문항에 카테고리가 지정되어 있다', () => {
    QUESTIONS.forEach((q) => {
      expect(['profile', 'personality', 'preference', 'situation']).toContain(q.category)
    })
  })

  test('옵션 점수와 확률 기여가 명세 범위 안이다 (score 0~3, p -2~+3)', () => {
    QUESTIONS.forEach((q) =>
      q.options.forEach((o) => {
        expect(o.score).toBeGreaterThanOrEqual(0)
        expect(o.score).toBeLessThanOrEqual(3)
        expect(o.p).toBeGreaterThanOrEqual(-2)
        expect(o.p).toBeLessThanOrEqual(3)
      }),
    )
  })
})

describe('validateAnswers', () => {
  test('성별 + 전 문항 유효 응답이면 true', () => {
    expect(validateAnswers(answersByIndex('male', 0))).toBe(true)
    expect(validateAnswers(answersByIndex('female', 0))).toBe(true)
  })

  test('성별이 없으면 false', () => {
    const noGender = answersByIndex('male', 0)
    delete noGender[GENDER_KEY]
    expect(validateAnswers(noGender)).toBe(false)
  })

  test('문항 수가 부족하면 false', () => {
    const partial = answersByIndex('male', 0)
    delete partial[questionsForGender('male')[0].id]
    expect(validateAnswers(partial)).toBe(false)
  })

  test('존재하지 않는 옵션 id면 false', () => {
    const tampered = answersByIndex('female', 0)
    tampered[questionsForGender('female')[0].id] = 'hacked'
    expect(validateAnswers(tampered)).toBe(false)
  })

  test('다른 성별의 문항이 섞이면 false (개수 초과)', () => {
    const mixed = answersByIndex('male', 0)
    mixed['gf1'] = 'gf1a'
    expect(validateAnswers(mixed)).toBe(false)
  })
})

describe('calcQuizResult', () => {
  test('불완전한 응답이면 null', () => {
    expect(calcQuizResult({})).toBeNull()
    expect(calcQuizResult({ [GENDER_KEY]: 'male' })).toBeNull()
  })

  test('확률은 항상 35~95 범위로 클램프된다 (남녀 모두)', () => {
    for (const gender of ['male', 'female'] as Gender[]) {
      for (let i = 0; i < 4; i++) {
        const result = calcQuizResult(answersByIndex(gender, i))
        expect(result).not.toBeNull()
        expect(result!.probability).toBeGreaterThanOrEqual(35)
        expect(result!.probability).toBeLessThanOrEqual(95)
      }
    }
  })

  test('모든 옵션 조합 방향에서 유형 이름이 정의된 12종 중 하나다', () => {
    for (const gender of ['male', 'female'] as Gender[]) {
      for (let i = 0; i < 4; i++) {
        const result = calcQuizResult(answersByIndex(gender, i))!
        expect(getResultTypeDef(result.resultType)).not.toBeNull()
      }
    }
  })

  test('축 점수 합계는 응답 옵션들의 score 합과 일치한다', () => {
    const answers = answersByIndex('female', 1)
    const result = calcQuizResult(answers)!
    const expectedTotal = questionsForGender('female').reduce((sum, q) => {
      const option = q.options.find((o) => o.id === answers[q.id])!
      return sum + option.score
    }, 0)
    const actualTotal = (Object.keys(result.axes) as AxisKey[]).reduce(
      (sum, k) => sum + result.axes[k],
      0,
    )
    expect(actualTotal).toBe(expectedTotal)
  })

  test('긍정 응답(첫 선택지 위주)은 부정 응답보다 확률이 높다', () => {
    const positive = calcQuizResult(answersByIndex('male', 0))!
    const negative = calcQuizResult(answersByIndex('male', 3))!
    expect(positive.probability).toBeGreaterThan(negative.probability)
  })

  test('같은 응답은 항상 같은 결과를 낸다 (결정적)', () => {
    const a = calcQuizResult(answersByIndex('female', 2))
    const b = calcQuizResult(answersByIndex('female', 2))
    expect(a).toEqual(b)
  })
})

describe('getResultTypeDef', () => {
  test('존재하지 않는 유형이면 null', () => {
    expect(getResultTypeDef('없는유형')).toBeNull()
  })

  test('유형은 12종이다 (확률 3구간 × 주도 축 4개)', () => {
    expect(RESULT_TYPE_LIST).toHaveLength(12)
  })

  test('유형 리치 프로필 필드가 모두 채워져 있다', () => {
    RESULT_TYPE_LIST.forEach((def) => {
      expect(def.memeLine.length).toBeGreaterThan(0)
      expect(def.summary.length).toBeGreaterThan(50)
      expect(def.loveStyle.length).toBeGreaterThan(50)
      expect(def.marriageOutlook.length).toBeGreaterThan(50)
      expect(def.strengths).toHaveLength(3)
      expect(def.watchouts.length).toBeGreaterThanOrEqual(2)
      expect(def.tips).toHaveLength(3)
      expect(def.keywords.length).toBeGreaterThanOrEqual(3)
    })
  })

  test('케미 상대(bestMatch/hardMatch)는 실존하는 유형을 가리킨다', () => {
    RESULT_TYPE_LIST.forEach((def) => {
      expect(getResultTypeDef(def.bestMatch)).not.toBeNull()
      expect(getResultTypeDef(def.hardMatch)).not.toBeNull()
      expect(def.bestMatch).not.toBe(def.name)
      expect(def.hardMatch).not.toBe(def.name)
    })
  })
})
