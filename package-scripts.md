# Package.json Scripts Explained

## Available Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "NODE_ENV=development tsx server/index.ts",
    "client": "cd client && npm run dev",
    "build": "npm run build:client && npm run build:server",
    "build:client": "cd client && npm run build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --outfile=dist/server.js",
    "start": "node dist/server.js"
  }
}
```

## Development
- `npm run dev` - Starts both client and server in development mode
- `npm run server` - Starts only the Express server
- `npm run client` - Starts only the Vite dev server

## Production Build
- `npm run build` - Builds both client and server for production
- `npm run start` - Starts the production server

## Vercel Deployment
Vercel automatically runs:
1. `npm install` - Install dependencies
2. `npm run build` - Build the application
3. Deploys according to vercel.json configuration

The vercel.json file handles:
- Server function configuration (60s timeout)
- Static file serving for the client
- API route mapping
- Environment variable injection