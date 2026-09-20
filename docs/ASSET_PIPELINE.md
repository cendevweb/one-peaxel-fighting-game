# Le pipeline de ressources

## Le problème

Les planches de sprites d'un jeu DS ne sont pas des grilles. Les personnages
n'ont pas tous la même taille, les frames ne sont pas alignées, les rangées
sont séparées par un nombre de pixels variable, et certaines planches
contiennent des choses qui ne sont pas des sprites du tout : un logo, des
portraits de cinématique, une étiquette « Dash: ».

Découper à la main, c'est des centaines de rectangles à mesurer, et c'est ce
qui avait été tenté dans le projet précédent : les animations qui en
sortaient n'étaient pas propres. Le pipeline fait ce travail tout seul, et
donne de quoi vérifier son résultat à l'œil.

## Les étapes

### 1. Détecter le fond

La couleur du fond est la couleur **modale des bords** de l'image. Elle est
ensuite rendue transparente avec une rampe de dégradé, pour que les contours
anticrénelés ne laissent pas un liseré.

### 2. Découper en bandes

Le profil horizontal des pixels opaques donne les rangées. Deux rangées
séparées par au moins `rowGap` lignes vides sont deux bandes différentes.
Crocodile a fallu descendre à `rowGap: 1` : ses rangées ne sont séparées que
d'un pixel.

### 3. Découper en frames

Dans chaque bande, le profil vertical donne les colonnes. Les écarts trop
courts sont fusionnés, pour qu'un bras tendu séparé du corps ne compte pas
comme deux frames.

Le cas inverse existe aussi : deux poses dessinées si près l'une de l'autre
que leurs encres se touchent ne laissent aucune colonne vide entre elles, et
sortent comme une seule frame. Le jeu peint alors deux combattants d'un coup —
c'est ce qui faisait apparaître un second Akainu immobile à la place de sa
boule de magma. `splitTouching` coupe ces jointures : une frame beaucoup plus
large que les autres de sa bande est tranchée au milieu d'une courte traînée de
colonnes presque vides, à condition que les deux moitiés restent aussi larges
que le reste de la bande. L'option est **désactivée par défaut** et se demande
par personnage (`segment: { splitTouching: true }`), parce qu'elle renumérote
les frames des bandes qu'elle corrige : une planche l'active une fois ses
`band` relues. Seul Akainu l'utilise aujourd'hui.

### 4. Ignorer ce qui n'est pas un sprite

Une planche peut déclarer des rectangles `ignore`. Ceux de Crocodile écartent
le logo de Baroque Works et une rangée de portraits de cinématique, qui
autrement reliaient cinq rangées de sprites en une seule bande.

### 5. Trouver le point d'ancrage

C'est le point délicat. Le centre de la frame n'est pas le centre du
personnage : un coup de poing tendu décale toute la silhouette, et un
personnage ancré sur le centre de sa boîte se met à glisser d'une frame à
l'autre.

L'ancre est donc le **centre de masse des 18 % inférieurs** de la frame,
c'est-à-dire des pieds. Les pieds restent plantés, le reste du corps bouge
autour.

### 6. Publier

Les frames d'un personnage partagent une seule boîte logique, pour qu'aucune
animation ne saute. Les effets (`fx-`) en reçoivent une à eux : sans cela, un
éclair d'Enel imposait une boîte de 1240 px de large à tout le personnage.

Seules les frames réellement référencées par une animation sont publiées.
L'atlas complet faisait 1,9 Mo ; celui-ci fait environ 300 Ko.

Les arènes viennent d'un jeu au format portrait (941 × 1672). Elles sont
recadrées sur une bande paysage et publiées en webp 1440 × 921.

## Ce qui reste écrit à la main

Un seul fichier : `characters.config.ts`. Il dit, pour chaque personnage,
quelle bande et quelles frames forment quelle animation :

```ts
{ animation: 'gigant', band: 41, range: [0, 4], frameRate: 10 },
{ animation: 'pistol', band: 8, range: [0, 6], frameRate: 15, flip: true },
{ animation: 'meigo', band: 8, order: [8, 7, 6, 5, 4, 3, 2, 1, 0], frameRate: 13 },
```

C'est irréductible : aucune analyse d'image ne peut deviner que la bande 41
est un Gear 3 plutôt qu'une garde. Le reste — où sont les bandes, où sont les
frames, où est le sol — est déduit.

Quatre propriétés servent à rattraper ce que le rip fait de travers :

- `range` limite la bande aux frames qui appartiennent vraiment au coup ;
- `order` donne un ordre de lecture explicite, pour les rangées dessinées de
  droite à gauche — le Meigō d'Akainu et le Rokuōgan de Lucci y montrent
  sinon une boule d'énergie qui rétrécit ;
- `flip` retourne l'animation, pour les rangées dessinées dans l'autre sens :
  le Pistolet de Luffy part vers la gauche alors que sa Gatling va vers la
  droite, sur la même planche.
- `segment` surcharge le découpage pour une planche entière, et c'est là que
  `splitTouching` se demande.

Une rangée peut aussi être inutilisable pour une raison qui ne se voit qu'en
jeu : les bandes 40 et 43 de Luffy sont dessinées au-dessus de la ligne de sol
de leur rangée, ce qui le fait flotter, et finissent sur du flou de mouvement
pleine hauteur, qui devient une barre en travers de l'écran dès qu'il est
tenu. C'est pour cela que le Gear 3 joue la bande 41.

## Vérifier

```
npm run assets -- analyse            # ce que le découpage a trouvé
npm run assets -- contact luffy      # une planche-contact par bande
npm run contact-anim --workspace @opfg/assets-pipeline luffy   # par animation
npm run assets -- extract            # publie les atlas
```

Les planches-contact sont la première façon honnête de valider ce travail :
il faut les regarder. `contact-anim` rend une planche par **animation
configurée** plutôt que par bande, ce qui est ce qu'on veut relire après avoir
touché `characters.config.ts`. Mais une planche-contact ne dit rien de
l'ancrage ni du rythme : ça, il faut le voir en jeu. La salle
d'entraînement (`/entrainement`) sert à ça, boîtes de collision comprises avec
Maj + B. Elles ont servi à trouver que le `gear3` de Luffy incluait
des frames de poing géant tronquées, que la `walk` d'Enel embarquait une
étiquette de texte, et que la garde de Crocodile pointait sur une rangée de
marche.

Deux tests (`assets.test.ts`) relient ensuite les données de jeu aux
ressources publiées : chaque animation citée par un personnage ou par un coup
doit exister dans le manifeste, chaque arène doit avoir son image, et aucun
personnage ne doit sortir de l'extraction avec un avertissement. Une planche
recadrée qui casserait une animation fait échouer la suite de tests.

## Les droits

Les planches viennent d'un rip de ROM de *One Piece: Gigant Battle! 2 — New
World* (Bandai Namco / Ganbarion). **Elles ne sont pas libres de droits.** Ni
`spritedatabase.net` ni ce dépôt ne peuvent en accorder l'usage. Elles sont
gardées pour le prototype et l'étude ; `assets/` et
`apps/web/public/atlases/` ne sont pas couverts par la licence du dépôt, et
une diffusion publique du jeu demande soit une autorisation, soit des
ressources originales.

Le pipeline est écrit pour que ce remplacement soit possible : changer de
planches veut dire changer `characters.config.ts` et relancer `npm run
assets`. Aucune coordonnée de sprite n'est codée en dur dans le jeu.
