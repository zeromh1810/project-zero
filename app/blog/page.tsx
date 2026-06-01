"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AppNavbar } from "@/components/portfolio/app-navbar"

interface BlogPost {
  id: string; slug: string; title: string; content: string
  image: string; category: string; publishedAt: string; draft: boolean
}

const CATEGORIES = ["Todos", "Diseño", "Desarrollo", "Producto", "UX Research", "Case Study"]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" })
}

function excerpt(content: string, n = 100) {
  const clean = content.replace(/\n+/g, " ").trim()
  return clean.length <= n ? clean : clean.slice(0, n).trimEnd() + "…"
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="blog-card" style={{ textDecoration: "none" }}>
      <div className="blog-card-img">
        {post.image
          ? <img src={post.image} alt={post.title} />
          : <div className="blog-card-img-placeholder" />}
      </div>
      <div className="blog-card-body">
        <span className="blog-card-cat">{post.category}</span>
        <h2 className="blog-card-title">{post.title}</h2>
        <p className="blog-card-excerpt">{excerpt(post.content)}</p>
        <div className="blog-card-meta">
          <span className="blog-card-date">{formatDate(post.publishedAt)}</span>
          <span className="blog-card-read">Leer entrada →</span>
        </div>
      </div>
    </Link>
  )
}

export default function BlogPage() {

  const [posts,    setPosts]    = useState<BlogPost[]>([])
  const [category, setCategory] = useState("Todos")
  const [search,   setSearch]   = useState("")
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch("/api/admin/blog", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setPosts((d.posts || []).filter((p: BlogPost) => !p.draft)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = posts.filter(p => {
    const matchCat = category === "Todos" || p.category === category
    const q = search.toLowerCase()
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  return (
    <div className="blog-page">
      <AppNavbar mode="blog" />

      {/* ── Main ── */}
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
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar entradas…"
            />
          </div>
          <div className="blog-pills">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`blog-pill${category === c ? " active" : ""}`}
                onClick={() => setCategory(c)}
              >{c}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="blog-empty">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="blog-empty">
            {search || category !== "Todos"
              ? "No hay entradas que coincidan con tu búsqueda."
              : "Aún no hay entradas publicadas. ¡Pronto!"}
          </div>
        ) : (
          <div className="blog-grid">
            {filtered.map(post => <BlogCard key={post.id} post={post} />)}
          </div>
        )}

      </main>
    </div>
  )
}
