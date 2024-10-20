import { neon, neonConfig } from '@neondatabase/serverless';

// Optional: Configure neonConfig for WebSocket support
neonConfig.webSocketConstructor = WebSocket;

const databaseUrl = process.env.DATABASE_URL!;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set in the environment variables');
  throw new Error('DATABASE_URL is not set');
}

const sql = neon('postgresql://form-data_owner:PVrbDd4zXjI2@ep-red-cloud-a2dcr76y.eu-central-1.aws.neon.tech/form-data?sslmode=require');

export { sql };