/**
 * Server segment config so `next build` with `output: "export"` can include
 * the dynamic results route shell (actual session IDs resolved only in the browser).
 */
export function generateStaticParams() {
  return [];
}

export default function ResultsSessionLayout({ children }) {
  return children;
}
