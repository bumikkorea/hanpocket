# Michelin Guide Seoul Auto-Refresh Worker

A Cloudflare Worker that automatically refreshes Michelin Guide Seoul restaurant data on a scheduled basis using cron triggers.

## 🚀 Features

- **Automated Data Refresh**: Runs on scheduled cron jobs to keep restaurant data current
- **Multiple Data Sources**: Uses official Michelin API with web scraping fallback
- **Error Handling**: Comprehensive error handling with notifications
- **Manual Triggers**: HTTP endpoints for manual refresh and health checks
- **Data Processing**: Normalizes and structures restaurant data
- **Notification System**: Success/error notifications via webhooks

## 📅 Schedule

The worker runs on the following schedule (Korea Standard Time):

- **Daily**: 6:00 AM KST - General data refresh
- **Monday**: 2:00 PM KST - Weekly comprehensive update  
- **Friday**: 10:00 PM KST - Weekend preparation update

## 🛠 Setup

### 1. Prerequisites

- Cloudflare account with Workers plan
- Node.js 16+ installed
- Wrangler CLI installed globally

```bash
npm install -g wrangler
```

### 2. Authentication

```bash
# Login to Cloudflare
wrangler login

# Verify authentication
wrangler whoami
```

### 3. Environment Variables

Set the following environment variables in your Cloudflare Workers dashboard:

#### Required Variables

```bash
# Database update endpoint (your HanPocket API)
DATABASE_UPDATE_ENDPOINT="https://your-api.com/api/restaurants/michelin/update"

# API key for database updates
DATABASE_API_KEY="your-secure-api-key"
```

#### Optional Variables

```bash
# Michelin official API key (if available)
MICHELIN_API_KEY="your-michelin-api-key"

# Notification webhooks
NOTIFICATION_WEBHOOK="https://your-webhook.com/success"
ERROR_NOTIFICATION_WEBHOOK="https://your-webhook.com/error"
```

### 4. Deploy

```bash
# Install dependencies
npm install

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## 🔧 Configuration

### Cron Schedule

Edit the cron schedule in `wrangler.toml`:

```toml
[triggers]
crons = [
  "0 21 * * *",  # Daily at 6:00 AM KST
  "0 5 * * 1",   # Monday at 2:00 PM KST
  "0 13 * * 5"   # Friday at 10:00 PM KST
]
```

### Environment-Specific Settings

Different environments can have different configurations:

```toml
[env.production.vars]
ENVIRONMENT = "production"

[env.staging.vars]
ENVIRONMENT = "staging"
```

## 📡 API Endpoints

### Manual Refresh
```bash
GET https://your-worker.workers.dev/refresh
```

### Health Check
```bash  
GET https://your-worker.workers.dev/health
```

## 🧪 Development

### Local Development

```bash
# Start local development server
npm run dev

# Test the worker locally
curl http://localhost:8787/health
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch
```

### Monitoring

```bash
# View real-time logs
npm run tail

# View logs for specific deployment
wrangler tail --env production
```

## 📊 Data Structure

The worker processes restaurant data into the following format:

```json
{
  "id": "michelin-12345",
  "name": "Restaurant Name",
  "nameKo": "레스토랑 이름", 
  "nameEn": "Restaurant Name",
  "address": "Seoul Address",
  "addressKo": "서울 주소",
  "district": "강남구",
  "cuisine": "Korean",
  "stars": 1,
  "priceRange": "50000-100000",
  "phone": "+82-2-1234-5678",
  "website": "https://restaurant.com",
  "description": "Restaurant description",
  "coordinates": {
    "lat": 37.5665,
    "lng": 126.9780
  },
  "lastMichelinUpdate": "2024-02-25T10:00:00.000Z",
  "lastDataRefresh": "2024-02-25T10:00:00.000Z",
  "status": "active"
}
```

## 🔍 Data Sources

### Primary: Official Michelin API
- Uses official Michelin Guide API when available
- Provides structured, reliable data
- Requires API key authentication

### Fallback: Web Scraping
- Scrapes Michelin Guide Seoul website
- Parses HTML content for restaurant data
- More fragile but always available

## 🚨 Error Handling

The worker includes comprehensive error handling:

- **API Failures**: Automatic fallback to scraping
- **Network Issues**: Retry logic with exponential backoff
- **Data Validation**: Ensures data quality before database updates
- **Notification**: Sends alerts for failures via webhooks

## 🔧 Troubleshooting

### Common Issues

#### 1. Worker Not Triggering on Schedule
- Check cron syntax in `wrangler.toml`
- Verify worker is deployed successfully
- Check Cloudflare Workers dashboard for trigger logs

#### 2. Database Update Failures  
- Verify `DATABASE_UPDATE_ENDPOINT` is correct
- Check `DATABASE_API_KEY` is valid
- Ensure your API accepts the data format

#### 3. Scraping Failures
- Michelin website structure may have changed
- Update selectors in `scrapeMichelinGuideSeoul()` function
- Check User-Agent string requirements

### Debugging

```bash
# View detailed logs
wrangler tail --format pretty

# Test manual trigger
curl https://your-worker.workers.dev/refresh

# Check health status
curl https://your-worker.workers.dev/health
```

## 🚀 Deployment

### Staging Deployment

```bash
npm run deploy:staging
```

### Production Deployment

```bash
npm run deploy:production
```

### Rollback

```bash
# View deployment history
wrangler deployments list

# Rollback to specific version
wrangler rollback [DEPLOYMENT_ID]
```

## 📈 Monitoring & Analytics

- View worker analytics in Cloudflare dashboard
- Monitor request volume and success rates
- Set up alerts for error thresholds
- Track data freshness and update frequency

## 🔐 Security

- All API keys stored as environment variables
- Uses secure HTTPS for all requests
- Validates data before database updates
- Rate limiting on manual refresh endpoints

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check Cloudflare Workers documentation
- Review worker logs for troubleshooting