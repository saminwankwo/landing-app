import fs from 'node:fs/promises'
import path from 'node:path'

import fsSync from 'node:fs'

const projectRoot = process.cwd()
const publicDir = path.join(projectRoot, 'public')

function loadEnvFiles() {
  const envFiles = ['.env.production.local', '.env.production', '.env.local', '.env']
  for (const file of envFiles) {
    const filePath = path.join(projectRoot, file)
    if (fsSync.existsSync(filePath)) {
      try {
        const content = fsSync.readFileSync(filePath, 'utf8')
        for (const line of content.split('\n')) {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith('#')) continue
          const equalsIdx = trimmed.indexOf('=')
          if (equalsIdx > 0) {
            const key = trimmed.slice(0, equalsIdx).trim()
            let val = trimmed.slice(equalsIdx + 1).trim()
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1)
            }
            if (!process.env[key]) {
              process.env[key] = val
            }
          }
        }
      } catch {
        /* ignore */
      }
    }
  }
}
loadEnvFiles()

function normalizeBaseUrl(input) {
  if (!input) return ''
  try {
    const url = new URL(input)
    return url.origin
  } catch {
    return input.replace(/\/+$/, '')
  }
}

function xmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const baseUrl = normalizeBaseUrl(
  process.env.VITE_SITE_URL || process.env.SITE_URL,
)
const isProduction = process.env.NODE_ENV === 'production' || process.env.CI

if (isProduction && !baseUrl) {
  console.error(
    '\n[seo] ERROR: VITE_SITE_URL environment variable is required for production builds.\n' +
      'Set it to your canonical origin (e.g. https://yourdomain.com) so sitemap.xml and robots.txt\n' +
      'contain valid absolute URLs. Without this, search engines will reject the sitemap.\n',
  )
  process.exit(1)
}

if (!baseUrl) {
  console.warn(
    '[seo] WARNING: VITE_SITE_URL not set. Generated sitemap.xml and robots.txt\n' +
      'will use relative paths, which may not be accepted by all search engines.\n' +
      'Set VITE_SITE_URL before running a production build.\n',
  )
}

const today = new Date().toISOString().slice(0, 10)

const routes = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  {
    loc: '/case-studies/family-tree-platform',
    changefreq: 'monthly',
    priority: '0.8',
  },
]

const urlset = routes
  .map((r) => {
    const loc = baseUrl ? `${baseUrl}${r.loc}` : r.loc
    return [
      '  <url>',
      `    <loc>${xmlEscape(loc)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${r.changefreq}</changefreq>`,
      `    <priority>${r.priority}</priority>`,
      '  </url>',
    ].join('\n')
  })
  .join('\n')

const sitemapXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urlset,
  '</urlset>',
  '',
].join('\n')

const sitemapPath = path.join(publicDir, 'sitemap.xml')
await fs.mkdir(publicDir, { recursive: true })
await fs.writeFile(sitemapPath, sitemapXml, 'utf8')

const sitemapUrl = baseUrl ? `${baseUrl}/sitemap.xml` : '/sitemap.xml'
const robotsTxt = [
  'User-agent: *',
  'Allow: /',
  `Sitemap: ${sitemapUrl}`,
  '',
].join('\n')
await fs.writeFile(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8')

const adsensePublisherId = (
  process.env.VITE_ADSENSE_PUB_ID ||
  process.env.ADSENSE_PUB_ID ||
  ''
).trim()
if (adsensePublisherId) {
  const publisherValue = adsensePublisherId.startsWith('pub-')
    ? adsensePublisherId
    : `pub-${adsensePublisherId}`
  const adsTxt = [
    `google.com, ${publisherValue}, DIRECT, f08c47fec0942fa0`,
    '',
  ].join('\n')
  await fs.writeFile(path.join(publicDir, 'ads.txt'), adsTxt, 'utf8')
}

console.log(
  `[seo] Wrote sitemap.xml (${routes.length} URLs) and robots.txt → ${publicDir}${
    baseUrl ? ` with base ${baseUrl}` : ''
  }`,
)

const distDir = path.join(projectRoot, 'dist')
if (fsSync.existsSync(distDir)) {
  await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8')
  await fs.writeFile(path.join(distDir, 'robots.txt'), robotsTxt, 'utf8')
  if (adsensePublisherId) {
    const publisherValue = adsensePublisherId.startsWith('pub-')
      ? adsensePublisherId
      : `pub-${adsensePublisherId}`
    const adsTxt = [`google.com, ${publisherValue}, DIRECT, f08c47fec0942fa0`, ''].join('\n')
    await fs.writeFile(path.join(distDir, 'ads.txt'), adsTxt, 'utf8')
  }

  const distIndex = path.join(distDir, 'index.html')
  if (fsSync.existsSync(distIndex)) {
    const htmlTemplate = await fs.readFile(distIndex, 'utf8')

    // Generate static route html for case study
    const caseStudyDir = path.join(distDir, 'case-studies', 'family-tree-platform')
    await fs.mkdir(caseStudyDir, { recursive: true })

    const canonicalUrl = baseUrl
      ? `${baseUrl}/case-studies/family-tree-platform`
      : '/case-studies/family-tree-platform'
    const imageUrl = baseUrl ? `${baseUrl}/familytree.png` : '/familytree.png'

    let caseStudyHtml = htmlTemplate
      .replace(
        /<title>.*?<\/title>/,
        '<title>Private Genealogy Web App Case Study | Samuel Nwankwo</title>',
      )
      .replace(
        /<meta name="description" content=".*?" \/>/,
        '<meta name="description" content="Case study: a secure role-based genealogy collaboration platform with tree-level sharing, admin-safe access management, and data integrity protections." />',
      )
      .replace(
        /<meta property="og:title" content=".*?" \/>/,
        '<meta property="og:title" content="Private Genealogy Web App Case Study | Samuel Nwankwo" />',
      )
      .replace(
        /<meta property="og:description" content=".*?" \/>/,
        '<meta property="og:description" content="Case study: a secure role-based genealogy collaboration platform with tree-level sharing, admin-safe access management, and data integrity protections." />',
      )
      .replace(
        /<meta property="og:image" content=".*?" \/>/,
        `<meta property="og:image" content="${imageUrl}" />`,
      )
      .replace(
        /<meta name="twitter:title" content=".*?" \/>/,
        '<meta name="twitter:title" content="Private Genealogy Web App Case Study | Samuel Nwankwo" />',
      )
      .replace(
        /<meta name="twitter:description" content=".*?" \/>/,
        '<meta name="twitter:description" content="Case study: a secure role-based genealogy collaboration platform with tree-level sharing, admin-safe access management, and data integrity protections." />',
      )
      .replace(
        /<meta name="twitter:image" content=".*?" \/>/,
        `<meta name="twitter:image" content="${imageUrl}" />`,
      )

    if (!caseStudyHtml.includes('rel="canonical"')) {
      caseStudyHtml = caseStudyHtml.replace(
        '</head>',
        `  <link rel="canonical" href="${canonicalUrl}" />\n  </head>`,
      )
    }

    await fs.writeFile(path.join(caseStudyDir, 'index.html'), caseStudyHtml, 'utf8')
    console.log(
      '[seo] Pre-rendered static HTML for /case-studies/family-tree-platform in dist output',
    )
  }
}
