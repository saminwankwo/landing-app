import fs from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const publicDir = path.join(projectRoot, 'public')

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

const baseUrl = normalizeBaseUrl(process.env.VITE_SITE_URL || process.env.SITE_URL)
const today = new Date().toISOString().slice(0, 10)

const routes = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/case-studies/family-tree-platform', changefreq: 'monthly', priority: '0.8' }
]

const urlset = routes.map(r => {
  const loc = baseUrl ? `${baseUrl}${r.loc}` : r.loc
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${r.changefreq}</changefreq>`,
    `    <priority>${r.priority}</priority>`,
    '  </url>'
  ].join('\n')
}).join('\n')

const sitemapXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urlset,
  '</urlset>',
  ''
].join('\n')

const sitemapPath = path.join(publicDir, 'sitemap.xml')
await fs.mkdir(publicDir, { recursive: true })
await fs.writeFile(sitemapPath, sitemapXml, 'utf8')

const sitemapUrl = baseUrl ? `${baseUrl}/sitemap.xml` : '/sitemap.xml'
const robotsTxt = [`User-agent: *`, 'Allow: /', `Sitemap: ${sitemapUrl}`, ''].join('\n')
await fs.writeFile(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8')

const adsensePublisherId = (process.env.VITE_ADSENSE_PUB_ID || process.env.ADSENSE_PUB_ID || '').trim()
if (adsensePublisherId) {
  const publisherValue = adsensePublisherId.startsWith('pub-') ? adsensePublisherId : `pub-${adsensePublisherId}`
  const adsTxt = [`google.com, ${publisherValue}, DIRECT, f08c47fec0942fa0`, ''].join('\n')
  await fs.writeFile(path.join(publicDir, 'ads.txt'), adsTxt, 'utf8')
}
