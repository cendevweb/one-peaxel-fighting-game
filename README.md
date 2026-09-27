# One Peaxel Fighting Game

Jeu de combat 2D en pixel art dans le navigateur, dans l'univers de *One Piece*,
construit comme un Street Fighter : combos, gardes haute et basse, coups
directionnels, spéciaux à manipulation, projections, jauge de garde et
ultimes avec arrêt sur image.

Vingt et un combattants (voir le tableau plus bas), six arènes, un mode arcade avec fin, un versus à deux sur le même
clavier (ou deux manettes), un versus contre l'ordinateur (5 niveaux) et un
mode entraînement (mannequin configurable, affichage des boîtes de coup,
liste des coups dans le menu pause).

## Jouer

```bash
npm install
npm run dev        # http://localhost:5173
```

| | Joueur 1 | Joueur 2 |
| --- | --- | --- |
| Se déplacer / sauter / s'accroupir | Z Q S D (W A S D en QWERTY) | Flèches |
| [A] coup léger | J | Pavé 1 ou `,` |
| [B] coup fort | K | Pavé 2 ou `.` |
| [C] spécial | L | Pavé 3 ou `/` |
| Projection ([A]+[B]) | U | Pavé 4 |
| Ultime ([B]+[C]) | I | Pavé 5 |
| Ultime max ([A]+[B]+[C]) | O | Pavé 6 |
| Pause | Échap | Retour arrière |

Les manettes (disposition standard) sont reconnues dès qu'on appuie sur un
bouton. Les touches sont lues par leur position physique : la même
disposition marche en AZERTY et en QWERTY.

### Palette de coups (commune à tous)

| Commande | Coup |
| --- | --- |
| [A], [A] [A], [A] [A] [A] | Enchaînement léger |
| [B] / → [B] / ← [B] | Coup fort, coup haut (à parer debout), lanceur |
| ↓ [A] / ↓ [B] | Coup bas / balayage (à parer accroupi) |
| Saut + [A] / [B] / [C] | Attaques aériennes |
| [C] ou ↓↘→ [C] | Spécial neutre (souvent un projectile) |
| → [C] | Spécial avant |
| ↑ [C] ou →↓↘ [C] | Spécial montant, invulnérable au début |
| ↓ [C] ou ↓↙← [C] | Spécial bas |
| [A]+[B] près | Projection (se dégage en appuyant aussi sur [A]+[B]) |
| [B]+[C] | Ultime, coûte une barre |
| [A]+[B]+[C] | Ultime max : la technique la plus forte du combattant, coûte les deux barres |
| →→ / ←← | Ruée / pas arrière |

### Combattants

Chaque coup reprend l'animation et les effets de la planche du jeu DS.

| Combattant | [C] | → [C] | ↑ [C] | ↓ [C] | Ultime | Ultime max |
| --- | --- | --- | --- | --- | --- | --- |
| Luffy | Gomu Gomu no Pistol | Gatling | Rocket Uppercut | Bazooka | Gear Third — Gigant Rifle | Gear Third — Gigant Axe |
| Zoro | Sanjūroku Pound Hō | Oni Giri | Ō Tatsumaki | Tatsumaki | Rokudō no Tsuji | Sanbyakurokujū Pound Hō |
| Sanji | Diable Jambe — Premier Hachis | Flambage Shot | Party Table Kick Course | Concassé | Poêle à Frire : Spectre | Diable Jambe — Hell Memories |
| Robin | Seis Fleurs | Cien Fleurs — arbre de bras | Cien Fleurs Wing | Gigante Fleur | Mil Fleurs — Gigantesco Mano | Cien Fleurs — Delphinium |
| Ace | Hiken | Higan | Hibashira | Enjōmō | Dai Enkai — Entei | Jūjika — Cross Fire |
| Marco | Flamme bleue | Vol du phénix | Envol du phénix | Charge des ailes | Phénix — flammes régénératrices | Hōō-in — piqué du phénix géant |
| Barbe Blanche | Gura Gura — onde de choc | Gura Gura — poing séisme | Moulinet du bisento | Gura Gura — saisie de l'air | Kaishin | Shima Yurashi |
| Law | Radio Knife | Injection Shot | Takt | Shambles — Counter Shock | Room — Amputate | K-Room — Puncture Wille |
| Kid | Repel | Attraction | Uppercut de ferraille | Pilier de ferraille | Punk Gibson | Punk Corna Dio |
| Hancock | Pistol Kiss | Mero Mero Mellow | Salto de la Gorgone | Slave Arrow | Perfume Femur | Grand Mero Mero Mellow |
| Crocodile | Desert Spada | Barchan | Desert Grande Espada | Desert Girasole | Tempête du désert | Sables Pesado |
| Doflamingo | Tamaito | Overheat | Fulbright | Parasite | Torikago — Birdcage | Kakusei — Awakening |
| Kuma | Tsuppari Pad Hō | Téléportation — Pad Hō | Pad Hō ascendant | Onde du tyran | Ursus Shock | Laser du Pacifista |
| Magellan | Hydra | Doku Fugu | Hydra ascendante | Doku Gumo | Venom Demon — Jigoku no Shinpan | Doku Hydra — la Hydre géante |
| Enel | Sango | Trident de Nonosama | Vari — 1 000 000 V | El Thor | Mamaragan | Amaru — Raijin |
| Rob Lucci | Rankyaku « Hyōbi » | Soru — Shigan | Shigan « Ōren » | Griffes du léopard | Rokuōgan | Rokuōgan — pleine puissance |
| Shanks | Onde tranchante du Haki | Gryphon — ruée | Estoc céleste | Haoshoku Haki | Kamusari | Haoshoku no Kenbu |
| Barbe Noire | Kurouzu | Gura Gura — poing du séisme | Uppercut des ténèbres | Black Hole | Liberation | Kaishin des ténèbres |
| Aokiji | Ice Block — Partisan | Ice Time | Ice Block — Poing du givre | Ice Age | Ice Block — Pheasant Beak | Ice Time Capsule |
| Kizaru | Laser du doigt | Ama no Murakumo | Ama no Murakumo — ascension | Yata no Kagami | Yasakani no Magatama | Yata no Kagami — Kōsen |
| Akainu | Dai Funka | Meigo | Colonne éruptive | Éruption | Ryusei Kazan | Inugami Guren |

Sanji n'a pas de projectile : son [C] est une rafale de coups de pied à bout
portant. Le mode arcade enchaîne huit
combats, du plus abordable au plus coriace : six adversaires tirés au sort,
un par tranche du classement, puis Barbe Blanche et Akainu au bout (Barbe
Noire remplace celui des deux que l'on joue). L'ordinateur y monte en
difficulté à chaque combat.

Garder = reculer (accroupi pour les coups bas). Trop garder brise la garde.
Les dégâts diminuent au fil d'un combo, et un coup qui touche
l'adversaire en pleine attaque fait 20 % de dégâts en plus et l'étourdit plus
longtemps (« CONTRE ! »).

## Jouer en ligne

Dans **VERSUS J1 CONTRE J2**, choisir **EN LIGNE — CRÉER UN SALON** : le jeu
affiche un lien d'invitation (copié dans le presse-papiers) et un code de
6 lettres. L'adversaire ouvre le lien, ou choisit **EN LIGNE — REJOINDRE** et
tape le code. Chacun choisit son combattant, l'hôte choisit l'arène, puis
combat, revanche ou retour au menu.

Les deux navigateurs se parlent directement (WebRTC). La mise en relation passe
par le service public PeerJS, sans serveur à héberger. Le netcode est à
rollback (délai d'entrée de 2 frames, retour arrière jusqu'à 8 frames), comme
les jeux de combat actuels. Sur les réseaux très fermés (certains réseaux
d'entreprise ou partages 4G), la connexion directe peut échouer : il faut alors
un relais TURN, à déclarer dans `VITE_ICE_SERVERS`.

Variables Vercel facultatives, pour un serveur de mise en relation à soi
(`npx peerjs --port $PORT --path /salon --proxied true`) : `VITE_PEER_HOST`,
`VITE_PEER_PORT`, `VITE_PEER_PATH`, `VITE_PEER_SECURE`, `VITE_ICE_SERVERS`
(JSON). En local : `npm run peer:local -w apps/web`, puis `?peer=127.0.0.1:9000`
dans l'URL ; `npm run e2e:online -w apps/web` joue un match complet entre deux
navigateurs avec latence et pertes simulées.

## Développement

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur Vite |
| `npm run build` | Vérification des types et build de production dans `apps/web/dist` |
| `npm test` | Tests vitest : moteur, données et combos de chaque personnage, 30 matchs ordinateur contre ordinateur (chaque combattant, des deux côtés) |
| `npm run sprites` | Ré-extrait les sprites des planches (`python3`, `pillow`, `numpy`, `scipy`) |

Déploiement Vercel : *Root Directory* `apps/web`, le reste est dans
`apps/web/vercel.json` (Vite, sortie `dist`). Aucun serveur n'est nécessaire.

Voir `CLAUDE.md` pour l'architecture et `docs/ADDING_A_CHARACTER.md` pour
ajouter un combattant.

## Ressources graphiques

Les planches de sprites et les décors (`assets/`, et les fichiers qui en sont
extraits dans `apps/web/public/`) proviennent du jeu *One Piece: Gigant
Battle! 2 — New World* (Nintendo DS), via un rip publié sur
spritedatabase.net. Ils appartiennent à leurs ayants droit (Eiichiro Oda,
Shūeisha, Toei Animation, Bandai Namco), ne sont **pas** couverts par la
licence MIT de ce dépôt et ne servent qu'au prototype. Le code, lui, est sous
licence MIT.
