# Ajouter un combattant

Un combattant, c'est deux fichiers écrits à la main :

1. `tools/sprites/chars/<id>.json` — quelles images de la planche forment
   quelle animation ;
2. `apps/web/src/characters/<id>.ts` — ses coups : durées, boîtes, dégâts.

Tout le reste est dérivé. `characters/index.ts` ramasse tout seul chaque
fichier de `characters/` ; les tests de `src/test/data.test.ts` vérifient que
les deux fichiers concordent.

Luffy (`chars/luffy.json`, `characters/luffy.ts`) est l'exemple de référence.

## 1. Lire la planche

```sh
python3 tools/sprites/inspect_sheet.py <id> /tmp/out      # toutes les rangées, numérotées Bn
python3 tools/sprites/band_zoom.py <id> /tmp/z.png 3 4 5  # zoom sur des rangées
```

Chaque image détectée porte un numéro `rangée:image` (`B12` image `3` →
`"12:3"`). Regarder les images produites : c'est la seule façon de savoir
qu'une rangée est un coup de pied et pas une garde.

Pièges fréquents :

- **Portraits, bannières, textes japonais** collés à une rangée la fusionnent
  avec sa voisine. Les masquer par `"ignore": [[x0, y0, x1, y1], …]`, puis
  relancer `inspect_sheet` : les numéros de rangée changent.
- **Un membre séparé du corps** (une main étirée) apparaît comme une image à
  part. Fusionner : `"12:3+4"`.
- **Rangées qui se chevauchent** : `"@x0,y0,x1,y1"` prend un rectangle brut de
  la planche.
- **Sens** : toutes les animations doivent regarder **à droite**. Une rangée
  dessinée vers la gauche prend `"flip": true`.
- **Ancrage** : le point d'appui est le centre des pieds. Quand un membre géant
  touche le sol devant, `"anchorBack": [indices]` ne cherche les pieds que
  derrière.

## 2. Le fichier `chars/<id>.json`

```json
{
  "sheet": "<id>.png",
  "ignore": [[x0, y0, x1, y1]],
  "images": {
    "portrait": {"rect": [x0, y0, x1, y1]},
    "face": {"rect": [x0, y0, x1, y1]},
    "art": {"rect": [x0, y0, x1, y1], "key": true},
    "cutin": {"rect": [x0, y0, x1, y1]}
  },
  "anims": {
    "idle": {"frames": ["0:0", "0:1"], "fps": 6, "loop": true},
    "fx_bolt": {"frames": ["20:0", "20:1"], "fx": true}
  }
}
```

`portrait` (sélection), `face` (petite tête de la barre de vie), `art`
(grande illustration de l'écran versus), `cutin` (bandeau de l'ultime) sont
cherchés sur la planche ; si l'un manque, en prendre un proche (un gros plan
d'une image de combat, par exemple).

### Animations obligatoires (le moteur les joue par leur nom)

| Nom | Contenu | Contraintes |
| --- | --- | --- |
| `idle` | garde au repos | `loop`, `fps` ~6 |
| `walk` | marche | `loop`, `fps` ~10–12 |
| `dash` | course | `loop` |
| `backdash` | petit saut arrière | |
| `crouch` | accroupi | 1 image |
| `jump` | saut | **exactement 4 images** : appel, montée, descente, réception |
| `guard` / `guardLow` | garde debout / accroupie | 1 image chacune |
| `hit` / `hitHeavy` | touché léger / lourd | 1–2 images |
| `launched` | projeté en l'air | **exactement 3 images** : montée, sommet, chute |
| `down` | au sol | |
| `getup` | relevé | |
| `dizzy` | étourdi | `loop` |
| `win` | pose de victoire | |

### Animations des coups (une par emplacement, noms libres)

Par convention les noms reprennent l'emplacement : `lightA`, `lightB`,
`lightC`, `crouchLight`, `crouchHeavy`, `heavy`, `heavyFwd`, `heavyBack`,
`airLight`, `airHeavy`, `airSpecial`, `specialN`, `specialF`, `specialU`,
`specialD`, `ultimate`, `throw`. Les effets (projectiles, explosions) sont
préfixés `fx_` et portent `"fx": true`.

Puis :

```sh
python3 tools/sprites/build_atlas.py <id> --contact /tmp/contact
```

et **regarder** `/tmp/contact/<id>_anims_*.png` : chaque animation, image par
image, posée sur la même ligne de sol avec une croix rouge au point d'appui.
Un personnage qui glisse, regarde à gauche, ou une image qui n'a rien à faire
là se voient ici.

## 3. Le fichier `characters/<id>.ts`

Copier `luffy.ts` et l'adapter. Les règles :

- `durations` : **une durée (en ticks, 60 par seconde) par image** de
  l'animation. C'est ce qui fixe la vitesse du coup et donc son équilibre.
- Démarrage (ticks avant la première image active) : léger 3–5, lourd 7–12,
  spécial 8–16, ultime après le gel. Récupération (après la dernière image
  active) : léger 6–10, lourd 14–22, spécial 16–30.
- `hits[].frames` : images de l'animation où le coup touche.
  `box: 'auto'` prend ce que le sprite dessine devant le corps (un bras étiré
  touche aussi loin qu'il est dessiné) ; sinon `[x, y, w, h]` en pixels, x
  vers l'avant depuis les pieds, y vers le haut.
- `guard` : `'mid'` (se pare debout ou accroupi), `'low'` (accroupi
  seulement : balayages, coups bas), `'high'` (debout seulement : coups
  sautés et coups plongeants), `'unblockable'`.
- `hitstun` > `blockstun` ; l'écart fait l'avantage du coup.
- `launch: [vx, vy]` envoie en l'air (jonglage) ; `knockdown` fait tomber ;
  `wallBounce` rebondit sur le mur.
- `rehit: n` retouche toutes les n ticks tant que l'image est active (rafales).
- `chain` : coups normaux enchaînables (`lightA → lightB → lightC`).
  `cancelable` : annulable en spécial ou en ultime quand le coup a touché.
- `motion: [[image, vx, vy]]` : vitesse imposée en entrant dans une image
  (ruée, saut de l'uppercut). `invuln: [a, b]` : invulnérable sur ces images
  (les « shoryuken » en ont besoin).
- `projectile` : l'animation `fx_…` à lancer, à quelle image, vitesse, durée,
  boîte, et les propriétés du coup.
- `ultimate` : `cost: 100`, `superFreeze: ~55`, `invuln` sur le démarrage.
- `throw` : `hits[0]` est la saisie (courte portée), `throwRelease` dit à
  quelle image la victime est lâchée, avec dégâts et projection.
- `fx: [[image, 'fx_nom', x, y]]` joue un effet visuel du personnage.
- `sfx` : `swing`, `swingHeavy`, `stretch`, `gatling`, `bazooka`, `fire`,
  `electric`, `sand`, `magma`, `slash`, `grab`, `gigant`, `beam`.
- `spark` : `light`, `heavy`, `big`, `fire`, `electric`, `sand`, `magma`,
  `cut`.

Santé autour de 1000 ; un combo moyen fait 200–300, l'ultime 300–400.

## 4. Vérifier

```sh
cd apps/web && npx vitest run && npx tsc --noEmit
```
