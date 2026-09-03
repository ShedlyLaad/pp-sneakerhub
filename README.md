# SnaekersHub

Application mobile Expo/React Native (marketplace de sneakers) + API backend Node/Express/MongoDB.


## Comment activer le projet (2 terminaux)

Il faut démarrer le **backend** puis le **frontend**, dans cet ordre, chacun dans son propre terminal.

### 1. Backend (API + base de données)

Prérequis : MongoDB doit tourner en local et écouter sur `mongodb://localhost:27017` (vérifiable avec `mongosh`).

```bash
cd backend
npm install
npm run seed     # une seule fois : migre products.json vers MongoDB (ne fait rien si déjà fait)
npm run dev       # démarre l'API sur http://localhost:4000
```

Vérifier que ça marche : `curl http://localhost:4000/health` doit répondre `{"success":true,...}`.

### 2. Frontend (application mobile)

Dans un **second terminal** :

```bash
cd frontend
npm install
npm start
```

Une page Metro Bundler s'ouvre avec un QR code. Puis :
- **Sur votre téléphone** : installez l'app **Expo Go**, puis scannez le QR code (Android : dans l'app Expo Go ; iOS : avec l'appareil photo).
- **Sur un émulateur Android** : appuyez sur `a` dans le terminal (Android Studio doit être installé avec un émulateur configuré).
- **Sur le simulateur iOS** (Mac uniquement) : appuyez sur `i`.
- **Dans le navigateur** : appuyez sur `w`.

L'app appelle l'API sur `http://localhost:4000/api` par défaut, et bascule automatiquement sur `http://10.0.2.2:4000/api` pour l'émulateur Android. **Pour tester sur un téléphone physique** (Expo Go), le téléphone et l'ordinateur doivent être sur le même réseau Wi-Fi, et il faut indiquer l'adresse IP locale de la machine :

```bash
# trouver son IP locale : ipconfig (Windows) puis IPv4
EXPO_PUBLIC_API_URL=http://192.168.1.23:4000/api npm start
```

### Arrêter le projet
`Ctrl+C` dans chaque terminal arrête respectivement le frontend et le backend.

## Versions

- Node.js ≥ 20.19.4 recommandé (voir avertissement `EBADENGINE` si version inférieure)
- Expo SDK 57 (`~57.0.19`)
- React Native 0.86.3 / React 19.2.3
- React Navigation v7 (native-stack + bottom-tabs)
- MongoDB (local, `mongosh`)
