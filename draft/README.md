# M3DL Simple

Version légère du calculateur M3DL réalisée uniquement avec HTML, CSS et JavaScript classiques. Elle ne contient ni Three.js, ni animation 3D, ni framework, ni étape de compilation.

Ce dossier est un site autonome. Il ne dépend pas du `package.json`, du code source ou du build Vite du site principal.

## Lancer directement

Vous pouvez ouvrir `index.html` directement dans votre navigateur.

## Lancer avec un serveur local

Depuis le dossier `draft/` :

```bash
python -m http.server 8000
```

Puis ouvrez `http://localhost:8000`.

Cette méthode ne demande aucune installation npm ni aucune compilation.

## Modifier 60% / 40%

La pondération se trouve dans le formulaire **Ajouter une matière**. Choisissez la répartition souhaitée avant d'ajouter la matière. Modifier une valeur ajuste automatiquement l'autre pour garder un total de 100%.

Chaque matière sauvegarde sa propre répartition. Une matière peut donc utiliser 60/40 et une autre 70/30. Une nouvelle matière commence par défaut à 60/40.

## Conservation des matières

Les matières de cette version sont enregistrées dans le stockage local du navigateur. Elles restent distinctes de celles du site principal et ne suivent pas automatiquement un changement de navigateur, d'appareil ou d'adresse du site. Effacer les données du navigateur supprime cette sauvegarde locale.

## Fichiers

- `index.html` — contenu et formulaire
- `style.css` — design simple et responsive
- `app.js` — calculs, pondération et sauvegarde locale
