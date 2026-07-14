type PageHeaderProps = {
  title: string
  description?: string
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8 border-b border-stone-200 pb-6">
      <h1 className="font-display text-2xl font-bold tracking-tight text-host-text sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-host-muted">
          {description}
        </p>
      )}
    </header>
  )
}
