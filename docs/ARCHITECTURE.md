# Architecture

## Le principe

Une seule simulation, écrite une fois, exécutée des deux côtés du réseau.

```
                 packages/combat-core
                 stepMatch(état, [masqueA, masqueB]) -> état'
                          │
          ┌───────────────┴───────────────┐
          │                               │
   apps/server (Render)            apps/web (Vercel)
   fait autorité                   prédit et corrige
   60 Hz, pas fixe                 même pas fixe, quelques frames d'avance
          │                               │
          └──────── Socket.IO ────────────┘
             masques d'entrée ↑   instantanés ↓
```

`combat-core` ne connaît ni Phaser, ni React, ni le DOM, ni Socket.IO. Il
prend un état et deux masques de boutons, il rend un nouvel état et une liste
d'événements. C'est tout. Cette contrainte n'est pas esthétique : c'est elle
qui permet de tester le combat sans navigateur, de le rejouer sur le serveur
et de le re-simuler après une correction réseau.

## Les paquets

### `packages/combat-core`

| Fichier | Rôle |
| --- | --- |
| `fixed.ts` | Virgule fixe entière, 1/64 px. Aucun flottant n'entre dans l'état. |
| `input.ts` | Un masque de 8 bits par frame. La seule chose qu'un client envoie. |
| `types.ts` | `MatchState`, `FighterState`, `CharacterDefinition`, `MoveDefinition`. |
| `collision.ts` | Boîtes AABB, écrites face à droite et miroitées à l'exécution. |
| `engine.ts` | `stepMatch`, la fonction qui fait avancer le match d'une frame. |
| `serialize.ts` | Encodage compact de l'état en `number[]`, et son checksum FNV-1a. |
| `characters/` | Les cinq combattants, en données pures. |
| `stages.ts` | Les six arènes, en données pures. |
| `testing.ts` | Le banc d'essai des tests : avancer, placer, remplir la jauge. |

### `packages/shared`

Le protocole, et rien d'autre : les schémas zod que le serveur applique à tout
ce qui arrive, et les deux tables d'événements typées
(`ClientToServerEvents`, `ServerToClientEvents`). Le serveur vérifie à la
compilation que ce qu'il émet correspond à cette table, pour que les deux
bouts ne puissent pas diverger en silence.

### `packages/assets-pipeline`

Hors ligne, jamais chargé par le jeu. Il lit les planches brutes, en déduit les
frames, et publie des atlas dans `apps/web/public/atlases`. Voir
`ASSET_PIPELINE.md`.

### `apps/server`

`Room` tient un match : le salon, la sélection, la boucle à pas fixe, les
instantanés, les déconnexions. `RoomRegistry` tient les salons.
`index.ts` branche Socket.IO, le CORS, la limitation de débit et `/health`.

L'horloge est **injectée** dans `Room` et dans `RoomRegistry`. Les tests
poussent le temps à la main ; sans cela, tester un décompte de trois secondes
voudrait dire attendre trois secondes.

### `apps/web`

| Dossier | Rôle |
| --- | --- |
| `src/app` | Les routes : `/` en ligne, `/entrainement` en local. |
| `src/components` | Lobby, sélection, HUD, résultats, aperçu de sprite. |
| `src/game` | Le pont React ↔ Phaser, la scène de combat, le manifeste. |
| `src/net` | La couche réseau : socket, prédiction, correction. |
| `src/input` | Le clavier vers un masque de bits. |

Phaser et React ne se parlent pas directement. Ils partagent un objet, le
`FightBridge` : le pilote y écrit l'état à chaque frame, la scène le lit, le
HUD en prend une copie vingt fois par seconde. Sans ce pont, chaque coup porté
déclencherait un rendu React au milieu de la boucle de dessin.

## Ce qui n'a pas été fait, et pourquoi

- **Pas de moteur physique.** Phaser Arcade ou Matter apporterait de la
  non-reproductibilité et des flottants. Les boîtes sont calculées à la main,
  en entiers.
- **Pas de rendu côté serveur du combat.** Le serveur n'a pas de canvas ; il
  n'en a pas besoin, puisque la simulation est indépendante de l'affichage.
- **Pas de base de données.** Rien ne survit à un match. Un classement
  demanderait un stockage, donc un compte, donc des secrets : hors sujet pour
  une V1 dont le dépôt est public.
