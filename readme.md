# Jeu du Pendu

Ceci est un petit projet pour créer un jeu classique **Jeu du Pendu** en JavaScript. L'objectif principal de ce projet est de pratiquer et d'apprendre à écrire des tests en utilisant divers outils et frameworks, y compris **Jest** et **Playwright**.

## Développement axé sur les tests

Le projet est structuré pour encourager l'écriture de tests pour chaque fonctionnalité du jeu.

---

## Démarrage

### Exécuter le jeu

Pour lancer le jeu, copiez et renommez le fichier `.env.example` en `.env`, puis configurez la variable **PORT** à `3030`.

Ensuite, exécutez la commande suivante :

```bash
npm start
```

Cela démarrera le serveur, et vous pourrez jouer au jeu en visitant **http://localhost:3030** dans votre navigateur.

---

### Exécuter les tests

Ce projet utilise **Jest** pour les tests unitaires et **Playwright** pour les tests d'intégration. Pour lancer les tests, utilisez la commande suivante :

```bash
npm test
```

Les tests garantissent que la logique du jeu fonctionne correctement et démontrent les meilleures pratiques du développement piloté par les tests.

---

## Structure du projet

- **game.js** : Contient la logique principale du jeu.
- **tools.js** : Fonctions utilitaires utilisées dans le jeu.
- **test/** : Contient les fichiers de test pour chaque module (par exemple, `game.test.js`, `tools.test.js`).
- **index.js** : Fichier principal qui configure l'application Express et les routes.
- **public/** : Fichiers statiques tels que HTML, CSS et JavaScript côté client.
- **views/** : Modèles **EJS** utilisés pour afficher l'interface du jeu.
- **database.js** : Gère les interactions avec la base de données SQLite.
- **style.css** : Feuille de style principale pour le jeu.
- **words_fr.txt** : Liste des mots français pour le jeu.
