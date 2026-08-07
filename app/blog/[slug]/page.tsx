"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AppNavbar } from "@/components/portfolio/app-navbar"
import { RichText } from "@/components/portfolio/rich-text"
import { useIntersection } from "@/hooks/use-intersection"
import { type BlogPost, formatDate, formatDateShort, excerpt } from "@/lib/types/blog"

// ── Related Posts (grid estático, máx 3) ───────────────────────────────────
function RelatedPosts({ currentSlug, currentCategory, allPosts }: {
  currentSlug: string
  currentCategory: string
  allPosts: BlogPost[]
}) {
  const related = useMemo(() => {
    const others = allPosts.filter(p => p.slug !== currentSlug && !p.draft)
    const same   = others.filter(p => p.category === currentCategory)
    const rest   = others.filter(p => p.category !== currentCategory)
    return [...same, ...rest].slice(0, 3)
  }, [allPosts, currentSlug, currentCategory])

  const relatedRef = useRef<HTMLDivElement>(null)
  useIntersection(
    relatedRef,
    useCallback((el: Element) => { el.classList.add("visible", "in") }, []),
    [related.map(p => p.id).join("|")],
    0.1
  )

  if (related.length === 0) return null

  return (
    <section className="related-posts" aria-labelledby="related-heading" ref={relatedRef}>
      <div className="related-posts-head anim-up">
        <div className="s-label">Descubre más</div>
        <h2 className="related-posts-title" id="related-heading">
          También te puede interesar
        </h2>
      </div>

      <div className="related-posts-grid">
        {related.map(p => (
          <div className="anim-up" key={p.id}>
          <Link
            href={`/blog/${p.slug}`}
            className="related-grid-card"
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
              <p className="blog-preview-excerpt">{excerpt(p.content, 88)}</p>
              <span className="blog-preview-cta">Leer entrada →</span>
            </div>
          </Link>
          </div>
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
  const articleRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const revealIn = useCallback((el: Element) => { el.classList.add("visible", "in") }, [])
  useIntersection(articleRef, revealIn, [post?.id], 0.1)
  useIntersection(sidebarRef, revealIn, [post?.id], 0.1)

  useEffect(() => {
    if (!slug) return
    let ignore = false
    Promise.all([
      fetch(`/api/admin/blog?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
        .then(r => { if (!r.ok) throw new Error(); return r.json() }),
      fetch("/api/admin/blog", { cache: "no-store" })
        .then(r => r.json())
        .then(d => (d.posts || []) as BlogPost[]),
    ])
      .then(([single, posts]) => { if (!ignore) { setPost(single); setAllPosts(posts) } })
      .catch(() => { if (!ignore) setError(true) })
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [slug])

  const tags = post?.tags || []

  return (
    <div className="blog-page">
      <AppNavbar mode="blog" />

      <main className="blog-post-main">
        {loading && (
          <div className="blog-empty">
            <span className="blog-spinner" aria-hidden="true" />
            Cargando…
          </div>
        )}

        {error && (
          <div className="blog-empty anim-up">
            Entrada no encontrada.{" "}
            <Link href="/blog" style={{ color: "var(--accent)" }}>Volver al blog →</Link>
          </div>
        )}

        {post && (
          <>
            {/* Wrapper que se convierte en grid 2 cols a ≥1921px */}
            <div className="blog-post-layout">

              <article className="blog-post" ref={articleRef}>

                <div className="anim-up">
                  <Link href="/blog" className="blog-post-back">← Volver al blog</Link>
                </div>

                <div className="blog-post-meta anim-up">
                  <span className="blog-card-cat">{post.category}</span>
                  <span className="blog-post-date">{formatDate(post.publishedAt)}</span>
                </div>

                <h1 className="blog-post-title anim-up">{post.title}</h1>

                {post.image && (
                  <div className="blog-post-img anim-up">
                    <img src={post.image} alt={post.title} />
                  </div>
                )}

                <RichText text={post.content} className="blog-post-content anim-up" />

                {tags.length > 0 && (
                  <footer className="blog-post-tags anim-up" aria-label="Tags">
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

              {/* Sidebar — solo visible a ≥1921px */}
              <aside className="blog-post-sidebar" aria-label="Información del artículo" ref={sidebarRef}>
                <div className="anim-up">
                  <Link href="/blog" className="blog-sidebar-back">← Blog</Link>
                </div>

                <div className="blog-sidebar-section anim-up">
                  <div className="blog-sidebar-label">Categoría</div>
                  <span className="blog-card-cat" style={{ display: "block" }}>
                    {post.category}
                  </span>
                </div>

                <div className="blog-sidebar-section anim-up">
                  <div className="blog-sidebar-label">Publicado</div>
                  <span className="blog-post-date">{formatDate(post.publishedAt)}</span>
                </div>

                {tags.length > 0 && (
                  <div className="blog-sidebar-section anim-up">
                    <div className="blog-sidebar-label">Etiquetas</div>
                    <div className="blog-sidebar-tags">
                      {tags.map(tag => (
                        <Link
                          key={tag}
                          href={`/blog?tag=${encodeURIComponent(tag)}`}
                          className="blog-tag"
                        >#{tag}</Link>
                      ))}
                    </div>
                  </div>
                )}
              </aside>

            </div>

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
