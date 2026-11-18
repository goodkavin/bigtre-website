"""Local preview that mimics the Vercel config: clean URLs and Markdown on Accept.

    python3 tests/serve.py [port] [root]   # default 4321 and the repo root, http://localhost:4321/
"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else Path(__file__).resolve().parent.parent


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                      ".md": "text/markdown; charset=utf-8",
                      ".txt": "text/plain; charset=utf-8"}

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def do_GET(self):
        path = self.path.split("?")[0].rstrip("/") or "/"
        wants_md = "text/markdown" in self.headers.get("Accept", "")
        rel = path.lstrip("/")
        if rel and "." not in rel.rsplit("/", 1)[-1]:
            base = ROOT / rel
            if wants_md and rel.split("/")[0] in ("en", "th"):
                dest = f"/{rel}/index.md" if rel in ("en", "th") else f"/{rel}.md"
                self.send_response(307)  # as vercel.json redirects
                self.send_header("Location", dest)
                self.send_header("Content-Length", "0")
                self.end_headers()
                return
            elif (base.parent / (base.name + ".html")).is_file():
                self.path = f"/{rel}.html"
            elif (base / "index.html").is_file():
                self.path = f"/{rel}/index.html"
        return super().do_GET()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4321
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
