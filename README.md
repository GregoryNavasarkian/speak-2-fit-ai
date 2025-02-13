# Speak2Fit AI

## How To Run

### Dependencies

- Node v22
- Docker

### Development Mode

```
clone repository
npm ci
cd ./server && npm ci
cd ./client && npm ci
npm run dev
```

### Production Mode

#### Build with Docker

```
clone repository
cd speak-2-fit-ai
docker build -t speak2fit .
```

#### Run with Docker

```
docker run -dp 3000:3000 --name speak2fit <--env MONGO_URI="atlas-uri"> speak2fit
```

#### Stop and remove container

```
docker stop speak2fit
docker rm speak2fit
```
