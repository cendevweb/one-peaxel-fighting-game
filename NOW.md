# Où en est le travail

Fichier de reprise : il dit ce qui est fait, ce qui bloque, et par quoi
reprendre. À relire en premier après une interruption.

**Au 19 septembre 2026.** 13 commits poussés sur
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

## Bloqué

1. **Déploiement.** Vercel et Render demandent des comptes et des clés que
   Claude n'a pas. `render.yaml`, `vercel.json` et `docs/DEPLOIEMENT.md` sont
   prêts : Render d'abord, Vercel ensuite, parce que le client fige l'adresse
   du serveur à la compilation.

## Reprendre par

1. `docs/DEPLOIEMENT.md`, une fois les comptes Render et Vercel en place.
2. Sinon, `docs/ROADMAP.md`, section « Ensuite ».

## Ne pas oublier

- `npm install --legacy-peer-deps`, jamais `npm install` seul.
- Dépôt **public** : aucun secret, aucune clé.
- `NEXT_PUBLIC_GAME_SERVER_URL` est figée à la compilation du client.
