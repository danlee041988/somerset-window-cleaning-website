#!/bin/bash

# Security Headers Verification Script
# This script checks if security headers are properly configured in production

PRODUCTION_URL="https://somersetwindowcleaning.co.uk"

echo "========================================="
echo "Security Headers Verification"
echo "========================================="
echo ""
echo "Checking security headers for: $PRODUCTION_URL"
echo ""

# Check headers using curl
echo "Fetching headers..."
headers=$(curl -s -I -X GET "$PRODUCTION_URL")

# Function to check if a header exists and print its value
check_header() {
    local header_name="$1"
    local header_value=$(echo "$headers" | grep -i "^$header_name:" | cut -d' ' -f2-)
    
    if [ -n "$header_value" ]; then
        echo "✅ $header_name: $header_value"
    else
        echo "❌ $header_name: NOT FOUND"
    fi
}

echo ""
echo "Security Headers Status:"
echo "------------------------"

# Check each security header
check_header "Content-Security-Policy"
check_header "X-Frame-Options"
check_header "X-Content-Type-Options"
check_header "Referrer-Policy"
check_header "X-XSS-Protection"
check_header "Permissions-Policy"
check_header "Strict-Transport-Security"

echo ""
echo "========================================="
echo "Additional Security Checks:"
echo "========================================="

# Check for common security issues
echo ""
echo "Checking for Server header exposure..."
server_header=$(echo "$headers" | grep -i "^Server:" | cut -d' ' -f2-)
if [ -n "$server_header" ]; then
    echo "⚠️  Server header exposed: $server_header"
else
    echo "✅ Server header not exposed"
fi

echo ""
echo "Checking for X-Powered-By header..."
powered_by=$(echo "$headers" | grep -i "^X-Powered-By:" | cut -d' ' -f2-)
if [ -n "$powered_by" ]; then
    echo "⚠️  X-Powered-By header exposed: $powered_by"
else
    echo "✅ X-Powered-By header not exposed"
fi

echo ""
echo "========================================="
echo "SSL/TLS Configuration:"
echo "========================================="

# Check SSL certificate
echo ""
echo "Checking SSL certificate..."
ssl_info=$(echo | openssl s_client -servername somersetwindowcleaning.co.uk -connect somersetwindowcleaning.co.uk:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate is valid"
    echo "$ssl_info"
else
    echo "❌ Could not verify SSL certificate"
fi

echo ""
echo "========================================="
echo "Security Headers Grade:"
echo "========================================="
echo ""
echo "For a detailed security analysis, visit:"
echo "https://securityheaders.com/?q=$PRODUCTION_URL"
echo "https://observatory.mozilla.org/analyze/$PRODUCTION_URL"
echo ""

# Count missing headers
missing_count=$(echo "$headers" | grep -c "NOT FOUND")

if [ $missing_count -eq 0 ]; then
    echo "🎉 All security headers are properly configured!"
else
    echo "⚠️  $missing_count security headers are missing"
fi

echo ""
echo "========================================="
echo "Verification complete!"
echo "========================================="