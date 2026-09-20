# Déploiement

Marche à suivre pour mettre le jeu en ligne, et ce qu'il faut savoir avant de
recommencer. Les deux comptes sont connectés depuis le 19 septembre 2026.

## Ordre

Le serveur d'abord : le client a besoin de son adresse **à la compilation**,
donc déployer Vercel en premier voudrait dire recompiler ensuite.

## 1. Le serveur de jeu, sur Render

`render.yaml` est un blueprint : dans Render, « New » → « Blueprint » →
choisir le dépôt. Il déclare déjà :

```yaml
buildCommand: npm ci --legacy-peer-deps && npm run build:packages && npm run build --workspace @opfg/server
startCommand:  npm run start --workspace @opfg/server
healthCheckPath: /health
```

Une seule variable est à renseigner à la main, parce qu'elle dépend du domaine
Vercel qui n'existe pas encore :

| Variable | Valeur |
| --- | --- |
| `ALLOWED_ORIGINS` | `https://<projet>.vercel.app`, plus le domaine propre s'il y en a un. Les domaines de prévisualisation sont acceptés par joker. |

Render fournit `PORT` tout seul. `NODE_VERSION` est fixé à 22.

Vérifier ensuite que `https://<service>.onrender.com/health` répond
`{"status":"ok",...}`. En y ajoutant l'origine du site, la réponse dit aussi si
ce site serait accepté, ce qui est la seule façon de contrôler `ALLOWED_ORIGINS`
sans ouvrir le tableau de bord :

```
curl -H 'Origin: https://<le-domaine-du-site>' https://<service>.onrender.com/health
```

`"originAllowed": false` veut dire que le socket sera refusé et que la page
affichera « Serveur injoignable » alors que le serveur va très bien.
`"originsAreDefault": true` veut dire que la variable n'a jamais été
renseignée.

**Le plan gratuit de Render endort un service inactif.** Le premier joueur à
arriver attendra la reprise, une trentaine de secondes. Pour un jeu en temps
réel, cela veut dire qu'un plan payant est nécessaire dès qu'il y a de vrais
joueurs.

## 2. Le site, sur Vercel

Importer le dépôt. Vercel détecte l'application Next.js et place le **dossier
racine du projet sur `apps/web`** : c'est le réglage attendu, il ne faut pas le
ramener à la racine du dépôt. `vercel.json`, à la racine, fixe l'installation
la compilation et le dossier de sortie, et **ce fichier prime sur les réglages
de l'interface** : ce que montre « Build and Deployment » peut dater de
l'import, c'est `vercel.json` qui gagne, inutile d'y toucher.

Les trois valeurs sont écrites pour un dossier racine sur `apps/web`, donc
`outputDirectory` vaut `.next` et non `apps/web/.next`.

Ce qui rend cela possible est le script `prebuild` de `apps/web/package.json` :

```json
"prebuild": "tsc -b ../../packages/combat-core ../../packages/shared"
```

npm l'exécute automatiquement avant `build`, donc `@opfg/combat-core` et
`@opfg/shared` sont compilés d'où que la commande soit lancée — depuis
`apps/web` comme depuis la racine du dépôt. C'est ce qui manquait au premier
essai : la commande de compilation appelait `npm run build:packages`, un script
qui n'existe qu'à la racine, alors que Vercel la lançait depuis `apps/web`.

Reste une variable à renseigner :

| Variable | Valeur |
| --- | --- |
| `NEXT_PUBLIC_GAME_SERVER_URL` | `https://<service>.onrender.com` |

**Cette variable est figée dans le bundle du navigateur à la compilation.** La
changer demande un redéploiement, pas un redémarrage. Elle doit commencer par
`https://` : depuis une page en HTTPS, le navigateur refuse une adresse en
`http://` sans le dire, et la page ne peut que rapporter un serveur
injoignable. Une valeur vide compte comme absente.

## Si la page dit « Serveur injoignable »

Commencer par établir si le serveur est réellement en panne, parce que la
réponse est le plus souvent non :

1. `https://<service>.onrender.com/health` répond-il `status: ok` ? Si oui, le
   serveur est vivant et la cause est dans le chemin du client.
2. La page nomme-t-elle une raison sous le bandeau rouge ? Elle reconnaît les
   deux erreurs qu'elle peut voir : un client compilé sans adresse de serveur,
   et une adresse en `http://` servie depuis une page en `https://`.
3. Sinon, interroger `/health` avec l'origine du site, comme au point 1 :
   `originAllowed: false` désigne `ALLOWED_ORIGINS` sur Render.

Le plan gratuit de Render endort un service inactif : une première requête peut
mettre une trentaine de secondes sans que rien ne soit cassé. `uptime` dans la
réponse de `/health` distingue un réveil d'un service qui tourne depuis
longtemps.

## 3. Vérifier

1. Ouvrir le site, le bandeau doit afficher « connecté » et un ping.
2. Créer une partie, rejoindre avec le code depuis **une autre machine**, pas
   un autre onglet.
3. Jouer un round complet et regarder si les deux écrans restent d'accord sur
   le chrono et les barres de vie.
4. Couper le réseau d'un des deux pendant douze secondes : l'autre doit gagner
   par forfait.

## Avant d'ouvrir au public

Les planches de sprites viennent d'un rip de ROM et ne sont pas libres de
droits. Un déploiement public les rediffuse. Voir `DECISIONS.md` et le README :
c'est une décision à prendre avant de donner l'adresse à qui que ce soit, pas
après.
