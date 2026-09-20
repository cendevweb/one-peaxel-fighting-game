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
