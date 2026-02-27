import dns.resolver
import os
import ssl
import socket
from pathlib import Path
import dotenv

dotenv.load_dotenv(Path('repository') / '.env')
uri = os.getenv('DATABASE_STRING')
print('Using URI:', uri[:80] + '...' if uri else 'None')

# extract host (cluster domain) from mongodb+srv uri
if uri and uri.startswith('mongodb+srv://'):
    host_part = uri.split('@')[-1]
    host = host_part.split('/')[0]
else:
    host = None

if not host:
    print('Could not determine SRV host from URI')
    exit(1)

print('Resolving SRV records for', host)
try:
    answers = dns.resolver.resolve('_mongodb._tcp.' + host, 'SRV')
    srv_hosts = [str(r.target).rstrip('.') + ':' + str(r.port) for r in answers]
    print('SRV targets:', srv_hosts)
except Exception as e:
    print('SRV resolution failed:', repr(e))
    srv_hosts = []

targets = srv_hosts if srv_hosts else [host + ':27017']

ctx = ssl.create_default_context()
ctx.check_hostname = True

for t in targets:
    h, p = t.split(':')
    print('\nTrying TLS handshake to', h, p)
    try:
        with socket.create_connection((h, int(p)), timeout=10) as sock:
            with ctx.wrap_socket(sock, server_hostname=h) as ssock:
                print('TLS version:', ssock.version())
                print('Cipher:', ssock.cipher())
    except Exception as e:
        print('Handshake failed:', repr(e))
