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

Utilisez les deux champs de la section **Pondération**. Modifier une valeur ajuste automatiquement l'autre pour garder un total de 100%.

La valeur est sauvegardée dans le navigateur. La valeur par défaut est définie ici dans `app.js` :

```js
return { examWeight: 60, subjects: [] };
```

Remplacez `60` par exemple par `70` pour démarrer avec 70% examen et 30% contrôle continu.

## Fichiers

- `index.html` — contenu et formulaire
- `style.css` — design simple et responsive
- `app.js` — calculs, pondération et sauvegarde locale
