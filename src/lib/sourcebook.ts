import { promises as fs } from 'node:fs';
import path from 'node:path';

import { cache } from 'react';

const LIBRARY_ROOT = path.join(process.cwd(), 'library');

export type TrackStatus = 'active' | 'planned';
export type PageStatus = 'sample' | 'queued' | 'intake-ready' | 'full';
export type CaptureMode = 'excerpt' | 'verbatim' | 'pending';
export type PageType = 'api-page' | 'section-page';
export type LearningStage =
  | 'onboarding'
  | 'core-api'
  | 'control-context'
  | 'dynamic-form'
  | 'support-api'
  | 'reference';
export type SourceScope = 'full-page' | 'section';
export type SegmentKind = 'heading' | 'paragraph' | 'code' | 'list';
export type LearnerEventStatus = 'open' | 'scheduled' | 'resolved';
export type ReviewItemStatus = 'due' | 'scheduled' | 'done';

export type CatalogTrackReference = {
  slug: string;
  title: string;
  status: TrackStatus;
};

export type CatalogCategory = {
  slug: string;
  title: string;
  description: string;
  tracks: CatalogTrackReference[];
};

export type CatalogFile = {
  version: number;
  updatedAt: string;
  categories: CatalogCategory[];
};

export type TrackPageFiles = {
  source: string;
  structure: string;
  overlay: string;
};

export type TrackPageManifest = {
  slug: string;
  title: string;
  readOrder: number;
  status: PageStatus;
  captureMode: CaptureMode;
  pageType?: PageType;
  learningStage?: LearningStage;
  sourceScope?: SourceScope;
  sectionAnchor?: string;
  canonicalUrl: string;
  sourceRepoPath: string;
  files: TrackPageFiles;
};

export type TrackStudyGuideManifest = {
  slug: string;
  title: string;
  description: string;
  file: string;
  updatedAt: string;
  verificationNotes?: string[];
};

export type TrackManifest = {
  categorySlug: string;
  trackSlug: string;
  title: string;
  status: TrackStatus;
  phase: string;
  description: string;
  scope: string;
  curriculumRef?: string;
  homepageUrl?: string;
  documentationRepoUrl?: string;
  intakeFlow: string[];
  studyGuide?: TrackStudyGuideManifest;
  pages: TrackPageManifest[];
};

export type PageSegmentDescriptor = {
  id: string;
  order: number;
  kind: SegmentKind;
  source: {
    startLine: number;
    endLine: number;
  };
};

export type PageStructure = {
  pageSlug: string;
  pageTitle: string;
  lastStructuredAt: string;
  segments: PageSegmentDescriptor[];
};

export type OverlayGloss = {
  term: string;
  korean: string;
  explanation: string;
};

export type OverlaySegment = {
  segmentId: string;
  directTranslation: string;
  trickySentenceExplanation: string;
  selectiveVocabGlosses: OverlayGloss[];
  devNote: string;
  recallQuestion: string;
  speakingTransferPrompt: string;
};

export type PageOverlay = {
  pageSlug: string;
  language: string;
  segments: OverlaySegment[];
};

export type GlossaryPageRef = {
  pageSlug: string;
  segmentIds: string[];
};

export type GlossaryTerm = {
  id: string;
  term: string;
  korean: string;
  explanation: string;
  pageRefs: GlossaryPageRef[];
};

export type GlossaryCollection = {
  trackSlug: string;
  terms: GlossaryTerm[];
};

export type LearnerEvent = {
  id: string;
  createdAt: string;
  pageSlug: string;
  relatedSegmentIds: string[];
  question: string;
  confusionReason: string;
  answerSummary: string;
  patternLabel: string;
  nextReviewOn: string;
  source: string;
  topic: string;
  status: LearnerEventStatus;
};

export type LearnerPattern = {
  label: string;
  count: number;
  pageSlugs: string[];
  representativeQuestion: string;
};

export type LearnerPatternsFile = {
  generatedAt: string;
  patterns: LearnerPattern[];
};

export type ReviewQueueItem = {
  id: string;
  pageSlug: string;
  segmentId: string;
  prompt: string;
  dueOn: string;
  status: ReviewItemStatus;
  sourceEventId: string;
};

export type ReviewQueue = {
  generatedAt: string;
  items: ReviewQueueItem[];
};

export type SegmentCard = {
  id: string;
  order: number;
  kind: SegmentKind;
  sourceText: string | null;
  directTranslation: string | null;
  trickySentenceExplanation: string | null;
  selectiveVocabGlosses: OverlayGloss[];
  devNote: string | null;
  recallQuestion: string | null;
  speakingTransferPrompt: string | null;
};

export type TrackPageRecord = TrackPageManifest & {
  rawSource: string | null;
  structure: PageStructure | null;
  overlay: PageOverlay | null;
  segmentCards: SegmentCard[];
  glossaryTerms: GlossaryTerm[];
  learnerEvents: LearnerEvent[];
  reviewItems: ReviewQueueItem[];
};

export type TrackRecord = {
  manifest: TrackManifest;
  studyGuide: TrackStudyGuideRecord | null;
  glossary: GlossaryCollection;
  learnerEvents: LearnerEvent[];
  learnerPatterns: LearnerPatternsFile;
  reviewQueue: ReviewQueue;
  pages: TrackPageRecord[];
  counts: {
    totalPages: number;
    capturedPages: number;
    structuredPages: number;
    overlayPages: number;
    pendingPages: number;
    dueReviewItems: number;
    openConfusions: number;
  };
  confusionPatterns: LearnerPattern[];
};

export type TrackStudyGuideRecord = TrackStudyGuideManifest & {
  markdown: string;
};

export type TrackSummary = {
  categorySlug: string;
  trackSlug: string;
  title: string;
  status: TrackStatus;
  description: string;
  phase: string;
  counts: TrackRecord['counts'];
};

export type CategoryOverview = {
  slug: string;
  title: string;
  description: string;
  tracks: TrackSummary[];
  counts: {
    totalTracks: number;
    activeTracks: number;
    plannedTracks: number;
    totalPages: number;
    capturedPages: number;
    dueReviewItems: number;
    openConfusions: number;
  };
};

function stripHash(url: string): string {
  return url.split('#')[0] ?? url;
}

function normalizeDocToken(value: string | null | undefined): string {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function getTitleTail(title: string): string {
  return title.split(' - ').at(-1) ?? title;
}

function getSectionLookupTokens(
  page: Pick<TrackPageManifest, 'sectionAnchor' | 'title' | 'canonicalUrl'>,
): string[] {
  const tokens = new Set<string>();
  const hash = page.canonicalUrl.split('#')[1] ?? '';

  for (const value of [page.sectionAnchor, hash, getTitleTail(page.title)]) {
    const normalized = normalizeDocToken(value);

    if (normalized) {
      tokens.add(normalized);
    }
  }

  return [...tokens];
}

function normalizeHeadingSource(sourceText: string | null): string {
  if (!sourceText) {
    return '';
  }

  const firstLine = sourceText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  return normalizeDocToken(firstLine?.replace(/^#+\s*/, '') ?? '');
}

function isFileMissing(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const contents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(contents) as T;
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    return await readJsonFile<T>(filePath);
  } catch (error) {
    if (isFileMissing(error)) {
      return null;
    }

    throw error;
  }
}

async function readTextIfExists(filePath: string): Promise<string | null> {
  try {
    const contents = await fs.readFile(filePath, 'utf8');
    return contents.trim().length > 0 ? contents : null;
  } catch (error) {
    if (isFileMissing(error)) {
      return null;
    }

    throw error;
  }
}

async function readNdjsonIfExists<T>(filePath: string): Promise<T[]> {
  const text = await readTextIfExists(filePath);

  if (!text) {
    return [];
  }

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as T);
}

function resolveTrackRoot(categorySlug: string, trackSlug: string): string {
  return path.join(LIBRARY_ROOT, categorySlug, trackSlug);
}

function resolveTrackFile(categorySlug: string, trackSlug: string, relativePath: string): string {
  return path.join(resolveTrackRoot(categorySlug, trackSlug), relativePath);
}

function extractSegmentSource(
  sourceText: string | null,
  segment: PageSegmentDescriptor,
): string | null {
  if (!sourceText) {
    return null;
  }

  const lines = sourceText.split(/\r?\n/);
  const startIndex = Math.max(0, segment.source.startLine - 1);
  const endIndex = Math.min(lines.length - 1, segment.source.endLine - 1);

  if (startIndex > endIndex || startIndex >= lines.length) {
    return null;
  }

  return lines
    .slice(startIndex, endIndex + 1)
    .join('\n')
    .trim();
}

function deriveConfusionPatterns(events: LearnerEvent[]): LearnerPattern[] {
  const map = new Map<
    string,
    {
      count: number;
      pageSlugs: Set<string>;
      representativeQuestion: string;
    }
  >();

  for (const event of events) {
    const label = event.patternLabel || event.confusionReason;
    const existing = map.get(label);

    if (existing) {
      existing.count += 1;
      existing.pageSlugs.add(event.pageSlug);
      continue;
    }

    map.set(label, {
      count: 1,
      pageSlugs: new Set([event.pageSlug]),
      representativeQuestion: event.question,
    });
  }

  return [...map.entries()]
    .map(([label, value]) => ({
      label,
      count: value.count,
      pageSlugs: [...value.pageSlugs].sort(),
      representativeQuestion: value.representativeQuestion,
    }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

const loadCatalog = cache(async (): Promise<CatalogFile> => {
  return readJsonFile<CatalogFile>(path.join(LIBRARY_ROOT, 'catalog.json'));
});

const loadTrackManifest = cache(
  async (categorySlug: string, trackSlug: string): Promise<TrackManifest> => {
    return readJsonFile<TrackManifest>(resolveTrackFile(categorySlug, trackSlug, 'track.json'));
  },
);

export async function getCatalog(): Promise<CatalogFile> {
  return loadCatalog();
}

export async function getCategorySlugs(): Promise<string[]> {
  const catalog = await loadCatalog();
  return catalog.categories.map((category) => category.slug);
}

export async function getCategoryBySlug(categorySlug: string): Promise<CatalogCategory | null> {
  const catalog = await loadCatalog();
  return catalog.categories.find((category) => category.slug === categorySlug) ?? null;
}

async function loadTrackResources(
  categorySlug: string,
  trackSlug: string,
): Promise<Pick<TrackRecord, 'glossary' | 'learnerEvents' | 'learnerPatterns' | 'reviewQueue'>> {
  const glossary = (await readJsonIfExists<GlossaryCollection>(
    resolveTrackFile(categorySlug, trackSlug, 'glossary/terms.json'),
  )) ?? { trackSlug, terms: [] };

  const learnerEvents = await readNdjsonIfExists<LearnerEvent>(
    resolveTrackFile(categorySlug, trackSlug, 'learner/events.ndjson'),
  );

  const learnerPatterns = (await readJsonIfExists<LearnerPatternsFile>(
    resolveTrackFile(categorySlug, trackSlug, 'learner/patterns.json'),
  )) ?? {
    generatedAt: '',
    patterns: [],
  };

  const reviewQueue = (await readJsonIfExists<ReviewQueue>(
    resolveTrackFile(categorySlug, trackSlug, 'review/queue.json'),
  )) ?? {
    generatedAt: '',
    items: [],
  };

  return {
    glossary,
    learnerEvents,
    learnerPatterns,
    reviewQueue,
  };
}

export const getTrack = cache(
  async (categorySlug: string, trackSlug: string): Promise<TrackRecord> => {
    const manifest = await loadTrackManifest(categorySlug, trackSlug);
    const { glossary, learnerEvents, learnerPatterns, reviewQueue } = await loadTrackResources(
      categorySlug,
      trackSlug,
    );
    const studyGuideMarkdown = manifest.studyGuide
      ? await readTextIfExists(resolveTrackFile(categorySlug, trackSlug, manifest.studyGuide.file))
      : null;

    const studyGuide =
      manifest.studyGuide && studyGuideMarkdown
        ? {
            ...manifest.studyGuide,
            markdown: studyGuideMarkdown,
          }
        : null;

    const pages = await Promise.all(
      manifest.pages.map(async (page) => {
        const rawSource = await readTextIfExists(
          resolveTrackFile(categorySlug, trackSlug, page.files.source),
        );
        const structure = await readJsonIfExists<PageStructure>(
          resolveTrackFile(categorySlug, trackSlug, page.files.structure),
        );
        const overlay = await readJsonIfExists<PageOverlay>(
          resolveTrackFile(categorySlug, trackSlug, page.files.overlay),
        );

        const overlayBySegment = new Map(
          (overlay?.segments ?? []).map((segment) => [segment.segmentId, segment]),
        );
        const sortedSegments = [...(structure?.segments ?? [])].sort(
          (left, right) => left.order - right.order,
        );

        const segmentCards: SegmentCard[] = sortedSegments.map((segment) => {
          const overlaySegment = overlayBySegment.get(segment.id) ?? null;
          return {
            id: segment.id,
            order: segment.order,
            kind: segment.kind,
            sourceText: extractSegmentSource(rawSource, segment),
            directTranslation: overlaySegment?.directTranslation ?? null,
            trickySentenceExplanation: overlaySegment?.trickySentenceExplanation ?? null,
            selectiveVocabGlosses: overlaySegment?.selectiveVocabGlosses ?? [],
            devNote: overlaySegment?.devNote ?? null,
            recallQuestion: overlaySegment?.recallQuestion ?? null,
            speakingTransferPrompt: overlaySegment?.speakingTransferPrompt ?? null,
          };
        });

        const glossaryTerms = glossary.terms.filter((term) =>
          term.pageRefs.some((pageRef) => pageRef.pageSlug === page.slug),
        );
        const pageLearnerEvents = learnerEvents.filter((event) => event.pageSlug === page.slug);
        const reviewItems = reviewQueue.items.filter((item) => item.pageSlug === page.slug);

        return {
          ...page,
          rawSource,
          structure,
          overlay,
          segmentCards,
          glossaryTerms,
          learnerEvents: pageLearnerEvents,
          reviewItems,
        };
      }),
    );

    const orderedPages = [...pages].sort((left, right) => left.readOrder - right.readOrder);
    const capturedPages = orderedPages.filter((page) => page.rawSource !== null).length;
    const structuredPages = orderedPages.filter((page) => page.structure !== null).length;
    const overlayPages = orderedPages.filter((page) => page.overlay !== null).length;
    const pendingPages = orderedPages.filter((page) => page.status === 'queued').length;
    const dueReviewItems = reviewQueue.items.filter((item) => item.status === 'due').length;
    const openConfusions = learnerEvents.filter((event) => event.status !== 'resolved').length;

    const confusionPatterns =
      learnerPatterns.patterns.length > 0
        ? learnerPatterns.patterns
        : deriveConfusionPatterns(learnerEvents);

    return {
      manifest,
      studyGuide,
      glossary,
      learnerEvents,
      learnerPatterns,
      reviewQueue,
      pages: orderedPages,
      counts: {
        totalPages: orderedPages.length,
        capturedPages,
        structuredPages,
        overlayPages,
        pendingPages,
        dueReviewItems,
        openConfusions,
      },
      confusionPatterns,
    };
  },
);

export async function findTrack(
  categorySlug: string,
  trackSlug: string,
): Promise<TrackRecord | null> {
  try {
    return await getTrack(categorySlug, trackSlug);
  } catch (error) {
    if (isFileMissing(error)) {
      return null;
    }

    throw error;
  }
}

export async function getTrackPage(
  categorySlug: string,
  trackSlug: string,
  pageSlug: string,
): Promise<TrackPageRecord | null> {
  const track = await getTrack(categorySlug, trackSlug);
  return track.pages.find((page) => page.slug === pageSlug) ?? null;
}

export async function findTrackPage(
  categorySlug: string,
  trackSlug: string,
  pageSlug: string,
): Promise<TrackPageRecord | null> {
  const track = await findTrack(categorySlug, trackSlug);

  if (!track) {
    return null;
  }

  return track.pages.find((page) => page.slug === pageSlug) ?? null;
}

export function findRelatedFullPage(
  track: Pick<TrackRecord, 'pages'>,
  page: Pick<
    TrackPageRecord,
    'slug' | 'captureMode' | 'sourceScope' | 'canonicalUrl' | 'sectionAnchor' | 'title'
  >,
): TrackPageRecord | null {
  if (page.sourceScope !== 'section') {
    return null;
  }

  const canonicalBase = stripHash(page.canonicalUrl);

  return (
    track.pages.find(
      (candidate) =>
        candidate.slug !== page.slug &&
        candidate.sourceScope === 'full-page' &&
        candidate.captureMode === 'verbatim' &&
        stripHash(candidate.canonicalUrl) === canonicalBase,
    ) ?? null
  );
}

export function findSectionHeadingIdForPage(
  fullPage: Pick<TrackPageRecord, 'segmentCards'>,
  page: Pick<TrackPageRecord, 'sectionAnchor' | 'title' | 'canonicalUrl'>,
): string | null {
  const tokens = getSectionLookupTokens(page);

  if (tokens.length === 0) {
    return null;
  }

  const heading = fullPage.segmentCards.find(
    (segment) =>
      segment.kind === 'heading' &&
      tokens.some((token) => normalizeHeadingSource(segment.sourceText) === token),
  );

  return heading?.id ?? null;
}

export function resolvePageTarget(
  track: Pick<TrackRecord, 'pages'>,
  page: Pick<
    TrackPageRecord,
    'slug' | 'captureMode' | 'sourceScope' | 'canonicalUrl' | 'sectionAnchor' | 'title'
  >,
): {
  pageSlug: string;
  hash: string | null;
  relatedFullPage: TrackPageRecord | null;
} {
  const relatedFullPage = findRelatedFullPage(track, page);

  if (!relatedFullPage) {
    return {
      pageSlug: page.slug,
      hash: null,
      relatedFullPage: null,
    };
  }

  return {
    pageSlug: relatedFullPage.slug,
    hash: findSectionHeadingIdForPage(relatedFullPage, page),
    relatedFullPage,
  };
}

export async function getTrackRouteParams(): Promise<
  Array<{ categorySlug: string; trackSlug: string }>
> {
  const catalog = await loadCatalog();

  return catalog.categories.flatMap((category) =>
    category.tracks.map((track) => ({
      categorySlug: category.slug,
      trackSlug: track.slug,
    })),
  );
}

export async function getTrackStudyRouteParams(): Promise<
  Array<{ categorySlug: string; trackSlug: string }>
> {
  const trackParams = await getTrackRouteParams();
  const entries = await Promise.all(
    trackParams.map(async (trackParam) => {
      try {
        const manifest = await loadTrackManifest(trackParam.categorySlug, trackParam.trackSlug);
        return manifest.studyGuide ? trackParam : null;
      } catch (error) {
        if (isFileMissing(error)) {
          return null;
        }

        throw error;
      }
    }),
  );

  return entries.filter((entry): entry is { categorySlug: string; trackSlug: string } =>
    Boolean(entry),
  );
}

export async function getTrackPageRouteParams(): Promise<
  Array<{ categorySlug: string; trackSlug: string; pageSlug: string }>
> {
  const trackParams = await getTrackRouteParams();
  const entries = await Promise.all(
    trackParams.map(async (trackParam) => {
      const track = await findTrack(trackParam.categorySlug, trackParam.trackSlug);

      if (!track) {
        return [];
      }

      return track.pages.map((page) => ({
        ...trackParam,
        pageSlug: page.slug,
      }));
    }),
  );

  return entries.flat();
}

function buildFallbackTrackSummary(
  categorySlug: string,
  track: CatalogTrackReference,
): TrackSummary {
  return {
    categorySlug,
    trackSlug: track.slug,
    title: track.title,
    status: track.status,
    description: '',
    phase: '',
    counts: {
      totalPages: 0,
      capturedPages: 0,
      structuredPages: 0,
      overlayPages: 0,
      pendingPages: 0,
      dueReviewItems: 0,
      openConfusions: 0,
    },
  };
}

export async function getCategoryOverviews(): Promise<CategoryOverview[]> {
  const catalog = await loadCatalog();

  const categoryOverviews = await Promise.all(
    catalog.categories.map(async (category) => {
      const tracks = await Promise.all(
        category.tracks.map(async (trackRef) => {
          const track = await findTrack(category.slug, trackRef.slug);

          if (!track) {
            return buildFallbackTrackSummary(category.slug, trackRef);
          }

          return {
            categorySlug: category.slug,
            trackSlug: track.manifest.trackSlug,
            title: track.manifest.title,
            status: track.manifest.status,
            description: track.manifest.description,
            phase: track.manifest.phase,
            counts: track.counts,
          } satisfies TrackSummary;
        }),
      );

      return {
        slug: category.slug,
        title: category.title,
        description: category.description,
        tracks,
        counts: {
          totalTracks: tracks.length,
          activeTracks: tracks.filter((track) => track.status === 'active').length,
          plannedTracks: tracks.filter((track) => track.status === 'planned').length,
          totalPages: tracks.reduce((acc, track) => acc + track.counts.totalPages, 0),
          capturedPages: tracks.reduce((acc, track) => acc + track.counts.capturedPages, 0),
          dueReviewItems: tracks.reduce((acc, track) => acc + track.counts.dueReviewItems, 0),
          openConfusions: tracks.reduce((acc, track) => acc + track.counts.openConfusions, 0),
        },
      } satisfies CategoryOverview;
    }),
  );

  return categoryOverviews;
}

export async function getCategoryOverviewBySlug(
  categorySlug: string,
): Promise<CategoryOverview | null> {
  const overviews = await getCategoryOverviews();
  return overviews.find((overview) => overview.slug === categorySlug) ?? null;
}
