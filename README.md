# One Peaxel Fighting Game

Jeu de combat 2D en pixel art dans le navigateur, dans l'univers de *One Piece*,
construit comme un Street Fighter : combos, gardes haute et basse, coups
directionnels, spéciaux à manipulation, projections, jauge de garde et
ultimes avec arrêt sur image.

Cinq combattants : **Luffy**, **Enel**, **Rob Lucci**, **Crocodile** et
**Akainu**, six arènes, un mode arcade avec fin, un versus à deux sur le même
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
| →→ / ←← | Ruée / pas arrière |

Garder = reculer (accroupi pour les coups bas). Trop garder brise la garde.
Les dégâts diminuent au fil d'un combo, et un coup qui touche
l'adversaire en pleine attaque fait 20 % de dégâts en plus et l'étourdit plus
longtemps (« CONTRE ! »).

## Développement

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur Vite |
| `npm run build` | Vérification des types et build de production dans `apps/web/dist` |
| `npm test` | Tests vitest : moteur, données des personnages, 25 matchs ordinateur contre ordinateur |
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
