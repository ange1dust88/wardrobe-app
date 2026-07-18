'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang='en'>
      <body
        style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 24,
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#fbfaf6',
          color: '#252523',
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
          Something went wrong
        </h2>
        <p style={{ maxWidth: 360, color: '#6b6a66', margin: 0 }}>
          The app hit an unexpected error. Please reload the page.
        </p>
        <button
          type='button'
          onClick={() => reset()}
          style={{
            borderRadius: 8,
            border: 'none',
            background: '#252523',
            color: '#fbfaf6',
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </body>
    </html>
  )
}
