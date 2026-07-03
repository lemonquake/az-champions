# AZ Champions - static game server with caching disabled.
# Phone browsers heuristically cache js/css served without cache headers
# (plain `python -m http.server`), which mixes old and new game files and
# causes black screens on stale builds. This server forces revalidation.
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()

    def log_message(self, format, *args):
        pass  # keep the PLAY.cmd window quiet, like `>nul` did


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8321
    ThreadingHTTPServer(('', port), NoCacheHandler).serve_forever()
