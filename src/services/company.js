export const EMPRESA_PADRAO = 'studio-fernanda'

export function getSlug() {
  return localStorage.getItem('slug') || EMPRESA_PADRAO
}

export function setSlug(slug) {
  if (slug) {
    localStorage.setItem('slug', slug)
  }
}

export function urlDaEmpresa(caminho = '', slug = getSlug()) {
  const base = `/e/${slug}`
  if (!caminho) return base
  return `${base}/${caminho}`.replace(/\/+$/, '')
}
