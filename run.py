import mimetypes
import http.server
import socketserver

ADDRESS = 'localhost'
PORT = 8000

GLSL_extensions = {
    '.vert': 'text/plain',
    '.frag': 'text/plain',
}

mimetypes.init()

class MIMEHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **mimetypes.types_map,
        **GLSL_extensions,
        '.js': 'application/javascript',
        '': 'text/plain',
    }

with socketserver.TCPServer((ADDRESS, PORT), MIMEHandler) as httpd:  
    print(f'Running on http://{ADDRESS}:{PORT}...')
    httpd.serve_forever()