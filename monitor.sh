#!/bin/bash

# Somerset Window Cleaning - Astro Dev Server Monitor
# This script monitors the Astro development server and reports issues

SERVER_URL="http://localhost:4321"
CHECK_INTERVAL=5
ERROR_COUNT=0
BOOKING_CHECKED=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    local level=$1
    local message=$2
    local timestamp=$(date +"%H:%M:%S")
    
    case $level in
        "error")
            echo -e "${RED}[$timestamp] ERROR: $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}[$timestamp] WARNING: $message${NC}"
            ;;
        "success")
            echo -e "${GREEN}[$timestamp] SUCCESS: $message${NC}"
            ;;
        *)
            echo -e "${BLUE}[$timestamp] INFO: $message${NC}"
            ;;
    esac
}

# Function to check server health
check_server() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" -m 3 "$SERVER_URL")
    echo "$response"
}

# Function to check specific endpoint
check_endpoint() {
    local endpoint=$1
    local response=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$SERVER_URL$endpoint")
    echo "$response"
}

# Function to check for EmailJS in booking form
check_booking_form() {
    local content=$(curl -s -m 5 "$SERVER_URL/booking-2step")
    if [[ $content == *"emailjs"* ]] || [[ $content == *"EmailJS"* ]]; then
        echo "found"
    else
        echo "missing"
    fi
}

# Main monitoring loop
main() {
    clear
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Somerset Window Cleaning - Server Monitor${NC}"
    echo -e "${BLUE}========================================${NC}"
    log "info" "Starting server monitor for $SERVER_URL"
    log "info" "Press Ctrl+C to stop"
    echo ""
    
    # Initial checks
    log "info" "Performing initial health checks..."
    
    local initial_status=$(check_server)
    if [[ $initial_status == "200" ]]; then
        log "success" "Server is running and healthy"
    else
        log "error" "Server is not responding (Status: $initial_status)"
        log "warning" "Make sure 'npm run dev' is running"
    fi
    
    # Check critical pages
    log "info" "Checking critical endpoints..."
    
    local booking_status=$(check_endpoint "/booking-2step")
    if [[ $booking_status == "200" ]]; then
        log "success" "Booking form page: OK"
        
        # Check EmailJS integration
        local emailjs_status=$(check_booking_form)
        if [[ $emailjs_status == "found" ]]; then
            log "success" "EmailJS integration: FOUND"
        else
            log "warning" "EmailJS integration: NOT DETECTED"
        fi
    else
        log "error" "Booking form page: Status $booking_status"
    fi
    
    local services_status=$(check_endpoint "/services")
    if [[ $services_status == "200" ]]; then
        log "success" "Services page: OK"
    else
        log "error" "Services page: Status $services_status"
    fi
    
    echo ""
    log "info" "Continuous monitoring started..."
    echo ""
    
    # Continuous monitoring
    while true; do
        local status=$(check_server)
        
        if [[ $status != "200" ]]; then
            ((ERROR_COUNT++))
            
            if [[ $ERROR_COUNT -eq 1 ]]; then
                log "error" "Server not responding (Status: $status)"
            elif [[ $ERROR_COUNT -eq 3 ]]; then
                log "error" "Server has been down for 15 seconds!"
                log "warning" "Check the terminal running 'npm run dev' for errors"
            elif [[ $((ERROR_COUNT % 10)) -eq 0 ]]; then
                log "error" "Server still down (${ERROR_COUNT} failed checks)"
            fi
        else
            if [[ $ERROR_COUNT -gt 0 ]]; then
                log "success" "Server is back online!"
                ERROR_COUNT=0
            fi
            
            # Periodically check booking form (every minute)
            if [[ $((SECONDS % 60)) -lt $CHECK_INTERVAL ]] && [[ $BOOKING_CHECKED == false ]]; then
                local booking_status=$(check_endpoint "/booking-2step")
                if [[ $booking_status != "200" ]]; then
                    log "warning" "Booking form page issue detected (Status: $booking_status)"
                fi
                BOOKING_CHECKED=true
            elif [[ $((SECONDS % 60)) -ge $CHECK_INTERVAL ]]; then
                BOOKING_CHECKED=false
            fi
        fi
        
        sleep $CHECK_INTERVAL
    done
}

# Trap Ctrl+C
trap 'echo -e "\n${BLUE}Monitor stopped.${NC}"; exit 0' INT

# Run main function
main