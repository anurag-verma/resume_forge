export function Footer() {
  return (
    <footer className="flex h-6 shrink-0 items-center justify-center border-t border-line bg-surface text-[11px] text-muted print:hidden">
      <span>
        © {new Date().getFullYear()}{' '}
        <a
          href="https://github.com/anurag-verma"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-ink hover:underline"
        >
          Anurag Verma
        </a>{' '}
        · v{__APP_VERSION__}
      </span>
    </footer>
  )
}
