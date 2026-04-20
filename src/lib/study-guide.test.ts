import { describe, expect, it } from 'vitest';

import { getTrack } from '@/lib/sourcebook';
import { parseStudyGuideMarkdown } from '@/lib/study-guide';

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
});
