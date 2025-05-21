from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
from pathlib import Path
import os
import socket
import sys
import signal

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

class NumberTrackerHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.directory = os.path.dirname(os.path.abspath(__file__))
        super().__init__(*args, **kwargs)

    def do_GET(self):
        if self.path in ['/number_tracker.json', '/clients.json']:
            try:
                file_path = os.path.join(self.directory, self.path.lstrip('/'))
                if not os.path.exists(file_path):
                    # Create default structure if file doesn't exist
                    default_data = {
                        'number_tracker.json': {
                            "lastQuoteNumber": 99,
                            "lastInvoiceNumber": 99,
                            "usedQuoteNumbers": [],
                            "usedInvoiceNumbers": []
                        },
                        'clients.json': {
                            "clients": []
                        }
                    }
                    with open(file_path, 'w') as f:
                        json.dump(default_data[os.path.basename(file_path)], f, indent=2)
                
                # Read and send the file
                with open(file_path, 'r') as f:
                    content = f.read()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(content.encode())
            except Exception as e:
                print(f"Error in GET: {str(e)}")
                self.send_error(500, f"Internal error: {str(e)}")
        else:
            super().do_GET()

    def do_POST(self):
        if self.path in ['/number_tracker.json', '/clients.json']:
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                
                # Validate JSON data
                try:
                    json_data = json.loads(post_data)
                except json.JSONDecodeError:
                    self.send_error(400, "Invalid JSON data")
                    return
                
                # Save the data
                file_path = os.path.join(self.directory, self.path.lstrip('/'))
                # Create a backup before writing
                if os.path.exists(file_path):
                    backup_path = file_path + '.bak'
                    with open(file_path, 'r') as src, open(backup_path, 'w') as dst:
                        dst.write(src.read())
                
                with open(file_path, 'w') as f:
                    json.dump(json_data, f, indent=2)
                
                # Send response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(json_data, indent=2).encode())
            except Exception as e:
                print(f"Error in POST: {str(e)}")
                self.send_error(500, f"Internal error: {str(e)}")
        else:
            super().do_POST()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        SimpleHTTPRequestHandler.end_headers(self)

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def signal_handler(signum, frame):
    print("\nShutting down server...")
    sys.exit(0)

def run_server():
    PORT = 8000
    if is_port_in_use(PORT):
        print(f"Port {PORT} is already in use. Please close other instances first.")
        sys.exit(1)
        
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, NumberTrackerHandler)
    
    # Set up signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print(f'Server running on http://localhost:{PORT}')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
    finally:
        httpd.server_close()

if __name__ == '__main__':
    run_server()