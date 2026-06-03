"use client"

import { useState, useEffect, Fragment, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AppNavbar } from "@/components/portfolio/app-navbar"
import { type BlogPost, formatDate, excerpt } from "@/lib/types/blog"

const CATEGORIES = ["Todos", "Diseño", "Desarrollo", "Producto", "UX Research", "Case Study"]
const POSTS_PER_PAGE = 9

function Paginator({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null

  const all = Array.from({ length: total }, (_, i) => i + 1)
  const near = new Set([1, total, page - 1, page, page + 1].filter(p => p >= 1 && p <= total))
  const visible = all.filter(p => near.has(p))

  return (
    <nav className="blog-pagination" aria-label="Paginación">
      <button
        className="blog-page-btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
      >←</button>

      {visible.map((p, i) => {
        const prev = visible[i - 1]
        return (
          <Fragment key={p}>
            {prev && p - prev > 1 && <span className="blog-page-ellipsis">…</span>}
            <button
              className={`blog-page-btn${p === page ? " active" : ""}`}
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
            >{p}</button>
          </Fragment>
        )
      })}

      <button
        className="blog-page-btn"
        onClick={() => onChange(page + 1)}
        disabled={page === total}
        aria-label="Página siguiente"
      >→</button>
    </nav>
  )
}

function BlogCard({ post, onTagClick }: { post: BlogPost; onTagClick: (tag: string) => void }) {
  const tags = post.tags || []
  return (
    <article className="blog-card">
      <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none", display: "contents" }}>
        <div className="blog-card-img">
          {post.image
            ? <img src={post.image} alt={post.title} />
            : <div className="blog-card-img-placeholder" />}
        </div>
        <div className="blog-card-body">
          <span className="blog-card-cat">{post.category}</span>
          <h2 className="blog-card-title">{post.title}</h2>
          <p className="blog-card-excerpt">{excerpt(post.content)}</p>
        </div>
      </Link>
      {/* Tags fuera del Link para que sean clickables independientemente */}
      {tags.length > 0 && (
        <div className="blog-tags" style={{ padding: "0 22px" }}>
          {tags.slice(0, 3).map(tag => (
            <button
              key={tag}
              className="blog-tag"
              onClick={() => onTagClick(tag)}
            >#{tag}</button>
          ))}
        </div>
      )}
      <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
        <div className="blog-card-meta" style={{ margin: "0 22px 22px", paddingTop: 14, borderTop: "1px solid var(--border)" }}>
          <span className="blog-card-date">{formatDate(post.publishedAt)}</span>
          <span className="blog-card-read">Leer entrada →</span>
        </div>
      </Link>
    </article>
  )
}

function BlogPageInner() {
  const searchParams  = useSearchParams()
  const [posts,       setPosts]       = useState<BlogPost[]>([])
  const [category,    setCategory]    = useState("Todos")
  const [search,      setSearch]      = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(searchParams.get("tag"))
  const [page,        setPage]        = useState(1)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    let ignore = false
    fetch("/api/admin/blog", { cache: "no-store" })
      .then(r => r.json())
      .then(d => { if (!ignore) setPosts((d.posts || []).filter((p: BlogPost) => !p.draft)) })
      .catch(() => {})
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [])

  // Resetear página al cambiar filtros
  useEffect(() => { setPage(1) }, [category, search, selectedTag])

  function handleTagClick(tag: string) {
    setSelectedTag(prev => prev === tag ? null : tag)
    setCategory("Todos")
    setSearch("")
  }

  const filtered = posts.filter(p => {
    const matchCat    = category === "Todos" || p.category === category
    const matchTag    = !selectedTag || (p.tags || []).includes(selectedTag)
    const q           = search.toLowerCase()
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
    return matchCat && matchTag && matchSearch
  })

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE)
  const paginated  = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  // Todos los tags únicos del total de posts (para mostrar como filtros rápidos)
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags || []))).sort()

  return (
    <div className="blog-page">
      <AppNavbar mode="blog" />

      <main className="blog-main">

        {/* Hero */}
        <div className="blog-hero">
          <div className="s-label">Blog</div>
          <h1 className="blog-hero-title">Perspectivas sobre diseño y producto</h1>
          <p className="blog-hero-sub">Reflexiones, casos de estudio y exploración de ideas</p>
        </div>

        {/* Filters */}
        <div className="blog-filters">
          <div className="blog-search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="blog-search-icon">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="blog-search"
              value={search}
              onChange={e => { setSearch(e.target.value); setSelectedTag(null) }}
              placeholder="Buscar entradas…"
            />
          </div>

          {/* Categorías */}
          <div className="blog-pills">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`blog-pill${category === c && !selectedTag ? " active" : ""}`}
                onClick={() => { setCategory(c); setSelectedTag(null) }}
              >{c}</button>
            ))}
          </div>

          {/* Tags rápidos */}
          {allTags.length > 0 && (
            <div className="blog-tags" style={{ marginTop: 4 }}>
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`blog-tag${selectedTag === tag ? " active" : ""}`}
                  onClick={() => handleTagClick(tag)}
                >#{tag}</button>
              ))}
            </div>
          )}
        </div>

        {/* Tag activo */}
        {selectedTag && (
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "var(--txt2)" }}>
              Filtrando por tag:
            </span>
            <button
              className="blog-tag active"
              onClick={() => setSelectedTag(null)}
            >#{selectedTag} ×</button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="blog-empty">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="blog-empty">
            {search || category !== "Todos" || selectedTag
              ? "No hay entradas que coincidan con tu búsqueda."
              : "Aún no hay entradas publicadas. ¡Pronto!"}
          </div>
        ) : (
          <>
            <div className="blog-grid">
              {paginated.map(post => (
                <BlogCard key={post.id} post={post} onTagClick={handleTagClick} />
              ))}
            </div>
            <Paginator page={page} total={totalPages} onChange={setPage} />
          </>
        )}

      </main>
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="blog-page"><div className="blog-empty">Cargando…</div></div>}>
      <BlogPageInner />
    </Suspense>
  )
}
