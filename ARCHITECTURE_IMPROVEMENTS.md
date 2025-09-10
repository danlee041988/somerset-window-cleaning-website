# Somerset Window Cleaning - Architecture Improvements

Based on Context7 patterns and REF best practices.

## 1. Enhanced Data Intelligence

### Current State
- Basic booking form → Supabase
- Simple kb_items for FAQs

### Recommended Enhancement
```sql
-- Add business intelligence tables
CREATE TABLE customer_intelligence (
  customer_email VARCHAR(255) PRIMARY KEY,
  lifetime_value DECIMAL(10,2),
  booking_frequency VARCHAR(50), -- 'weekly', 'monthly', 'quarterly'
  last_service_date DATE,
  churn_risk_score FLOAT, -- 0-1
  preferred_service VARCHAR(100),
  weather_sensitivity BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_patterns (
  postcode VARCHAR(10),
  optimal_route_day VARCHAR(20),
  average_job_duration INTEGER,
  seasonal_demand JSONB, -- {"spring": 1.2, "summer": 1.0, ...}
  competitor_density INTEGER
);
```

## 2. Real-time Monitoring (Context7 Style)

### Add Supabase Functions
```typescript
// Booking Anomaly Detection
const detectBookingAnomaly = async (booking: Booking) => {
  const patterns = await getCustomerPatterns(booking.email);
  
  const anomalyScore = calculateAnomalyScore({
    unusualTime: isUnusualBookingTime(booking.created_at),
    newArea: !isServiceArea(booking.postcode),
    priceDeviation: Math.abs(booking.quote - patterns.avg_quote) / patterns.avg_quote,
    serviceMismatch: booking.service !== patterns.usual_service
  });
  
  if (anomalyScore > 0.7) {
    await sendAlert('High anomaly booking detected', booking);
  }
};
```

## 3. Customer Lifecycle Automation

### Implement Retention System
```typescript
// Supabase Edge Function: customer-lifecycle
export async function checkCustomerHealth() {
  const customers = await getActiveCustomers();
  
  for (const customer of customers) {
    const daysSinceService = getDaysSince(customer.last_service);
    
    // Pattern from context7: employment status detection
    if (daysSinceService > 90) {
      await updateCustomerStatus(customer.id, 'at_risk');
      await triggerWinBackCampaign(customer);
    } else if (daysSinceService > 60) {
      await sendReminderEmail(customer);
    }
  }
}
```

## 4. Operational Intelligence

### Route Optimization
```typescript
interface RouteOptimization {
  date: Date;
  postcodes: string[];
  optimal_sequence: string[];
  estimated_duration: number;
  weather_risk: 'low' | 'medium' | 'high';
}

// Group bookings by area for efficiency
const optimizeWeeklyRoutes = async () => {
  const bookings = await getUpcomingBookings();
  const routes = groupByPostcodePrefix(bookings);
  
  return routes.map(route => ({
    ...route,
    efficiency_score: calculateRouteEfficiency(route),
    weather_backup_day: getAlternativeDay(route.date)
  }));
};
```

## 5. Enhanced Knowledge Base

### Upgrade kb_items to Context-Aware
```sql
ALTER TABLE kb_items ADD COLUMN context_tags TEXT[];
ALTER TABLE kb_items ADD COLUMN usage_count INTEGER DEFAULT 0;
ALTER TABLE kb_items ADD COLUMN effectiveness_score FLOAT;

-- Track which answers lead to bookings
CREATE TABLE kb_conversions (
  id SERIAL PRIMARY KEY,
  kb_item_id INTEGER REFERENCES kb_items(id),
  resulted_in_booking BOOLEAN,
  user_feedback VARCHAR(10), -- 'helpful', 'not_helpful'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 6. Deployment Architecture

### Current
```
GitHub → Vercel → Single deployment
```

### Recommended
```
GitHub
  ├── main branch → Production (Vercel)
  ├── staging branch → Staging (Vercel Preview)
  └── feature/* → Preview deployments

Monitoring:
  - Vercel Analytics (built-in)
  - Supabase Realtime subscriptions
  - Custom alerts via Edge Functions
```

## 7. Security Enhancements

### Add Rate Limiting
```typescript
// In Supabase Edge Function
const RATE_LIMITS = {
  bookings: { max: 5, window: '1h', per: 'ip' },
  kb_queries: { max: 50, window: '15m', per: 'ip' }
};

export const rateLimit = async (req: Request, limit: keyof typeof RATE_LIMITS) => {
  const ip = req.headers.get('x-forwarded-for');
  const key = `rate_limit:${limit}:${ip}`;
  // Implementation using Supabase or Redis
};
```

## Implementation Priority

1. **Week 1**: Customer intelligence table + basic anomaly detection
2. **Week 2**: Route optimization for operational efficiency  
3. **Week 3**: Enhanced kb_items with conversion tracking
4. **Week 4**: Automated customer lifecycle management

## Monitoring Success

- **KPI Dashboard**: Booking conversion, customer retention, route efficiency
- **Alerts**: Anomalies, churn risk, weather disruptions
- **A/B Testing**: Knowledge base effectiveness, email campaigns

---

This brings Somerset Window Cleaning to Context7-level intelligence while maintaining simplicity.