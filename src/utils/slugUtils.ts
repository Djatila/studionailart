// Utilitários para geração e manipulação de slugs

/**
 * Gera um slug a partir do nome da designer
 * Exemplo: "Klivia Azevedo" -> "klivia-azevedo"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD') // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-'); // Remove hífens duplicados
}

/**
 * Valida se um slug está no formato correto
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Extrai o slug da URL atual
 * Suporta formatos como /slug, /slug/, //slug, etc.
 */
export function extractSlugFromPath(pathname: string): string | null {
  // Normaliza múltiplas barras no início para uma só e remove a barra final
  const cleanPath = pathname.replace(/^\/+/, '/').replace(/\/$/, '');
  
  // Extrai o slug (tudo depois da primeira barra)
  const match = cleanPath.match(/^\/([a-z0-9-]+)$/);
  
  return match ? match[1] : null;
}

/**
 * Gera a URL completa do link personalizado
 */
export function generatePersonalLink(slug: string, baseUrl?: string): string {
  const base = baseUrl || window.location.origin;
  return `${base}/${slug}`;
}
