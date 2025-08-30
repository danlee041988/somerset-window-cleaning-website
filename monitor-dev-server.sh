#!/bin/bash

# Somerset Window Cleaning - Astro Development Server Monitor
# Comprehensive monitoring for development server health and HMR functionality

set -e

LOG_FILE="dev.log"
PID_FILE="dev.pid"
HEALTH_CHECK_INTERVAL=5
MAX_RESTART_ATTEMPTS=3
RESTART_COUNT=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_with_timestamp() {
    echo -e "[$(date '+%H:%M:%S')] $1"
}

check_server_health() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/ 2>/dev/null || echo "000")
    if [ "$response" = "200" ]; then
        return 0
    else
        return 1
    fi
}

check_websocket_health() {
    # Check for WebSocket errors in the log
    if tail -20 "$LOG_FILE" | grep -q "WebSocket.*error\|WS.*error"; then
        return 1
    fi
    return 0
}

check_hmr_functionality() {
    # Check if HMR is working by looking for recent file change detections
    if tail -20 "$LOG_FILE" | grep -q "file changed\|updated\|invalidated"; then
        log_with_timestamp "${GREEN}✓ HMR is actively detecting changes${NC}"
        return 0
    fi
    return 0  # Not an error if no recent changes
}

check_build_errors() {
    if tail -20 "$LOG_FILE" | grep -qE "ERROR|Failed to|Cannot resolve|Module not found"; then
        log_with_timestamp "${RED}⚠ Build errors detected:${NC}"
        tail -20 "$LOG_FILE" | grep -E "ERROR|Failed to|Cannot resolve|Module not found" | tail -5
        return 1
    fi
    return 0
}

check_booking_form_errors() {
    if tail -20 "$LOG_FILE" | grep -qE "EmailJS|Supabase.*error|booking.*error"; then
        log_with_timestamp "${YELLOW}⚠ Booking form / EmailJS issues detected:${NC}"
        tail -20 "$LOG_FILE" | grep -E "EmailJS|Supabase.*error|booking.*error" | tail -3
        return 1
    fi
    return 0
}

restart_server() {
    if [ $RESTART_COUNT -ge $MAX_RESTART_ATTEMPTS ]; then
        log_with_timestamp "${RED}✗ Maximum restart attempts ($MAX_RESTART_ATTEMPTS) reached. Manual intervention required.${NC}"
        exit 1
    fi

    RESTART_COUNT=$((RESTART_COUNT + 1))
    log_with_timestamp "${YELLOW}↻ Restarting development server (attempt $RESTART_COUNT/$MAX_RESTART_ATTEMPTS)${NC}"
    
    # Kill existing server
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid
            sleep 2
        fi
    fi
    
    # Clear port 4321 if needed
    lsof -ti:4321 | xargs -r kill
    
    # Start new server
    npm run dev > "$LOG_FILE" 2>&1 & 
    echo $! > "$PID_FILE"
    
    sleep 5
    
    if check_server_health; then
        log_with_timestamp "${GREEN}✓ Development server restarted successfully (PID: $(cat $PID_FILE))${NC}"
        RESTART_COUNT=0
    else
        log_with_timestamp "${RED}✗ Server restart failed${NC}"
    fi
}

monitor_server() {
    log_with_timestamp "${BLUE}🚀 Starting Somerset Window Cleaning Dev Server Monitor${NC}"
    log_with_timestamp "${BLUE}📊 Monitoring: HTTP health, WebSocket/HMR, build errors, booking form${NC}"
    
    while true do
        # Check if process is still running
        if [ -f "$PID_FILE" ]; then
            local pid=$(cat "$PID_FILE")
            if ! ps -p $pid > /dev/null 2>&1; then
                log_with_timestamp "${RED}✗ Development server process died (PID: $pid)${NC}"
                restart_server
                sleep $HEALTH_CHECK_INTERVAL
                continue
            fi
        else
            log_with_timestamp "${RED}✗ PID file missing - server may not be running${NC}"
            restart_server
            sleep $HEALTH_CHECK_INTERVAL
            continue
        fi
        
        # HTTP Health Check
        if check_server_health; then
            log_with_timestamp "${GREEN}✓ Server responsive at http://localhost:4321${NC}"
        else
            log_with_timestamp "${RED}✗ Server not responding - health check failed${NC}"
            restart_server
            sleep $HEALTH_CHECK_INTERVAL
            continue
        fi
        
        # WebSocket Health Check
        if ! check_websocket_health; then
            log_with_timestamp "${YELLOW}⚠ WebSocket issues detected - HMR may not work properly${NC}"
        fi
        
        # Check for various issues
        check_hmr_functionality
        
        if ! check_build_errors; then
            log_with_timestamp "${YELLOW}⚠ Build errors present - check above for details${NC}"
        fi
        
        if ! check_booking_form_errors; then
            log_with_timestamp "${YELLOW}⚠ Booking form issues detected - check EmailJS integration${NC}"
        fi
        
        # Log recent server activity
        if tail -5 "$LOG_FILE" | grep -qE "astro|vite|content"; then
            log_with_timestamp "${BLUE}📝 Recent activity:${NC}"
            tail -5 "$LOG_FILE" | grep -E "astro|vite|content" | tail -2 | sed 's/^/    /'
        fi
        
        sleep $HEALTH_CHECK_INTERVAL
    done
}

# Handle script interruption
trap 'log_with_timestamp "${BLUE}🛑 Monitor stopped${NC}"; exit 0' INT TERM

# Start monitoring
monitor_server