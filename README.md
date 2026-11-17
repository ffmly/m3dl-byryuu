# M3DL by Ryuu

Calculateur de moyenne pour étudiants universitaires algériens. Le projet principal utilise Vite, Three.js et GSAP. Une version simple, sans 3D et sans framework, est disponible dans [`draft/`](./draft/).

## Prérequis

- Node.js 20 ou plus récent
- npm

## Installer et lancer le site principal

```bash
npm install
npm run dev
```

Ouvrez ensuite l'adresse affichée par Vite, généralement `http://localhost:5173`.

## Créer la version de production

```bash
npm run build
npm run preview
```

Le résultat de production du site principal est généré dans `dist/`.

## Modifier la pondération 60% / 40%

Dans le site, utilisez la section **Pondération des notes**. Vous pouvez modifier le pourcentage de l'examen ou du contrôle continu. L'autre valeur est ajustée automatiquement afin que le total reste toujours égal à 100%.

- Avec **TD + TP**, la part du contrôle continu est divisée également entre TD et TP.
- Avec **TD seulement** ou **TP seulement**, toute la part du contrôle continu est utilisée.
- Avec **Examen seulement**, la note d'examen compte pour 100%.

La valeur choisie est sauvegardée dans le navigateur avec les autres données.

Pour changer la valeur par défaut dans le code, modifiez `examWeight: 60` dans `src/storage.js`.

## Version simple sans 3D

Le dossier `draft/` est un site autonome et séparé du projet Vite principal. Il possède ses propres fichiers et ses propres instructions dans `draft/README.md`.

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run preview` — prévisualisation du build
