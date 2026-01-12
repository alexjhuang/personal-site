function SiteHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-8 pb-6 pt-8">
      <a href="/" className="text-base uppercase tracking-[0.3em] text-fog/70">
        Alex Huang
      </a>
      <nav className="hidden items-center gap-8 text-base uppercase tracking-[0.26em] text-fog/70 md:flex">
        <a className="transition hover:text-ember" href="/#about">
          About
        </a>
        <a className="transition hover:text-ember" href="/#experience">
          Experience
        </a>
        <a className="transition hover:text-ember" href="/#blogs">
          Blogs
        </a>
        <a className="spotify-nav" href="/#spotify" aria-label="Spotify">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.6 14.7c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.9-9.4-1.1-.3.1-.7-.2-.7-.5s.2-.7.5-.7c4.1-.8 7.6-.4 10.4 1.3.3.2.4.6.1.8zm1.3-3c-.2.3-.6.5-1 .3-2.9-1.8-7.4-2.4-10.8-1.3-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 3.9-1.2 8.8-.6 12.1 1.5.3.2.5.6.3.9zm.1-3.2c-3.4-2-9-2.2-12.3-1.2-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 3.8-1.2 9.9-1 13.8 1.4.4.2.5.7.3 1.1-.2.4-.7.5-1.1.2z" />
          </svg>
        </a>
      </nav>
      <div className="flex items-center gap-6 text-fog/70">
        <a
          className="transition hover:text-ember"
          href="https://github.com"
          aria-label="GitHub"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2a10 10 0 0 0-3.16 19.48c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .08 1.52 1.03 1.52 1.03.88 1.5 2.3 1.07 2.86.82.09-.65.35-1.07.64-1.32-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.26-.45-1.3.1-2.72 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.9-1.29 2.74-1.02 2.74-1.02.56 1.42.21 2.46.1 2.72.64.7 1.03 1.59 1.03 2.68 0 3.84-2.35 4.69-4.58 4.94.36.3.68.9.68 1.82v2.7c0 .27.18.59.69.48A10 10 0 0 0 12 2z" />
          </svg>
        </a>
        <a
          className="transition hover:text-ember"
          href="https://www.linkedin.com"
          aria-label="LinkedIn"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 8.98h3.96V21H3V8.98zM9.5 8.98H13v1.64h.05c.49-.92 1.7-1.89 3.5-1.89 3.75 0 4.45 2.47 4.45 5.68V21H17v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9.5V8.98z" />
          </svg>
        </a>
        <a
          className="transition hover:text-ember"
          href="mailto:hello@alexhuang.io"
          aria-label="Email"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        </a>
      </div>
    </header>
  );
}

export default SiteHeader;
