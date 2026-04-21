'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Loader2, Link, Code, Mail as MailIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AboutData } from '@/types';

interface ContactSectionProps {
  about: AboutData;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ContactSection({ about }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, [formData.message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Por favor completa todos los campos', {
        style: {
          background: 'var(--toast-bg)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
        },
      });
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        toast.success('¡Mensaje enviado! Te responderé pronto.', {
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          },
        });
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        throw new Error('Error al enviar');
      }
    } catch {
      setStatus('error');
      toast.error('Error al enviar el mensaje. Inténtalo de nuevo.', {
        style: {
          background: 'var(--toast-bg)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
        },
      });
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const socialLinks = [
    { key: 'linkedin', icon: Link, label: 'LinkedIn' },
    { key: 'github', icon: Code, label: 'GitHub' },
    { key: 'email', icon: MailIcon, label: 'Email' },
  ].filter((s) => about.social_links[s.key as keyof typeof about.social_links]);

  return (
    <section
      id="contacto"
      className="relative z-10 px-6 py-24 md:py-32"
      aria-label="Contacto"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.h2
          className="mb-2 font-display text-4xl font-bold md:text-6xl"
          style={{ color: 'var(--text-primary)' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Hablemos.
        </motion.h2>

        <motion.p
          className="mb-12 text-sm md:text-base"
          style={{ color: 'var(--text-muted)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          ¿Tienes un proyecto en mente? Me encantaría escucharte.
        </motion.p>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="mx-auto max-w-lg"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Name Input */}
          <div className="floating-input-wrapper">
            <input
              type="text"
              id="contact-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="contact-name">Nombre</label>
            <div className="floating-input-underline" />
          </div>

          {/* Email Input */}
          <div className="floating-input-wrapper">
            <input
              type="email"
              id="contact-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="contact-email">Email</label>
            <div className="floating-input-underline" />
          </div>

          {/* Message Textarea */}
          <div className="floating-input-wrapper">
            <textarea
              ref={textareaRef}
              id="contact-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder=" "
              rows={3}
              required
            />
            <label htmlFor="contact-message">Mensaje</label>
            <div className="floating-input-underline" />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="group mt-4 inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-medium transition-all duration-200"
            style={{
              background:
                status === 'success'
                  ? 'var(--success)'
                  : status === 'error'
                    ? 'var(--error)'
                    : 'var(--accent)',
              color: 'var(--bg-primary)',
              opacity: status === 'loading' ? 0.8 : 1,
            }}
            whileTap={
              status === 'idle' ? { scale: 0.97 } : {}
            }
            animate={
              status === 'error'
                ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
                : {}
            }
            transition={
              status === 'error'
                ? { duration: 0.5 }
                : {}
            }
          >
            <AnimatePresence mode="wait">
              {status === 'loading' && (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 size={16} className="animate-spin" />
                  Enviando...
                </motion.span>
              )}
              {status === 'success' && (
                <motion.span
                  key="success"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check size={16} />
                  ¡Enviado!
                </motion.span>
              )}
              {(status === 'idle' || status === 'error') && (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  Enviar
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.form>

        {/* Social Links */}
        <motion.div
          className="mx-auto mt-16 max-w-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p
            className="mb-4 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            — o también puedes encontrarme en:
          </p>
          <div className="flex gap-3">
            {socialLinks.map(({ key, icon: Icon, label }) => {
              const url = about.social_links[key as keyof typeof about.social_links];
              const href = key === 'email' ? `mailto:${url}` : url;
              return (
                <a
                  key={key}
                  href={href}
                  target={key !== 'email' ? '_blank' : undefined}
                  rel={key !== 'email' ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-all duration-200"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <Icon size={16} />
                  {label}
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
