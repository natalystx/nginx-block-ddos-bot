# Nginx Bot Blocking and Rate Limiting Configuration

This nginx configuration provides comprehensive protection against bots, scrapers, e2e testing tools, and high-volume spam attacks while allowing legitimate traffic.

## Features

- **Bot Blocking**: Blocks common web scrapers, vulnerability scanners, and automated tools
- **E2E Testing Tool Blocking**: Prevents unauthorized testing tools from accessing your site
- **Rate Limiting**: Protects against spam and DDoS attacks with configurable request limits
- **Googlebot Whitelisting**: Allows Googlebot for SEO while blocking other bots
- **Security Headers**: Additional protection against common web vulnerabilities

## Testing the Configuration

### Prerequisites

1. Build and run the Docker container:

```bash
docker build -t nginx-test .
docker run -d -p 8080:80 --name nginx-test-container nginx-test
```

### Test Cases

#### 1. Testing Bot Blocking

**Test blocked bots:**

```bash
# Test AhrefsBot (should return 403)
curl -H "User-Agent: AhrefsBot/7.0" http://localhost:8080/
```

**Expected Output:**

```html
<html>
  <head>
    <title>403 Forbidden</title>
  </head>
  <body>
    <center><h1>403 Forbidden</h1></center>
    <hr />
    <center>nginx/1.25.3</center>
  </body>
</html>
```

**Test other blocked bots:**

```bash
# Puppeteer (should return 403)
curl -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/91.0.4472.114 Safari/537.36 Puppeteer" http://localhost:8080/

# Selenium WebDriver (should return 403)
curl -H "User-Agent: selenium/3.141.0 (python linux)" http://localhost:8080/

# Playwright (should return 403)
curl -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 Playwright" http://localhost:8080/

# Empty User-Agent (should return 403)
curl -H "User-Agent:" http://localhost:8080/
```

**Test allowed Googlebot:**

```bash
# Googlebot (should return 200)
curl -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" http://localhost:8080/
```

**Expected Output:**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Welcome to nginx!</title>
  </head>
  <body>
    <h1>Welcome to nginx!</h1>
    <!-- Your index.html content -->
  </body>
</html>
```

#### 2. Testing Rate Limiting

**Test general rate limiting (10 requests per second):**

```bash
# Send rapid requests to trigger rate limiting
for i in {1..25}; do
  curl -w "Request $i: HTTP %{http_code}\n" -o /dev/null -s http://localhost:8080/
  sleep 0.05  # 50ms between requests = 20 requests/second
done
```

**Expected Output:**

```text
Request 1: HTTP 200
Request 2: HTTP 200
...
Request 20: HTTP 200
Request 21: HTTP 503
Request 22: HTTP 503
Request 23: HTTP 503
...
```

**Test API rate limiting (30 requests per minute):**

```bash
# Test API endpoint rate limiting
for i in {1..15}; do
  curl -w "API Request $i: HTTP %{http_code}\n" -o /dev/null -s http://localhost:8080/api/test
  sleep 1
done
```

**Test auth endpoint rate limiting (5 requests per minute):**

```bash
# Test strict auth rate limiting
for i in {1..8}; do
  curl -w "Auth Request $i: HTTP %{http_code}\n" -o /dev/null -s http://localhost:8080/login
  sleep 5
done
```

**Expected Output for Rate Limiting:**

When rate limit is exceeded:

```html
<html>
  <head>
    <title>503 Service Temporarily Unavailable</title>
  </head>
  <body>
    <center><h1>503 Service Temporarily Unavailable</h1></center>
    <hr />
    <center>nginx/1.25.3</center>
  </body>
</html>
```

#### 3. Testing Normal User Access

**Test legitimate browser access:**

```bash
# Normal browser request (should return 200)
curl -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36" http://localhost:8080/
```

#### 4. Testing Security Headers

**Check security headers:**

```bash
curl -I http://localhost:8080/
```

**Expected Output:**

```http
HTTP/1.1 200 OK
Server: nginx/1.25.3
Date: Mon, 15 Jul 2025 10:30:00 GMT
Content-Type: text/html
Content-Length: 615
Last-Modified: Mon, 15 Jul 2025 10:00:00 GMT
Connection: keep-alive
ETag: "64b2d8a0-267"
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Accept-Ranges: bytes
```

### Monitoring and Logs

**View access logs:**

```bash
docker exec nginx-test-container tail -f /var/log/nginx/access.log
```

**View error logs:**

```bash
docker exec nginx-test-container tail -f /var/log/nginx/error.log
```

**Expected log entries for blocked requests:**

```text
192.168.1.100 - - [15/Jul/2025:10:30:15 +0000] "GET / HTTP/1.1" 403 153 "-" "AhrefsBot/7.0" "-"
192.168.1.100 - - [15/Jul/2025:10:30:20 +0000] "GET / HTTP/1.1" 503 197 "-" "Mozilla/5.0..." "-"
```

## Configuration Details

### Rate Limiting Zones

- **General**: 10 requests/second with burst of 20
- **API**: 30 requests/minute with burst of 10
- **Auth**: 5 requests/minute with burst of 3

### Blocked User Agents

The configuration blocks these categories:

- Web scrapers (AhrefsBot, SemrushBot, etc.)
- Search engine bots (except Googlebot)
- E2E testing tools (Playwright, Puppeteer, Selenium, etc.)
- Vulnerability scanners
- Empty User-Agent strings

### Whitelisted

- Googlebot (for SEO)
- Legitimate browser User-Agent strings

## Cleanup

```bash
# Stop and remove the test container
docker stop nginx-test-container
docker rm nginx-test-container
docker rmi nginx-test
```

## Production Notes

1. **Adjust Rate Limits**: Modify the rate limiting values based on your traffic patterns
2. **Monitor Logs**: Keep an eye on blocked requests to ensure legitimate traffic isn't affected
3. **Update Domain**: Change `your_domain.com` to your actual domain in the nginx.conf
4. **SSL/TLS**: Add HTTPS configuration for production use
5. **Backup**: Always backup your working configuration before making changes
