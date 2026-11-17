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

## Modifier la pondération 60% / 40% d'une matière

La pondération se règle séparément pour chaque matière dans le formulaire **Ajouter une matière**. Vous pouvez modifier le pourcentage de l'examen ou du contrôle continu avant d'ajouter la matière. L'autre valeur est ajustée automatiquement afin que le total reste toujours égal à 100%.

- Avec **TD + TP**, la part du contrôle continu est divisée également entre TD et TP.
- Avec **TD seulement** ou **TP seulement**, toute la part du contrôle continu est utilisée.
- Avec **Examen seulement**, la note d'examen compte pour 100%.

Chaque matière sauvegarde sa propre pondération. Lorsqu'une matière est modifiée, sa répartition est rechargée dans le formulaire.

La valeur utilisée par défaut pour une nouvelle matière est 60% examen / 40% contrôle continu.

## Version simple sans 3D

Le dossier `draft/` est un site autonome et séparé du projet Vite principal. Il possède ses propres fichiers et ses propres instructions dans `draft/README.md`.

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run preview` — prévisualisation du build
