'use client';

const styles = `
  :root, [data-theme="dark"] {
    --bg: #0c0f14; --text: #e8eaed; --dim: #5f6673; --amber: #f0a500;
  }
  [data-theme="light"] {
    --bg: #f8f9fb; --text: #1a1d23; --dim: #8b919c; --amber: #d4920a;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: var(--bg); color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    display: flex; align-items: center; justify-content: center;
    min-height: 100dvh; padding: 2rem;
  }
  .offline-box { text-align: center; max-width: 400px; }
  .offline-box .icon { font-size: 3rem; margin-bottom: 1.5rem; opacity: 0.6; }
  .offline-box h1 {
    font-size: 0.75rem; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 1rem;
  }
  .offline-box p {
    font-size: 0.8rem; color: var(--dim); line-height: 1.6; margin-bottom: 2rem;
  }
  .offline-box button {
    background: none; border: 1px solid var(--amber); color: var(--amber);
    padding: 0.6rem 1.5rem; font-family: inherit; font-size: 0.7rem;
    font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer; border-radius: 2px;
  }
`;

export default function OfflinePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="offline-box">
        <div className="icon">&#x1F4E1;</div>
        <h1>No Connection</h1>
        <p>
          You&apos;re offline and this page hasn&apos;t been cached yet.
          Browse the map while online first, then use &ldquo;Save Area Offline&rdquo;
          to cache map tiles for offline use.
        </p>
        <button onClick={() => window.location.reload()}>Retry Connection</button>
      </div>
    </>
  );
}
