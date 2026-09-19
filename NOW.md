# Où en est le travail

Fichier de reprise : il dit ce qui est fait, ce qui bloque, et par quoi
reprendre. À relire en premier après une interruption.

**Au 19 septembre 2026.** 16 commits poussés sur
`cendevweb/one-peaxel-fighting-game`, branche `main`.

## Fait

Le jeu est jouable de bout en bout, en local comme en ligne.

- `packages/combat-core` — simulation déterministe entière, 5 personnages,
  6 arènes. 36 tests.
- `packages/assets-pipeline` — extraction automatique des planches, atlas
  publiés dans `apps/web/public`. 5 tests de cohérence données ↔ ressources.
- `packages/shared` — protocole zod partagé.
- `apps/server` — serveur Socket.IO autoritaire, 60 Hz, instantanés,
  déconnexions, reprise de siège par jeton, revanche. 32 tests.
- `apps/web` — lobby, sélection, arène Phaser, HUD, résultats, entraînement
  local. Build de production propre.
- Documentation : `CLAUDE.md`, `docs/`.

Vérifié dans un vrai navigateur : deux contextes indépendants ont créé et
rejoint un salon, choisi leurs personnages, combattu avec des chronos et des
barres de vie concordants, sans erreur console ; un match d'entraînement est
allé jusqu'au KO, au résultat et à la revanche ; un joueur a rechargé sa page
en plein combat et a retrouvé son siège et son round.

## En cours

**Déploiement.** Les deux comptes sont connectés. Le blueprint Render est
déployé. Le premier build Vercel a échoué parce que la commande de compilation
appelait `npm run build:packages`, un script qui n'existe qu'à la racine du
dépôt, alors que Vercel compile depuis `apps/web`. Corrigé : `apps/web` a
maintenant un script `prebuild` qui compile lui-même les deux paquets partagés,
et `vercel.json` ne fixe plus de commande de compilation.

Restent deux valeurs que seul Dylan peut fournir :

- `NEXT_PUBLIC_GAME_SERVER_URL` sur Vercel, l'URL du service Render.
- `ALLOWED_ORIGINS` sur Render, le domaine Vercel.

## Reprendre par

1. `docs/DEPLOIEMENT.md`, sections 2 et 3.
2. Sinon, `docs/ROADMAP.md`, section « Ensuite ».

## Ne pas oublier

- `npm install --legacy-peer-deps`, jamais `npm install` seul.
- Dépôt **public** : aucun secret, aucune clé.
- `NEXT_PUBLIC_GAME_SERVER_URL` est figée à la compilation du client.
