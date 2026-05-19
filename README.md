# CloudWave Events Platform

A serverless cloud-based event management platform built on AWS as part of the AWS Serverless Bootcamp final project.

## Live Links
- **Frontend:** https://prabathbp.netlify.app
- **Backend API:** https://d307hyj1i7.execute-api.ap-southeast-1.amazonaws.com/dev
- **GitHub:** https://github.com/prabathbp/cloudwave-events

## AWS Services Used
- **AWS Lambda** — 8 serverless functions (Node.js)
- **API Gateway** — REST API with full CRUD routes
- **AWS Cognito** — User registration, login, and token authentication
- **Amazon S3** — File storage with pre-signed URLs
- **Amazon CloudFront** — CDN for image/file delivery (d2fq3ggoqy2oph.cloudfront.net)
- **AWS SES** — Email confirmation after event registration
- **Amazon EventBridge** — Scheduled daily reminder emails
- **AWS CloudWatch** — Logging for all Lambda functions
- **AWS Systems Manager Parameter Store** — Secrets management
- **GitHub Actions** — CI/CD pipeline (auto-deploy on push to main)
- **MongoDB Atlas** — NoSQL database (cloudwave-cluster)

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /events | Get all events |
| GET | /events/{id} | Get single event |
| POST | /events | Create event |
| PUT | /events/{id} | Update event |
| DELETE | /events/{id} | Delete event |
| POST | /registrations | Register for event |
| GET | /uploads/presigned-url | Get S3 upload URL |

## Features
- User registration and login via AWS Cognito
- Browse, create, update and delete events
- Upload event images via S3 pre-signed URLs
- Images delivered via CloudFront CDN
- Email confirmation after event registration (SES)
- Daily reminder emails for upcoming events (EventBridge scheduled job)
- Automatic backend deployment on git push to main (GitHub Actions)
- All API activity and errors logged to CloudWatch

## AWS Configuration
- **Region:** ap-southeast-1 (Singapore)
- **Cognito User Pool:** ap-southeast-1_oghlS18u1
- **Account ID:** 085435799876
- **IAM User:** cloudwave-dev

## Local Development
```bash
cd backend
npm install
npx serverless offline
```

## Deployment
```bash
cd backend
serverless deploy
```
Secrets are stored in AWS Systems Manager Parameter Store (/cloudwave/mongo-uri, /cloudwave/bucket-name, /cloudwave/ses-email).

## Architecture
```
User → React Frontend (Netlify: prabathbp.netlify.app)
     → AWS Cognito (Authentication)
     → API Gateway (https://d307hyj1i7.execute-api.ap-southeast-1.amazonaws.com/dev)
     → AWS Lambda (Node.js — 8 functions)
     → MongoDB Atlas (cloudwave-cluster)

Lambda → S3 (cloudwave-uploads-bucket) → CloudFront (d2fq3ggoqy2oph.cloudfront.net)
Lambda → SES (prabathbandara100@gmail.com)
Lambda → CloudWatch Logs

EventBridge (daily cron) → sendReminders Lambda → SES
GitHub Actions → serverless deploy → AWS Lambda + API Gateway
```