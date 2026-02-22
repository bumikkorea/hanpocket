const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 보안 미들웨어
app.use(helmet());

// CORS 설정
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// 요청 제한 (DDoS 방지)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 15분당 최대 100개 요청
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// JSON 파싱 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 건상 확인 엔드포인트
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// OAuth API 라우터
const alipayRouter = require('./api/alipay');
app.use('/api/alipay', alipayRouter);

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: `Route ${req.method} ${req.originalUrl} not found` 
  });
});

// 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // 개발 환경에서는 에러 스택 포함
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 HanPocket OAuth Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // 필수 환경변수 확인
  const requiredEnvVars = [
    'ALIPAY_APP_ID',
    'ALIPAY_PRIVATE_KEY',
    'ALIPAY_PUBLIC_KEY'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.warn('⚠️  Missing environment variables:', missingEnvVars.join(', '));
    console.warn('   Please check your .env file');
  } else {
    console.log('✅ All required environment variables are set');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;