function upsertMeta(attrName, attrValue, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attrName}="${attrValue}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, attrValue)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (!href) return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertJsonLd(json) {
  if (!json) return
  let el = document.head.querySelector('script[type="application/ld+json"][data-seo="jsonld"]')
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute('data-seo', 'jsonld')
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(json)
}

export function setSeo({
  title,
  description,
  path,
  imagePath,
  type = 'website',
  noIndex = false,
  jsonLd
}) {
  if (title) document.title = title

  const resolvedPath = path ?? window.location.pathname
  const url = new URL(resolvedPath, window.location.origin).toString()
  const imageUrl = imagePath ? new URL(imagePath, window.location.origin).toString() : undefined

  upsertMeta('name', 'description', description)
  upsertMeta('name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1')
  upsertLink('canonical', url)

  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:type', type)
  upsertMeta('property', 'og:url', url)
  if (imageUrl) upsertMeta('property', 'og:image', imageUrl)

  upsertMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary')
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  if (imageUrl) upsertMeta('name', 'twitter:image', imageUrl)

  if (jsonLd) upsertJsonLd(jsonLd)
}
