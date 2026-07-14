import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'

function normalizarMarkdownAsistente(texto: string): string {
  return texto
    .replace(/\r\n/g, '\n')
    .replace(/(\s)(\d+\.\s+\*\*)/g, '\n\n$2')
    .replace(/(\s)([-*]\s+\*\*)/g, '\n\n$2')
    .trim()
}

type ChatMarkdownProps = {
  contenido: string
  variant?: 'dark' | 'light'
}

const markdownComponentsDark: Components = {
  p: ({ children }) => (
    <p className="mb-2 whitespace-pre-wrap last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-slate-200">{children}</em>,
  ul: ({ children }) => (
    <ul className="mb-2 list-disc space-y-1.5 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal space-y-1.5 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
    >
      {children}
    </a>
  ),
}

const markdownComponentsLight: Components = {
  p: ({ children }) => (
    <p className="mb-2 whitespace-pre-wrap last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-host-text">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-stone-600">{children}</em>,
  ul: ({ children }) => (
    <ul className="mb-2 list-disc space-y-1.5 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal space-y-1.5 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-host-primary underline underline-offset-2 hover:text-teal-800"
    >
      {children}
    </a>
  ),
}

export default function ChatMarkdown({
  contenido,
  variant = 'dark',
}: ChatMarkdownProps) {
  const components =
    variant === 'light' ? markdownComponentsLight : markdownComponentsDark

  return (
    <ReactMarkdown components={components}>
      {normalizarMarkdownAsistente(contenido)}
    </ReactMarkdown>
  )
}
