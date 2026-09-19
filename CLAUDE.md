# ONE PEAXEL FIGHTING GAME — notes de travail

Jeu de combat 2D en ligne dans le navigateur, inspiré de *One Piece: Gigant
Battle! 2 — New World* (Nintendo DS). Monorepo npm workspaces, TypeScript
strict partout.

## Commandes

| Commande | Effet |
| --- | --- |
| `npm install --legacy-peer-deps` | **Obligatoire.** Sans ce drapeau, npm plante sur l'arbre de pairs de vitest (`Cannot read properties of null (reading 'edgesOut')`). |
| `npm run build:packages` | Compile `@opfg/shared` puis `@opfg/combat-core`. Tout le reste en dépend. |
| `npm run dev` | Serveur de jeu (4001 ou `PORT`) et Next.js (3000) en parallèle. |
| `npm test` | 68 tests vitest : moteur, ressources, salons. |
| `npm run typecheck` | `tsc -b --force` sur tout le dépôt. |
| `npm run assets` | Ré-extrait les sprites des planches et republie les atlas. |

Le client lit l'adresse du serveur dans `NEXT_PUBLIC_GAME_SERVER_URL`, qui est
figée **à la compilation** : changer de serveur veut dire recompiler.

## Découpage

```
packages/combat-core    Simulation pure. Aucun import de Phaser, React ou DOM.
packages/shared         Protocole réseau et schémas zod, partagés par les deux bouts.
packages/assets-pipeline Extraction des sprites hors ligne (Node + sharp).
apps/server             Serveur Socket.IO autoritaire (Render).
apps/web                Next.js, React, Tailwind, Phaser (Vercel).
```

La règle qui tient l'ensemble : **`combat-core` décide, tout le reste
affiche.** Le serveur et le client exécutent le même `stepMatch`, avec les
mêmes entiers, et doivent obtenir le même résultat au checksum près. Un calcul
de dégâts dans une scène Phaser ou dans un composant React est un bug, pas un
raccourci.

## Pièges connus

- **Pas de `const enum` exporté.** `apps/web` compile en modules isolés et ne
  peut pas inliner un const enum venant d'un paquet. `Button` est un `enum`
  ordinaire pour cette raison.
- **Phaser 4 n'est pas Phaser 3.** `setTintFill(couleur)` ne fait plus rien ;
  c'est `setTint(couleur).setTintMode(Phaser.TintModes.FILL)`.
- **Pas d'extension `.js` dans les imports de `apps/web`**, contrairement aux
  paquets qui sont en ESM Node.
- **Les flottants sont interdits dans la simulation.** Les positions et les
  vitesses sont en virgule fixe (`FP_BITS = 6`, donc 1/64 de pixel). Un
  `Math.round` oublié suffit à désynchroniser deux machines.
- **L'extraction écrit `manifest.json` en dernier.** Ne pas rediriger sa
  sortie vers `head` : le SIGPIPE tue le processus avant l'écriture.

## Ressources graphiques

Les planches viennent d'un rip de ROM. Elles ne sont pas libres de droits, ne
sont gardées que pour le prototype, et `assets/` n'est pas couvert par la
licence du dépôt. Voir le README, section « Ressources graphiques ».

## Documentation

`docs/ARCHITECTURE.md`, `GAME_DESIGN.md`, `COMBAT_SYSTEM.md`,
`NETWORKING.md`, `ASSET_PIPELINE.md`, `ROADMAP.md`, `DECISIONS.md`,
`PROGRESS.md`. `NOW.md`, à la racine, dit où en est le travail en cours.
