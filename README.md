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

Une case de note laissée vide est calculée comme 0 dans la moyenne de la matière. Renseignez les notes disponibles avant d'interpréter le résultat affiché.

Exemple avec **TD + TP** : examen 12, TD 14 et TP 16 donnent `12 × 0,60 + 14 × 0,20 + 16 × 0,20 = 13,20`. Les deux notes de contrôle continu reçoivent chacune la moitié des 40%.

La moyenne du semestre tient compte du coefficient de chaque matière : une note de 13 avec coefficient 2 et une note de 11 avec coefficient 1 donnent `(13 × 2 + 11 × 1) / 3 = 12,33`. Lorsque les deux semestres sont renseignés, la moyenne annuelle est leur moyenne simple.

## Version simple sans 3D

Le dossier `draft/` est un site autonome et séparé du projet Vite principal. Il possède ses propres fichiers et ses propres instructions dans `draft/README.md`.

## Données et sauvegarde

Les deux versions enregistrent les matières dans le stockage local du navigateur, avec des données séparées. Ouvrir la version simple ne transfère pas les matières du site principal. Pour conserver une copie des notes du site principal avant d'effacer les données du navigateur ou de changer d'appareil, utilisez ses boutons de sauvegarde et de chargement de fichier JSON.

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm run preview` — prévisualisation du build
