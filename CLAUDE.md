# ONE PEAXEL FIGHTING GAME — notes de travail

Jeu de combat 2D local dans le navigateur (Vite + TypeScript + Canvas 2D,
aucune bibliothèque de jeu). Tout vit dans `apps/web`.

## Commandes

`npm install`, `npm run dev`, `npm test`, `npm run build` (inclut `tsc`),
`npm run sprites` (Python : pillow, numpy, scipy).

## Découpage

```
apps/web/src/engine      Simulation pure et déterministe : aucun accès au DOM.
apps/web/src/characters  Données des combattants (un fichier chacun, découverte auto).
apps/web/src/render      Canvas : décor, sprites, VFX, HUD, police bitmap.
apps/web/src/audio       Effets et musique synthétisés en WebAudio.
apps/web/src/input       Clavier (codes physiques) et manettes → bits de boutons.
apps/web/src/game        Scènes (menus, sélection, combat, résultats) et IA.
tools/sprites            Extraction des planches → atlas + manifestes JSON.
tools/stages             Découpe des décors.
```

**`engine` décide, tout le reste affiche.** `stepMatch(state, [bits, bits])`
avance d'une frame (60 par seconde) et renvoie des événements que la vue
transforme en effets et en sons. Positions en entiers (`PX = 256`
sous-pixels) : pas de flottant dans l'état, pour qu'un futur mode en ligne
puisse rejouer les entrées à l'identique. L'IA (`game/ai.ts`) ne fait que
renvoyer des bits de boutons, comme un clavier.

## Pièges connus

- Chaque `durations` d'un coup a exactement une entrée par frame de son
  animation ; `test/data.test.ts` le vérifie. Changer une animation dans
  `tools/sprites/chars/*.json` oblige à revoir le coup.
- `box: 'auto'` prend la portée calculée par l'extraction ; une frame sans
  portée ne touche pas. Mettre une boîte explicite dans ce cas.
- Un appui plus court qu'une frame est gardé par `gameTaps` jusqu'à
  `endInputTick()` : appeler cette fonction après chaque tick de jeu.
- La police bitmap n'a que les glyphes déclarés dans `render/font.ts` ; un
  caractère inconnu s'affiche `?`.
- Le site spritedatabase.net est bloqué depuis les sessions cloud : les
  planches sont déjà dans `assets/sheets`.

## Ressources

Planches issues d'un rip de ROM, non libres de droits, hors licence MIT. Voir
le README.
