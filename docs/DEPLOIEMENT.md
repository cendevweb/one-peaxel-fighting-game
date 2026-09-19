# Déploiement

Rien n'est déployé à ce jour : les comptes Render et Vercel n'existent pas
encore côté projet. Tout ce qui pouvait l'être sans eux est prêt. Ce document
est la marche à suivre quand les comptes seront là.

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
`{"status":"ok",...}`.

**Le plan gratuit de Render endort un service inactif.** Le premier joueur à
arriver attendra la reprise, une trentaine de secondes. Pour un jeu en temps
réel, cela veut dire qu'un plan payant est nécessaire dès qu'il y a de vrais
joueurs.

## 2. Le site, sur Vercel

`vercel.json` est à la racine et décrit déjà l'installation et la
compilation du monorepo. Importer le dépôt, laisser le dossier racine sur la
racine du dépôt, et renseigner :

| Variable | Valeur |
| --- | --- |
| `NEXT_PUBLIC_GAME_SERVER_URL` | `https://<service>.onrender.com` |

**Cette variable est figée dans le bundle du navigateur à la compilation.** La
changer demande un redéploiement, pas un redémarrage.

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
