import time
from django.core.cache import cache
from django.http import HttpResponseForbidden, JsonResponse
from ipware import get_client_ip
import re
from user_agents import parse

class SecurityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # Configuration (can be moved to Django settings)
        self.RATE_LIMIT = 100  # requests per minute
        self.BRUTE_FORCE_LIMIT = 10  # login attempts per minute
        self.SUSPICIOUS_PATHS = []
        self.BAD_USER_AGENTS = [
            'nikto', 'sqlmap', 'wget', 'curl', 'python-requests',
            'dirbuster', 'hydra', 'metasploit'
        ]
        self.BLOCK_DURATION = 3600  # 1 hour in seconds

    def __call__(self, request):
        # Get client IP
        client_ip, _ = get_client_ip(request)
        
        # Skip middleware for certain paths (API docs, health checks)
        if request.path.startswith('/home') or request.path.startswith('/about-us') or request.path.startswith('/'):
            return self.get_response(request)
            
        # 1. Check for suspicious user agents
        if self.is_malicious_user_agent(request):
            return self.block_request(request, "Suspicious user agent detected")

        # 2. Check for suspicious paths
        if self.is_suspicious_path(request):
            return self.block_request(request, "Suspicious path detected")

        # 3. Rate limiting by IP
        if self.is_rate_limited(client_ip):
            return self.block_request(request, "Rate limit exceeded")

        # 4. Brute force protection for login endpoints
        if request.path == '/login' and request.method == 'POST':
            if self.is_brute_force_attempt(client_ip):
                return self.block_request(request, "Too many login attempts")

        # 5. SQL injection/XSS protection
        if self.contains_malicious_input(request):
            return self.block_request(request, "Malicious input detected")

        response = self.get_response(request)
        
        # 6. Add security headers to all responses
        self.add_security_headers(response)
        
        return response

    def is_malicious_user_agent(self, request):
        """Check for known malicious user agents"""
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
        if not user_agent:
            return True  # Block empty user agents
            
        ua = parse(user_agent)
        if ua.is_bot:
            return True
            
        for bad_ua in self.BAD_USER_AGENTS:
            if bad_ua in user_agent:
                return True
        return False

    def is_suspicious_path(self, request):
        """Check for common vulnerable paths"""
        return any(
            path in request.path.lower() 
            for path in self.SUSPICIOUS_PATHS
        )

    def is_rate_limited(self, ip):
        """Implement sliding window rate limiting"""
        cache_key = f'rate_limit_{ip}'
        current_time = time.time()
        
        # Get existing requests or initialize
        requests = cache.get(cache_key, [])
        
        # Remove requests older than 1 minute
        requests = [
            req_time for req_time in requests 
            if current_time - req_time < 60
        ]
        
        if len(requests) >= self.RATE_LIMIT:
            return True
            
        requests.append(current_time)
        cache.set(cache_key, requests, timeout=60)
        return False

    def is_brute_force_attempt(self, ip):
        """Check for excessive login attempts"""
        cache_key = f'login_attempts_{ip}'
        attempts = cache.get(cache_key, 0)
        
        if attempts >= self.BRUTE_FORCE_LIMIT:
            return True
            
        cache.set(cache_key, attempts + 1, timeout=60)
        return False

    def contains_malicious_input(self, request):
        """Check for SQL injection and XSS patterns"""
        sql_regex = re.compile(r'(\b(union|select|insert|delete|drop|alter|--|#)\b)', re.IGNORECASE)
        xss_regex = re.compile(r'<script|javascript:|on\w+=', re.IGNORECASE)
        
        # Check GET parameters
        for param, value in request.GET.items():
            if sql_regex.search(value) or xss_regex.search(value):
                return True
                
        # Check POST data
        if request.method == 'POST':
            for param, value in request.POST.items():
                if sql_regex.search(value) or xss_regex.search(value):
                    return True
                    
        return False

    def add_security_headers(self, response):
        """Add security headers to all responses"""
        headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Content-Security-Policy': "default-src 'self'",
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Referrer-Policy': 'same-origin',
        }
        
        for header, value in headers.items():
            response[header] = value
            
        return response

    def block_request(self, request, reason):
        """Handle blocked requests"""
        # Log the blocked request (you should implement proper logging)
        print(f"Blocked request from {get_client_ip(request)[0]}: {reason}")
        
        # Store in cache to potentially block future requests
        cache_key = f'blocked_{get_client_ip(request)[0]}'
        cache.set(cache_key, True, timeout=self.BLOCK_DURATION)
        
        return JsonResponse(
            {'error': 'Access denied', 'reason': reason},
            status=403
        )