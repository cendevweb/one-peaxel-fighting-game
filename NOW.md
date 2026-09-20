# Où en est le travail

Fichier de reprise : il dit ce qui est fait, ce qui bloque, et par quoi
reprendre. À relire en premier après une interruption.

**Au 19 septembre 2026.** 16 commits poussés sur
`cendevweb/one-peaxel-fighting-game`, branche `main`.

## Fait

Le jeu est jouable de bout en bout, en local comme en ligne.

- `packages/combat-core` — simulation déterministe entière, 5 personnages,
  6 arènes, adversaire contrôlé par l'ordinateur à quatre niveaux. 58 tests.
- `packages/assets-pipeline` — extraction automatique des planches, atlas
  publiés dans `apps/web/public`. 5 tests de cohérence données ↔ ressources.
- `packages/shared` — protocole zod partagé.
- `apps/server` — serveur Socket.IO autoritaire, 60 Hz, instantanés,
  déconnexions, reprise de siège par jeton, revanche. 32 tests.
- `apps/web` — lobby, sélection, arène Phaser, HUD, résultats, entraînement
  local, mode arcade contre l'ordinateur. Build de production propre.
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

## Refonte des attaques et des animations (20 septembre 2026)

Branche `refonte-attaques-animations`. Les trente coups du jeu ont été repris.

- L'animation d'une attaque est calée sur sa frame d'impact et se termine avec
  le move ; avant, aucune attaque n'avait son image de contact au moment où sa
  boîte s'ouvrait.
- Les effets des planches (magma, sable, foudre, ondes de choc) sont publiés
  et attachés aux coups ; chaque personnage a ses propres étincelles, au lieu
  de celles de Luffy pour tout le monde.
- Les ultimes jouent enfin le bon geste : le Raigo d'Enel, la Dai Funka
  d'Akainu, le Desert Girasole de Crocodile, le Rokuōgan de Lucci et le pied
  géant du Gear 3.
- Les portées ont été remesurées sur les planches et les boîtes redimensionnées
  en conséquence.

Validé image par image dans un navigateur, boîtes de collision affichées, pour
les six coups de chacun des cinq personnages.

## Serveur Render injoignable (20 septembre 2026)

Branche `claude/project-thread-6i2dgq`. Le serveur n'était pas en panne :
`https://opfg-game-server.onrender.com/health` répondait `status: ok` avec neuf
heures de fonctionnement, et le handshake Socket.IO aboutissait. « Serveur
injoignable » venait donc du client. Trois causes, toutes corrigées ou rendues
visibles :

- **Le repli de transport ne se faisait pas.** Le client demandait
  `transports: ['websocket', 'polling']`, mais `tryAllTransports` vaut `false`
  par défaut dans engine.io : un seul transport était essayé et un échec du
  WebSocket abandonnait la connexion au lieu de passer au long-polling. Un
  réseau qui bloque les WebSockets rendait donc un serveur en parfaite santé
  injoignable. `tryAllTransports: true` est maintenant explicite.
- **Deux réglages muets.** Une valeur vide de `NEXT_PUBLIC_GAME_SERVER_URL`
  était traitée comme une valeur, et une adresse en `http://` depuis une page
  HTTPS est bloquée par le navigateur sans un mot. La page nomme désormais ces
  deux cas sous le bandeau, avec le geste à faire.
- **`ALLOWED_ORIGINS` intolérant.** Une entrée écrite `https://site/` — ce que
  donne une barre d'adresse — ne correspondait à rien, puisque le navigateur
  envoie l'origine sans slash final. Le slash et la casse sont maintenant
  ignorés des deux côtés, et le joker ne peut plus être détourné par un domaine
  sosie (`evil-vercel.app`).

`/health` est lisible depuis n'importe quelle origine et rapporte
`originAllowed` pour l'origine appelante : c'est ce qui permet de savoir lequel
des deux réglages manque, sans le tableau de bord. Voir `docs/DEPLOIEMENT.md`,
section « Si la page dit "Serveur injoignable" ».

100 tests, `tsc -b --force` propre, build Next de production propre.

**Reste à faire, et seul Dylan peut le faire :** redéployer pour que ces
correctifs soient en ligne, puis interroger `/health` avec l'origine du site
pour vérifier `ALLOWED_ORIGINS`.

## Coup spécial infini, animations et effets (20 septembre 2026)

Branche `claude/project-thread-z7nwrt`. La vidéo de Dylan montrait le coup L —
le **spécial**, pas le coup léger — qui enchaînait sans fin, un personnage figé
sur sa dernière image pendant toute la récupération, un adversaire peint en
blanc plein, et un second Akainu immobile là où la boule de magma aurait dû
partir. Cinq causes distinctes, toutes corrigées :

- **Le projectile était ré-émis à chaque frame.** Le hitstop fige `stateFrame` :
  la frame d'apparition du projectile était donc relue autant de fois que le gel
  durait, et chaque lecture lançait un nouveau tir, qui regelait le compteur. Un
  combattant touché ne sortait jamais. `FighterState` porte maintenant
  `projectileSpawned`, remis à zéro par `startMove` : un coup émet un projectile
  et un seul.
- **Les projectiles frappaient avec les chiffres du corps à corps.** `applyHit`
  lisait `move.hit` au lieu de `move.projectile.hit` : chaque tir infligeait les
  dégâts, le stun et le recul du jab qui le lance. Aucun projectile du jeu n'a
  jamais mis personne au sol avant ce correctif.
- **Les attaques se figeaient sur leur dernière image.** Le rendu épuisait
  l'animation pendant le startup puis tenait la pose. La queue de l'animation
  joue désormais à sa propre cadence et le combattant retombe dans sa garde dès
  qu'il n'y a plus rien à montrer. Les frames d'impact du Meigō et de la Dai
  Funka d'Akainu, qui désignaient l'avant-dernière image, ont été reculées.
- **Le flash blanc durait tout le hitstop**, soit vingt frames sur un coup
  lourd : le sprite se lisait comme absent. Il dure maintenant 70 ms, déclenché
  par l'événement de touche.
- **« Un personnage au lieu d'un SFX. »** Ce n'était pas un effet : la rangée
  Meigō d'Akainu dessine ses poses si près les unes des autres que le magma de
  l'une touche le manteau de la suivante. La découpe par colonnes vides rendait
  deux poses dans une seule frame d'atlas, et le jeu peignait donc un second
  Akainu à la place de la comète. `segment.ts` sait couper ces jointures, en
  option par personnage (`splitTouching`), parce que la correction renumérote
  les frames de la rangée : seul Akainu l'active pour l'instant.

106 tests, `tsc -b --force` propre, vérifié image par image dans un navigateur
pour les six coups des cinq personnages.

**Défauts vus et volontairement laissés** (ils ne font pas partie de ce que la
vidéo montre, et les corriger décalerait les rangées des quatre autres
planches) : `crocodile-fx-sand` inclut les chaussures de Crocodile ;
`luffy-fx-fire`, `lucci-fx-rings`, `crocodile-fx-tornado` et `enel-fx-bolt`
sont tirés de rangées de personnage même si les images choisies ressemblent à
de vrais effets ; les quatre autres planches contiennent elles aussi des frames
collées que `splitTouching` corrigerait, une fois leurs rangées relues.
