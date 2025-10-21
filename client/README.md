# ShopifyGenie OMS - Frontend

Vue 3 + TypeScript + Vite + Tailwind CSS frontend for the ShopifyGenie Order Management System.

## Features

- 🎨 Modern UI with Tailwind CSS
- 🚀 Fast development with Vite
- 📱 Responsive design
- 🔐 JWT authentication
- 📊 Real-time data with GraphQL
- 🎯 Role-based access control
- 🌙 Dark mode ready

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type safety
- **Vite** - Next generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Apollo Client** - GraphQL client
- **Pinia** - State management
- **Vue Router** - Routing
- **Heroicons** - Beautiful icons

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file:

```env
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

## Project Structure

```
src/
├── assets/       # Static assets and styles
├── components/   # Reusable components
├── layouts/      # Layout components
├── router/       # Vue Router configuration
├── stores/       # Pinia stores
├── views/        # Page components
├── apollo.ts     # Apollo Client setup
└── main.ts       # Application entry
```

## Available Routes

- `/` - Dashboard
- `/orders` - Orders list
- `/orders/:id` - Order detail
- `/fulfillments` - Fulfillments list
- `/inventory` - Inventory management
- `/returns` - Returns management
- `/analytics` - Analytics dashboard
- `/settings` - Settings
- `/login` - Login page

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Docker

Build and run with Docker:

```bash
docker build -t shopify-oms-client .
docker run -p 3000:80 shopify-oms-client
```

## License

MIT

