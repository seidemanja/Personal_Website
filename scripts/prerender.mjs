import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';

const outputPath = new URL('../dist/index.html', import.meta.url);
const resumeOutputPath = new URL('../dist/resume/index.html', import.meta.url);
const projectsOutputPath = new URL(
  '../dist/projects/index.html',
  import.meta.url,
);
const neuroscienceProjectOutputPath = new URL(
  '../dist/projects/neuroscience-research/index.html',
  import.meta.url,
);
const assetsPath = new URL('../dist/assets/', import.meta.url);
const serverBundlePath = new URL(
  '../.prerender/entry-server.js',
  import.meta.url,
);

try {
  const {
    renderHomePage,
    renderNeuroscienceProjectPage,
    renderProjectsPage,
    renderResumePage,
  } = await import(serverBundlePath.href);
  const html = await readFile(outputPath, 'utf8');
  const stylesheetMatch = html.match(
    /<link rel="stylesheet"[^>]+href="([^"]*\/assets\/index-[^"]+\.css)">/,
  );
  let htmlWithCriticalCss = html;

  if (stylesheetMatch) {
    const stylesheetPath = new URL(
      `../dist${stylesheetMatch[1]}`,
      import.meta.url,
    );
    const criticalCss = await readFile(stylesheetPath, 'utf8');
    htmlWithCriticalCss = html.replace(
      stylesheetMatch[0],
      `<style data-critical-home>${criticalCss}</style>`,
    );
  }

  const renderedHomeHtml = htmlWithCriticalCss.replace(
    '<div id="root"></div>',
    `<div id="root">${renderHomePage()}</div>`,
  );

  const assetNames = await readdir(assetsPath);
  const resumeStylesheetName = assetNames.find(
    (name) => name.startsWith('ResumePage-') && name.endsWith('.css'),
  );
  let resumeHtml = htmlWithCriticalCss;

  if (resumeStylesheetName) {
    const resumeCss = await readFile(
      new URL(resumeStylesheetName, assetsPath),
      'utf8',
    );
    resumeHtml = resumeHtml.replace(
      '</head>',
      `<style data-critical-resume>${resumeCss}</style>\n  </head>`,
    );
  }

  const renderedResumeHtml = resumeHtml.replace(
    '<div id="root"></div>',
    `<div id="root">${renderResumePage()}</div>`,
  );
  const renderedProjectsHtml = htmlWithCriticalCss.replace(
    '<div id="root"></div>',
    `<div id="root">${renderProjectsPage()}</div>`,
  );
  const renderedNeuroscienceProjectHtml = htmlWithCriticalCss.replace(
    '<div id="root"></div>',
    `<div id="root">${renderNeuroscienceProjectPage()}</div>`,
  );

  await mkdir(new URL('../dist/resume/', import.meta.url), { recursive: true });
  await mkdir(new URL('../dist/projects/', import.meta.url), {
    recursive: true,
  });
  await mkdir(
    new URL('../dist/projects/neuroscience-research/', import.meta.url),
    {
      recursive: true,
    },
  );
  await writeFile(outputPath, renderedHomeHtml);
  await writeFile(resumeOutputPath, renderedResumeHtml);
  await writeFile(projectsOutputPath, renderedProjectsHtml);
  await writeFile(
    neuroscienceProjectOutputPath,
    renderedNeuroscienceProjectHtml,
  );
} finally {
  await rm(new URL('../.prerender', import.meta.url), {
    force: true,
    recursive: true,
  });
}
