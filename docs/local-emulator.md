# Utiliser les émulateurs Firebase (stockage local)

Ce guide décrit comment exécuter toute la plateforme Firebase localement (Auth, Firestore, Storage) afin que tout le stockage soit local.

Prérequis
- Installer `firebase-tools` globalement ou dans le projet :
  ```powershell
  npm i -g firebase-tools
  # ou localement pour le projet
  npm i -D firebase-tools
  ```

Étapes pour démarrer l'environnement local
1) Copier le fichier `.env.local.example` en `.env.local` et ajuster si besoin :
```powershell
copy .env.local.example .env.local
```
2) Démarrer les émulateurs (dans un terminal) :
```powershell
npm run emulators
```
Par défaut: Auth 9099, Storage 9199; l'UI d'émulateurs est sur le port 4000.  
Note: Firestore n'est plus utilisé en production ni via les émulateurs (le stockage est uniquement local via l'adaptateur `localFirestore`).

3) Dans un autre terminal, lancer l'application Next.js :
- PowerShell (définit la variable d'environnement puis lance le dev) :
```powershell
$env:NEXT_PUBLIC_FIREBASE_EMULATOR = "true"; npm run dev
```
- Si vous voulez juste démarrer le dev server sans définir la variable (émulateurs déjà actifs):
```powershell
npm run dev
```

Notes
- L'application utilise la variable `NEXT_PUBLIC_FIREBASE_EMULATOR=true` pour se connecter aux émulateurs locaux; suivez la convention des variables d'exemple dans `.env.local.example` si vous voulez changer les hôtes/ports.

- Pour importer des données/démarrer avec un état persistant, utilisez les options `--import`/`--export-on-exit` de `firebase emulators:start`.

Exemple (démarrer emulateurs + serveur):
```powershell
# Terminal 1
npm run emulators
# Terminal 2
$env:NEXT_PUBLIC_FIREBASE_EMULATOR = "true"; npm run dev
```

Si tu veux que je configure le script `dev:local` pour générer un run cross-platform (ex: `cross-env`), je peux le faire aussi.

Lancement tout-en-un
---------------------
Si tu préfères lancer l’ensemble (émulateurs + Next.js) en une commande, utilise :

```powershell
npm run dev:local:all
```
Ce script exécute les émulateurs puis `next dev` simultanément et arrête les deux en cas d'erreur.

Adapter local (sans émulateurs)
---------------------------------
Si tu préfères ne pas utiliser les émulateurs mais stocker les données uniquement dans le navigateur (localStorage), l'application propose un adaptateur local (simplifié) qui émule un petit sous-ensemble de l'API Firestore.

Activer l'adaptateur local : définis `NEXT_PUBLIC_FIRESTORE_LOCAL=true` (ou lance `npm run dev:local`). Exemples :
```powershell
# PowerShell
$env:NEXT_PUBLIC_FIRESTORE_LOCAL = "true"; npm run dev
```
ou
```powershell
npm run dev:local
```

Remarques :
- Cet adaptateur est destiné au développement local / test et stocke les documents dans `localStorage`.
- Les APIs supportées (minimales) : `collection`, `doc`, `addDoc`, `setDoc`, `updateDoc`, `deleteDoc`, `getDoc`, `getDocs`, `onSnapshot`.
- Les requêtes (query/where/ordre complexe) ne sont pas implémentées dans cet adaptateur simplifié.
- Pour synchroniser entre onglets, l'adaptateur utilise l'événement `storage` et notifie les abonnements en temps réel.

Si tu veux que j'étende les API (requetes, transactions, indexations, import/export), dis exactement ce dont tu as besoin et je l'ajouterai.