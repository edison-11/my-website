# Database setup

This project uses MongoDB through Mongoose. MongoDB stores the website data; it does not use a standalone `.db` or SQL file. The connection is configured in `server/config/db.js` and read from `MONGO_URI` in the server environment.

## Local setup

1. Install and start MongoDB locally, or create a MongoDB Atlas cluster.
2. Copy `server/.env.example` to `server/.env`.
3. Set `MONGO_URI` to your MongoDB connection string. For a local MongoDB server, the default is `mongodb://127.0.0.1:27017/my-website`.
4. Set a private `JWT_SECRET` with at least 32 characters and adjust `CLIENT_URL` if the frontend uses another address.
5. Start the API from the project root with `npm --prefix server start`.

Mongoose creates collections as the application first writes each model. The models live in `server/models/` (categories, decorations, media, messages, service requests, site activity, site content, and users).

The `.env` file contains credentials and should stay local; do not commit it. See `server/.env.example` for the required settings.
