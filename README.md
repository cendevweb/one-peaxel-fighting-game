# ONE PEAXEL FIGHTING GAME

Jeu de combat 2D en ligne, jouable dans le navigateur, inspiré du système de
combat et de l'identité visuelle de *One Piece: Gigant Battle! 2 — New World*
(Nintendo DS).

Deux joueurs sur deux machines différentes s'affrontent en temps réel : la
simulation fait autorité côté serveur, les deux clients la prédisent localement
et la rejouent lorsqu'ils divergent.

## État du projet

Voir [`docs/PROGRESS.md`](docs/PROGRESS.md) pour ce qui est réellement terminé,
testé, ou encore ouvert. Ce fichier est tenu à jour avec le code, pas avec les
intentions.

## Démarrage

```bash
npm install --legacy-peer-deps
npm run build:packages     # compile combat-core et shared
npm run assets             # extrait les sprites et publie les atlas
npm run dev                # serveur de jeu + application web
```

L'application écoute sur <http://localhost:3000>, le serveur de combat sur
`ws://localhost:8080`.

| Commande | Effet |
|---|---|
| `npm run dev` | client Next.js et serveur temps réel, ensemble |
| `npm run build` | build de production des deux applications |
| `npm test` | tests du moteur de combat et du serveur |
| `npm run typecheck` | TypeScript strict sur tout le dépôt |
| `npm run assets` | pipeline d'extraction des spritesheets |

## Architecture

```
packages/combat-core     simulation pure TypeScript, sans Phaser ni DOM
packages/shared          protocole réseau et schémas de validation
packages/assets-pipeline analyse et découpe des spritesheets
apps/server              serveur autoritaire Node + Socket.IO  (Render)
apps/web                 Next.js + React + Tailwind + Phaser   (Vercel)
```

Le détail est dans [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Documentation

| Fichier | Contenu |
| --- | --- |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Le découpage en paquets et ce qui n'a pas été fait, avec les raisons. |
| [`docs/COMBAT_SYSTEM.md`](docs/COMBAT_SYSTEM.md) | Frames, boîtes, combos, garde, jauge, déroulement d'un match. |
| [`docs/NETWORKING.md`](docs/NETWORKING.md) | Autorité du serveur, prédiction, correction, reprise de siège. |
| [`docs/ASSET_PIPELINE.md`](docs/ASSET_PIPELINE.md) | Comment les planches deviennent des atlas, et les droits. |
| [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md) | Ce que le jeu cherche à faire ressentir. |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Les arbitrages techniques et pourquoi. |
| [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md) | Render puis Vercel, dans cet ordre. |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Ce qui marche, comment ça a été vérifié, ce qui manque. |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | La suite. |
| [`CLAUDE.md`](CLAUDE.md) | Les pièges de compilation, à lire avant de toucher au code. |
| [`NOW.md`](NOW.md) | Où en est le travail en cours.

## Ressources graphiques — à lire avant toute diffusion

Les planches de sprites et les décors proviennent d'un **rip de la ROM de
*One Piece: Gigant Battle! 2 — New World*** (Bandai Namco / Ganbarion). Ce ne
sont pas des ressources libres de droits :

- elles ne sont couvertes par aucune licence de redistribution ;
- ce dépôt les conserve à des fins de prototypage et d'étude ;
- une publication commerciale ou une diffusion large exigerait de les remplacer
  par des ressources originales ou explicitement autorisées.

Le code du dépôt est sous licence MIT ; **cette licence ne couvre pas les
fichiers de `assets/`**.

## Licence

MIT pour le code. Voir la section ci-dessus pour les ressources graphiques.
