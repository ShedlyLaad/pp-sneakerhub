# SnaekersHub Backend

API REST Node.js/Express + MongoDB (Mongoose) pour l'application projetBoutique.

## Démarrage

```bash
cd backend
npm install
npm run seed   # migre products.json vers MongoDB (une seule fois)
npm run dev    # démarre le serveur avec nodemon sur http://localhost:4000
```

Base de données par défaut : `mongodb://localhost:27017/SnaekersHub` (voir `.env`).

## Endpoints

### Auth
- `POST /api/auth/register` `{ name, email, password }`
- `POST /api/auth/login` `{ email, password }`
- `GET /api/auth/me` (Bearer token)
- `PATCH /api/auth/me` `{ name?, address? }` (Bearer token)

### Produits
- `GET /api/products?search=&sort=A-Z|Z-A|Latest|price-asc|price-desc&category=`
- `GET /api/products/:id`
- `POST /api/products` (Bearer token) `{ name, price, description?, image?, storeLocation?, category?, stock? }`
- `PATCH /api/products/:id` (Bearer token, propriétaire uniquement)
- `DELETE /api/products/:id` (Bearer token, propriétaire uniquement)

### Panier (Bearer token requis)
- `GET /api/cart`
- `POST /api/cart/items` `{ productId, quantity? }`
- `PATCH /api/cart/items/:productId` `{ quantity }`
- `DELETE /api/cart/items/:productId`
- `DELETE /api/cart`

### Commandes (Bearer token requis)
- `POST /api/orders` `{ shippingAddress: { line1, city, postalCode?, country } }`
- `GET /api/orders`
- `GET /api/orders/:id`

Toutes les réponses ont la forme `{ success: boolean, data | message }`.
