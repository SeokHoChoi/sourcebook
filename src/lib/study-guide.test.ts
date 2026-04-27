import { describe, expect, it } from 'vitest';

import { getTrack } from '@/lib/sourcebook';
import {
  parseBookTocMarkdown,
  parseStudyGuideMarkdown,
  splitMarkdownSections,
} from '@/lib/study-guide';

describe('study guide parser', () => {
  it('parses the RHF study guide into headings, tables, and code blocks', async () => {
    const track = await getTrack('frontend', 'react-hook-form');

    if (!track.studyGuide) {
      throw new Error('react-hook-form study guide is missing');
    }

    const parsed = parseStudyGuideMarkdown(track.studyGuide.markdown);

    expect(parsed.headings[0]).toMatchObject({
      level: 1,
      text: 'React Hook Form 실전 학습 트랙',
    });
    expect(parsed.headings.some((heading) => heading.id === '3-1-rhf--zod')).toBe(true);
    expect(
      parsed.headings.some((heading) => heading.id === '브라우저-프로세스부터-rhf-내부-저장소까지'),
    ).toBe(true);
    expect(parsed.stats.partCount).toBe(5);
    expect(parsed.stats.sectionCount).toBeGreaterThanOrEqual(20);
    expect(parsed.stats.codeBlockCount).toBeGreaterThanOrEqual(20);
    expect(parsed.stats.tableCount).toBeGreaterThanOrEqual(8);
    expect(parsed.html).toContain('<details class="study-guide-details">');
    expect(parsed.html).toContain('<table>');
    expect(parsed.html).toContain('<figure class="study-guide-code" data-language="tsx">');
    expect(parsed.html).toContain('Code Example');
    expect(parsed.html).toContain('href="#4-5-form--formstatesubscribe"');
    expect(parsed.html).toContain('4-5. <code>&lt;Form /&gt;</code> /');
    expect(parsed.html).toContain('<code>&lt;FormStateSubscribe /&gt;</code>');
  });

  it('escapes raw html-like heading content while preserving html-like labels in anchors', () => {
    const parsed = parseStudyGuideMarkdown(
      [
        '# [4-5. <Form /> / <FormStateSubscribe />](#4-5-form--formstatesubscribe)',
        '## <script>alert("xss")</script>',
        '',
        '```tsx',
        'const label = "<Form />";',
        '```',
      ].join('\n'),
    );

    expect(parsed.html).toContain('href="#4-5-form--formstatesubscribe"');
    expect(parsed.html).toContain('&lt;Form /&gt; / &lt;FormStateSubscribe /&gt;');
    expect(parsed.html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(parsed.html).not.toContain('<script>alert("xss")</script>');
  });

  it('parses the system design table of contents into chapter and section groups', async () => {
    const track = await getTrack('career', 'system-design-interview');

    if (!track.studyGuide?.tocMarkdown) {
      throw new Error('system-design-interview toc archive is missing');
    }

    const toc = parseBookTocMarkdown(track.studyGuide.tocMarkdown);

    expect(toc.frontMatter).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: '차례', pageNumber: 5 }),
        expect.objectContaining({ title: '옮긴이의 글', pageNumber: 10 }),
        expect.objectContaining({ title: '지은이의 글', pageNumber: 11 }),
      ]),
    );
    expect(toc.chapters).toHaveLength(16);
    expect(toc.chapters[0]).toMatchObject({
      title: '1장 사용자 수에 따른 규모 확장성',
      pageNumber: 14,
      chapterNumber: 1,
    });
    expect(toc.chapters[0]?.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: '단일 서버', pageNumber: 14 }),
        expect.objectContaining({ title: '데이터베이스', pageNumber: 17 }),
        expect.objectContaining({ title: '백만 사용자, 그리고 그 이상', pageNumber: 42 }),
      ]),
    );
    expect(toc.chapters[15]).toMatchObject({
      title: '16장 배움은 계속된다',
      pageNumber: 314,
    });
  });

  it('splits heading-based markdown blocks without losing section boundaries', async () => {
    const track = await getTrack('career', 'system-design-interview');

    if (!track.studyGuide) {
      throw new Error('system-design-interview study guide is missing');
    }

    const sections = splitMarkdownSections(track.studyGuide.markdown);
    const part3 = sections.find(
      (section) => section.level === 1 && section.text === 'PART 3. 장별 학습 포인트',
    );

    expect(part3).toBeDefined();

    const chapterSections = splitMarkdownSections(part3?.contentMarkdown ?? '').filter(
      (section) => section.level === 2,
    );
    const chapter1 = chapterSections.find(
      (section) => section.text === '1장 사용자 수에 따른 규모 확장성',
    );

    expect(chapter1?.contentMarkdown).toContain('프론트엔드 초점');
    expect(chapter1?.contentMarkdown).toContain(
      '첫 배치에서 바로잡은 오해 1. 배포 단위와 실행 배치는 다르다',
    );

    const chapter1Subsections = splitMarkdownSections(chapter1?.contentMarkdown ?? '').filter(
      (section) => section.level === 3,
    );

    expect(chapter1Subsections.map((section) => section.text)).toEqual([
      '첫 배치에서 바로잡은 오해 1. 배포 단위와 실행 배치는 다르다',
      '첫 배치에서 바로잡은 오해 2. 프론트도 원래 하던 최적화인데 왜 대규모에서 특별해지나',
      '두 번째 배치에서 바로잡은 오해 3. 웹 앱과 모바일 앱은 전체 경우의 수가 아니다',
      '두 번째 배치에서 바로잡은 오해 4. 이 페이지 안에서 웹 앱은 좁게도 넓게도 섞여 쓴다',
      '세 번째 배치에서 바로잡은 오해 5. 서버를 극장처럼 보는 비유는 절반만 맞다',
      '네 번째 배치에서 바로잡은 오해 6. NoSQL은 관계가 없어서 조인이 없는 게 아니다',
      '네 번째 배치에서 바로잡은 오해 7. 스케일업의 단점은 정의에서 추론해야 한다',
      '다섯 번째 배치에서 바로잡은 오해 8. 부하 분산 집합은 로드밸런서가 요청을 보낼 후보 서버 묶음이다',
      '다섯 번째 배치에서 바로잡은 오해 9. 데이터베이스 주-부 관계는 임의 별명이 아니라 복제 구성이다',
      '다섯 번째 배치에서 바로잡은 오해 10. 로컬 개발용 DB와 운영 복제 토폴로지는 다른 문제다',
    ]);
  });
});
