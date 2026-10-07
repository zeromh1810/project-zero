"use client"

import { useState, useEffect } from "react"
import { ArrowRightIcon } from "../icons"
import Link from "next/link"
import { type BlogPost, formatDateShort as formatDate, excerpt } from "@/lib/types/blog"

export function BlogPreviewSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    fetch("/api/admin/blog", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (!ignore) setPosts((d.posts || []).filter((p: BlogPost) => !p.draft).slice(0, 3))
      })
      .catch(() => {})
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [])

  // Mientras carga: 3 cards esqueleto del mismo tamaño (N-17), así la sección
  // no aparece de golpe empujando lo de abajo. Sin posts publicados: nada.
  if (!loading && !posts.length) return null

  return (
    <section className="blog-preview-section">
      <div className="section">
        <div className="blog-preview-head">
          <div>
            <div className="s-label">Blog</div>
            <h2 className="s-title">Últimas entradas</h2>
          </div>
          <Link href="/blog" className="btn-g" style={{ flexShrink: 0 }}>
            Ver todas <ArrowRightIcon className="btn-arrow" />
          </Link>
        </div>

        <div className="blog-preview-grid" aria-busy={loading || undefined}>
          {loading && [0, 1, 2].map(i => (
            <div key={i} className="blog-preview-card skeleton-card" aria-hidden="true">
              <div className="blog-preview-img skeleton" />
              <div className="blog-preview-body">
                <div className="skeleton skeleton-line" style={{ width: "30%" }} />
                <div className="skeleton skeleton-line skeleton-line--lg" style={{ width: "85%" }} />
                <div className="skeleton skeleton-line" style={{ width: "95%" }} />
                <div className="skeleton skeleton-line" style={{ width: "60%" }} />
              </div>
            </div>
          ))}
          {posts.map(post => (
            // Link real (no div con onClick): se puede enfocar con Tab, abrir
            // en pestaña nueva y muestra la URL al pasar el mouse.
            <Link key={post.id} href={`/blog/${post.slug}`} className="blog-preview-card">
              <article>
                <div className="blog-preview-img">
                  {post.image
                    ? <img src={post.image} alt="" loading="lazy" />
                    : <div className="blog-card-img-placeholder" />}
                </div>
                <div className="blog-preview-body">
                  <div className="blog-preview-top">
                    <span className="blog-card-cat">{post.category}</span>
                    <span className="blog-preview-date">{formatDate(post.publishedAt)}</span>
                  </div>
                  <h3 className="blog-preview-title">{post.title}</h3>
                  <p className="blog-preview-excerpt">{excerpt(post.content)}</p>
                  <span className="blog-preview-cta">Leer entrada <ArrowRightIcon className="btn-arrow" /></span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
