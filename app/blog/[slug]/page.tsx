"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AppNavbar } from "@/components/portfolio/app-navbar"

interface BlogPost {
  id: string; slug: string; title: string; content: string
  image: string; category: string; tags: string[]; publishedAt: string; draft: boolean
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" })
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { month: "short", year: "numeric" })
}

function excerpt(content: string, n = 88) {
  const clean = content.replace(/\n+/g, " ").trim()
  return clean.length <= n ? clean : clean.slice(0, n).trimEnd() + "…"
}

// ── Related Posts Slider ────────────────────────────────────────────────────
function RelatedPosts({ currentSlug, currentCategory, allPosts }: {
  currentSlug: string
  currentCategory: string
  allPosts: BlogPost[]
}) {
  const scrollRef                           = useRef<HTMLDivElement>(null)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Same category first, then others — max 4, exclude current
  const related = useMemo(() => {
    const others = allPosts.filter(p => p.slug !== currentSlug && !p.draft)
    const same   = others.filter(p => p.category === currentCategory)
    const rest   = others.filter(p => p.category !== currentCategory)
    return [...same, ...rest].slice(0, 4)
  }, [allPosts, currentSlug, currentCategory])

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // Re-check after layout stabilises
    const t = setTimeout(checkScroll, 80)
    el.addEventListener("scroll", checkScroll, { passive: true })
    window.addEventListener("resize",  checkScroll)
    return () => {
      clearTimeout(t)
      el.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize",  checkScroll)
    }
  }, [related, checkScroll])

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -290 : 290, behavior: "smooth" })
  }

  if (related.length === 0) return null

  return (
    <section className="related-posts" aria-labelledby="related-heading">

      <div className="related-posts-head">
        <div>
          <div className="s-label">Descubre más</div>
          <h2 className="related-posts-title" id="related-heading">
            También te puede interesar
          </h2>
        </div>

        <div className="related-posts-nav" aria-label="Navegación del slider">
          <button
            className="related-nav-btn"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Artículos anteriores"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15,18 9,12 15,6" />
            </svg>
          </button>
          <button
            className="related-nav-btn"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Más artículos"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="related-posts-slider" ref={scrollRef} role="list">
        {related.map(p => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="related-slider-card"
            role="listitem"
            aria-label={p.title}
          >
            <div className="blog-preview-img">
              {p.image
                ? <img src={p.image} alt={p.title} loading="lazy" />
                : <div className="blog-card-img-placeholder" />}
            </div>
            <div className="blog-preview-body">
              <div className="blog-preview-top">
                <span className="blog-card-cat">{p.category}</span>
                <span className="blog-preview-date">{formatDateShort(p.publishedAt)}</span>
              </div>
              <h3 className="blog-preview-title">{p.title}</h3>
              <p className="blog-preview-excerpt">{excerpt(p.content)}</p>
              <span className="blog-preview-cta">Leer entrada →</span>
            </div>
          </Link>
        ))}
      </div>

    </section>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function BlogPostPage() {
  const { slug }   = useParams<{ slug: string }>()
  const [post,     setPost]     = useState<BlogPost | null>(null)
  const [allPosts, setAllPosts] = useState<BlogPost[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)

  useEffect(() => {
    if (!slug) return
    Promise.all([
      fetch(`/api/admin/blog?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
        .then(r => { if (!r.ok) throw new Error(); return r.json() }),
      fetch("/api/admin/blog", { cache: "no-store" })
        .then(r => r.json())
        .then(d => (d.posts || []) as BlogPost[]),
    ])
      .then(([single, posts]) => { setPost(single); setAllPosts(posts) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  const tags = post?.tags || []

  return (
    <div className="blog-page">
      <AppNavbar mode="blog" />

      <main className="blog-post-main">
        {loading && <div className="blog-empty">Cargando…</div>}

        {error && (
          <div className="blog-empty">
            Entrada no encontrada.{" "}
            <Link href="/blog" style={{ color: "var(--accent)" }}>Volver al blog →</Link>
          </div>
        )}

        {post && (
          <>
            <article className="blog-post">

              <Link href="/blog" className="blog-post-back">← Volver al blog</Link>

              <div className="blog-post-meta">
                <span className="blog-card-cat">{post.category}</span>
                <span className="blog-post-date">{formatDate(post.publishedAt)}</span>
              </div>

              <h1 className="blog-post-title">{post.title}</h1>

              {post.image && (
                <div className="blog-post-img">
                  <img src={post.image} alt={post.title} />
                </div>
              )}

              <div className="blog-post-content">{post.content}</div>

              {tags.length > 0 && (
                <footer className="blog-post-tags" aria-label="Tags">
                  {tags.map(tag => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="blog-tag"
                    >#{tag}</Link>
                  ))}
                </footer>
              )}

            </article>

            <RelatedPosts
              currentSlug={post.slug}
              currentCategory={post.category}
              allPosts={allPosts}
            />
          </>
        )}
      </main>
    </div>
  )
}
