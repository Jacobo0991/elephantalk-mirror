import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  mongo: {
    uri: process.env.MONGO_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  toxicity: {
    url: process.env.TOXICITY_URL,
    threshold: parseFloat(process.env.TOXICITY_THRESHOLD),
  },
}));
