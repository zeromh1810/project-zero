"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { AppNavbar } from "@/components/portfolio/app-navbar"

interface BlogPost {
  id: string; slug: string; title: string; content: string
  image: string; category: string; tags: string[]; publishedAt: string; draft: boolean
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" })
}

export default function BlogPostPage() {
  const { slug }  = useParams<{ slug: string }>()
  const router    = useRouter()
  const [post,    setPost]    = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/admin/blog?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => setPost(d))
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
          <article className="blog-post">
            {/* Back */}
            <Link href="/blog" className="blog-post-back">← Volver al blog</Link>

            {/* Meta: category + date — alineados en flex, margin-bottom:0 via CSS */}
            <div className="blog-post-meta">
              <span className="blog-card-cat">{post.category}</span>
              <span className="blog-post-date">{formatDate(post.publishedAt)}</span>
            </div>

            {/* Title */}
            <h1 className="blog-post-title">{post.title}</h1>

            {/* Image */}
            {post.image && (
              <div className="blog-post-img">
                <img src={post.image} alt={post.title} />
              </div>
            )}

            {/* Content */}
            <div className="blog-post-content">
              {post.content}
            </div>

            {/* Tags al pie del artículo */}
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
        )}
      </main>
    </div>
  )
}
