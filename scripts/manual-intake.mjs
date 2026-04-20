import { promises as fs } from 'node:fs';
import path from 'node:path';

const workspaceRoot = process.cwd();
const libraryRoot = path.join(workspaceRoot, 'library');

function usage() {
  console.error(
    [
      'Usage:',
      '  pnpm intake:scaffold -- <category-slug> <track-slug> <page-slug>',
      '  pnpm intake:add-page -- <category-slug> <track-slug> <page-slug> <title> <canonical-url> [source-repo-path]',
    ].join('\n'),
  );
}

function pageDir(pageSlug) {
  return `pages/${pageSlug}`;
}

function sourceFile(pageSlug) {
  return `${pageDir(pageSlug)}/source.md`;
}

function structureFile(pageSlug) {
  return `${pageDir(pageSlug)}/structure.json`;
}

function overlayFile(pageSlug) {
  return `${pageDir(pageSlug)}/overlay.ko.json`;
}

function templateStructure(pageSlug, pageTitle) {
  return {
    pageSlug,
    pageTitle,
    lastStructuredAt: '',
    segments: [],
  };
}

function templateOverlay(pageSlug) {
  return {
    pageSlug,
    language: 'ko',
    segments: [],
  };
}

async function loadTrackManifest(categorySlug, trackSlug) {
  const manifestPath = path.join(libraryRoot, categorySlug, trackSlug, 'track.json');
  const manifestContents = await fs.readFile(manifestPath, 'utf8');
  return {
    manifestPath,
    manifest: JSON.parse(manifestContents),
  };
}

async function writeTrackManifest(manifestPath, manifest) {
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensurePageDirectory(categorySlug, trackSlug, pageSlug) {
  const absolutePageDir = path.join(libraryRoot, categorySlug, trackSlug, pageDir(pageSlug));
  await fs.mkdir(absolutePageDir, { recursive: true });
  return absolutePageDir;
}

async function scaffoldPage(categorySlug, trackSlug, pageSlug) {
  const { manifestPath, manifest } = await loadTrackManifest(categorySlug, trackSlug);
  const page = manifest.pages.find((entry) => entry.slug === pageSlug);

  if (!page) {
    throw new Error(`Unknown page slug: ${pageSlug}`);
  }

  await ensurePageDirectory(categorySlug, trackSlug, pageSlug);

  const trackRoot = path.join(libraryRoot, categorySlug, trackSlug);
  const sourcePath = path.join(trackRoot, page.files.source);
  const structurePath = path.join(trackRoot, page.files.structure);
  const overlayPath = path.join(trackRoot, page.files.overlay);

  if (!(await fileExists(sourcePath))) {
    await fs.writeFile(sourcePath, '', 'utf8');
  }

  if (!(await fileExists(structurePath))) {
    await fs.writeFile(
      structurePath,
      `${JSON.stringify(templateStructure(page.slug, page.title), null, 2)}\n`,
      'utf8',
    );
  }

  if (!(await fileExists(overlayPath))) {
    await fs.writeFile(
      overlayPath,
      `${JSON.stringify(templateOverlay(page.slug), null, 2)}\n`,
      'utf8',
    );
  }

  if (page.status === 'queued') {
    page.status = 'intake-ready';
    await writeTrackManifest(manifestPath, manifest);
  }

  process.stdout.write(`Scaffolded ${categorySlug}/${trackSlug}/${pageSlug}\n`);
  process.stdout.write(`${sourcePath}\n`);
  process.stdout.write(`${structurePath}\n`);
  process.stdout.write(`${overlayPath}\n`);
  process.stdout.write(
    'Follow the Sourcebook Formatting Contract in AGENTS.md / README.md before filling structure and overlay files.\n',
  );
}

async function addPage(categorySlug, trackSlug, pageSlug, title, canonicalUrl, sourceRepoPath) {
  if (!title || !canonicalUrl) {
    throw new Error('add-page requires <title> and <canonical-url>');
  }

  const { manifestPath, manifest } = await loadTrackManifest(categorySlug, trackSlug);
  const alreadyExists = manifest.pages.some((entry) => entry.slug === pageSlug);

  if (alreadyExists) {
    throw new Error(`Page slug already exists: ${pageSlug}`);
  }

  const pageRecord = {
    slug: pageSlug,
    title,
    readOrder: manifest.pages.length + 1,
    status: 'intake-ready',
    captureMode: 'pending',
    pageType: 'api-page',
    learningStage: 'support-api',
    sourceScope: 'full-page',
    canonicalUrl,
    sourceRepoPath: sourceRepoPath ?? 'TODO/source-repo-path.mdx',
    files: {
      source: sourceFile(pageSlug),
      structure: structureFile(pageSlug),
      overlay: overlayFile(pageSlug),
    },
  };

  manifest.pages.push(pageRecord);
  await writeTrackManifest(manifestPath, manifest);

  await ensurePageDirectory(categorySlug, trackSlug, pageSlug);

  const trackRoot = path.join(libraryRoot, categorySlug, trackSlug);
  await fs.writeFile(path.join(trackRoot, pageRecord.files.source), '', 'utf8');
  await fs.writeFile(
    path.join(trackRoot, pageRecord.files.structure),
    `${JSON.stringify(templateStructure(pageSlug, title), null, 2)}\n`,
    'utf8',
  );
  await fs.writeFile(
    path.join(trackRoot, pageRecord.files.overlay),
    `${JSON.stringify(templateOverlay(pageSlug), null, 2)}\n`,
    'utf8',
  );

  process.stdout.write(`Added ${categorySlug}/${trackSlug}/${pageSlug}\n`);
  process.stdout.write(
    'Follow the Sourcebook Formatting Contract in AGENTS.md / README.md before filling source, structure, and overlay files.\n',
  );
}

async function main() {
  const [command, categorySlug, trackSlug, pageSlug, ...rest] = process.argv.slice(2);

  if (!command || !categorySlug || !trackSlug || !pageSlug) {
    usage();
    process.exitCode = 1;
    return;
  }

  if (command === 'scaffold-page') {
    await scaffoldPage(categorySlug, trackSlug, pageSlug);
    return;
  }

  if (command === 'add-page') {
    const [title, canonicalUrl, sourceRepoPath] = rest;
    await addPage(categorySlug, trackSlug, pageSlug, title, canonicalUrl, sourceRepoPath);
    return;
  }

  usage();
  process.exitCode = 1;
}

await main();
