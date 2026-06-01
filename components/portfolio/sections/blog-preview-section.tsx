"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface BlogPost {
  id: string; slug: string; title: string; content: string
  image: string; category: string; publishedAt: string; draft: boolean
}

function excerpt(content: string, n = 100) {
  const clean = content.replace(/\n+/g, " ").trim()
  return clean.length <= n ? clean : clean.slice(0, n).trimEnd() + "…"
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CL", { month: "short", year: "numeric" })
}

export function BlogPreviewSection() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    fetch("/api/admin/blog", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        const pub = (d.posts || []).filter((p: BlogPost) => !p.draft).slice(0, 3)
        setPosts(pub)
      })
      .catch(() => {})
  }, [])

  if (!posts.length) return null

  return (
    <section className="blog-preview-section">
      <div className="section">
        <div className="blog-preview-head">
          <div>
            <div className="s-label">Blog</div>
            <h2 className="s-title">Últimas entradas</h2>
          </div>
          <button
            className="btn-g"
            onClick={() => router.push("/blog")}
            style={{ flexShrink: 0 }}
          >
            Ver todas →
          </button>
        </div>

        <div className="blog-preview-grid">
          {posts.map(post => (
            <div
              key={post.id}
              className="blog-preview-card"
              onClick={() => router.push(`/blog/${post.slug}`)}
              role="article"
            >
              <div className="blog-preview-img">
                {post.image
                  ? <img src={post.image} alt={post.title} />
                  : <div className="blog-card-img-placeholder" />}
              </div>
              <div className="blog-preview-body">
                <div className="blog-preview-top">
                  <span className="blog-card-cat">{post.category}</span>
                  <span className="blog-preview-date">{formatDate(post.publishedAt)}</span>
                </div>
                <h3 className="blog-preview-title">{post.title}</h3>
                <p className="blog-preview-excerpt">{excerpt(post.content)}</p>
                <span className="blog-preview-cta">Leer entrada →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
