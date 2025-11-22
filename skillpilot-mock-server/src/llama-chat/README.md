# 🦙 Llama Chat Service

A separate chat service using **Llama 3.3 70B Versatile** model through Groq API.

## 📋 Overview

This service provides chat functionality using the Llama 3.3 70B Versatile model. It's completely separate from the Langchain chat service and uses Groq's API for fast, free inference.

## 🚀 Setup

### 1. Get Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Create an API key
4. Copy your API key

### 2. Configure Environment Variable

Add to your `.env` file or `docker-compose.yml`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. For Docker

Add to `docker-compose.yml` in the `api` service:

```yaml
environment:
  GROQ_API_KEY: your_groq_api_key_here
```

## 📡 API Endpoints

### POST `/api/v1/llama-chat/chat`

Send a chat message to the Llama model.

**Request Body:**
```json
{
  "message": "What is machine learning?",
  "history": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "assistant",
      "content": "Hi! How can I help you?"
    }
  ]
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "response": "Machine learning is...",
    "model": "llama-3.3-70b-versatile"
  }
}
```

### GET `/api/v1/llama-chat/health`

Check if the Llama chat service is configured.

**Response:**
```json
{
  "status": "OK",
  "service": "Llama Chat Service",
  "model": "llama-3.3-70b-versatile",
  "configured": true,
  "message": "Llama chat service is ready"
}
```

## 🧪 Testing

### Test Health Check
```bash
curl http://localhost:3001/api/v1/llama-chat/health
```

### Test Chat (with API key)
```bash
curl -X POST http://localhost:3001/api/v1/llama-chat/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is artificial intelligence?"
  }'
```

## 🔧 Configuration

- **Model**: `llama-3.3-70b-versatile`
- **Temperature**: `0.7`
- **Max Tokens**: `1024`
- **API**: Groq (free tier available)

## 📝 Notes

- This service is separate from the Langchain chat service
- Requires `GROQ_API_KEY` environment variable
- Service will log a warning if API key is not configured
- Chat endpoint returns 503 if service is not configured

## 🎯 Features

- ✅ Fast inference with Groq API
- ✅ Free tier available
- ✅ Chat history support
- ✅ Health check endpoint
- ✅ Separate from Langchain service
- ✅ Error handling and logging

---

**Model**: Llama 3.3 70B Versatile  
**Provider**: Groq  
**Status**: Ready for functionality implementation

