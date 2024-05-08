# API de l'application mobile Blinksport

## Description du Projet
Ce projet est une application mobile qui met en relation les personnes aveugles souhaitant faire du sport avec des bénévoles sportifs. L'application permet également de créer des groupes pour organiser des séances de sport à plusieurs. Elle intègre des fonctionnalités telles que la gestion de profils, la messagerie, la planification d'activités, et bien plus encore.

## Prérequis
- Node.js v20.13.0
- npm (version correspondante à celle de Node.js)
- PostgreSQL
- Un système capable d'exécuter des commandes Unix (Linux, MacOS, WSL pour Windows)

## Installation
1. **Cloner le projet** :
    ```bash
    git clone https://github.com/BlinkSport/backend.git
    cd back-end
    ```

2. **Installer les dépendances** :
    ```bash
    npm install
    ```

3. **Configurer l'environnement** :
    - Copiez le fichier `.env.example` en `.env` et modifiez les valeurs selon votre configuration :
        ```bash
        cp .env.example .env
        ```
    - Assurez-vous de remplacer les valeurs de `DB_USER`, `DB_PASSWORD`, et `DB_DATABASE` avec vos configurations de base de données locales.

4. **Configurer la base de données** :
    - Créez une base de données PostgreSQL correspondant aux détails fournis dans `.env`.
    - Exécutez les migrations :
        ```bash
        node ace migration:run
        ```

## Démarrage de l'Application
Pour démarrer l'application en mode développement, exécutez :
```bash
npm run dev
```
Visitez http://localhost:3333/ dans votre navigateur pour accéder à l'application.

## Structure du Projet
- app/Controllers - Contient les contrôleurs de votre application.
- app/Models - Modèles pour interagir avec la base de données.
- config/ - Fichiers de configuration pour divers aspects de l'application.
- database/migrations - Fichiers de migration pour la base de données.

## Contact
- Pour plus d'informations, contactez Peter Binate(https://github.com/Peter-Binate) et Faissel Friouchen(https://github.com/FicelloScript).
