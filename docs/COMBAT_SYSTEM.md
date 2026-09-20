# Le système de combat

## La boucle

`stepMatch(état, [masqueP1, masqueP2], roster)` fait avancer le match d'une
frame, à 60 Hz. Elle est pure : mêmes entrées, même sortie, sur n'importe
quelle machine. Elle ne lit pas l'horloge, ne tire pas de nombre aléatoire
hors de la graine du match, n'écrit nulle part.

Dans l'ordre, chaque frame :

1. décrémente les compteurs (hitstop, étourdissement, invulnérabilité) ;
2. lit les boutons de chaque combattant et décide de son action ;
3. applique le mouvement et la gravité ;
4. teste les boîtes de coup contre les boîtes de touche ;
5. résout les poussées pour que personne ne traverse personne ;
6. met à jour le chrono, les rounds et la fin de match.

## La virgule fixe

Positions, vitesses et gravité sont des entiers, en 1/64 de pixel
(`FP_BITS = 6`). Un `0.1 + 0.2` qui ne tombe pas juste sur une machine et
juste sur une autre suffirait à faire diverger deux simulations censées être
identiques ; en entiers, la question ne se pose pas. Un test vérifie qu'aucune
coordonnée de l'état n'est fractionnaire après mille frames.

## Les données d'un coup

Un coup est une ligne de données, pas du code :

```ts
move({
    id: 'luffy-jab',
    slot: 'light',
    animation: 'luffy-jab',
    duration: 20,          // frames au total
    startup: 4,            // avant la première frame active
    active: [[4, 6]],      // fenêtres où la boîte de coup existe
    hitbox: { x: 18, y: 62, width: 66, height: 42 },
    hit: hit({ damage: 45, hitstun: 17, blockstun: 11, knockbackX: 2.4, hitstop: 6 }),
    cancelInto: ['luffy-pistol', 'luffy-gatling', 'luffy-gear3'],
    cancelWindow: [5, 17]
})
```

`move()` refuse à la compilation une définition incohérente : un `startup` qui
ne correspond pas à la première frame active, une fenêtre active qui déborde
de la durée. Une faute de frappe dans les données ne devient pas un bug de
gameplay six semaines plus tard.

Trois champs de plus ne servent qu'à l'affichage et n'entrent jamais dans la
simulation ni dans le checksum :

```ts
impactFrame: 4,            // l'image de la planche où le coup porte
effects: [                 // ce que le coup met à l'écran, et quand
    { animation: 'akainu-fx-magma', frame: 18, offsetX: 176, offsetY: 70, scale: 1.8 }
],
impactEffect: { animation: 'akainu-fx-spikes', scale: 2 }
```

`impactFrame` est ce qui relie le dessin au frame data : le rendu met cette
image à l'écran exactement à la première frame active, puis étale ce qui reste
de l'animation sur la récupération. Sans lui, une animation de neuf images
étalée sur un move de cinquante frames montre n'importe quelle image au moment
du contact.

`effects` sont les rangées voisines de la planche — le magma, le sable, la
foudre — posées à une frame et à un décalage donnés. `offsetX` est compté vers
l'avant du combattant, `offsetY` vers le haut depuis ses pieds ; `behind` passe
l'effet derrière lui, `follow` le fait suivre, `hold` garde la dernière image
quelques frames de plus. `impactEffect` remplace, pour ce coup-là, l'étincelle
par défaut du personnage (`hitEffects`).

## Les boîtes

Trois familles, toutes en AABB, toutes écrites **face à droite** et miroitées
au moment du test :

- **hurtbox** — où le combattant peut être touché. Debout, en l'air, au sol.
- **hitbox** — où un coup touche, pendant ses frames actives seulement.
- **pushbox** — ce qui empêche deux corps de se superposer.

`Maj + B` les affiche pendant un combat, en ligne comme à l'entraînement.

## Les combos

Il n'y a **aucun combo écrit en dur**. Un enchaînement existe parce que trois
choses sont vraies en même temps :

1. le coup en cours a touché (`connected`) ;
2. la frame courante est dans sa `cancelWindow` ;
3. le coup demandé est dans son `cancelInto`.

Changer un enchaînement veut donc dire changer deux nombres dans un fichier de
personnage, jamais toucher au moteur.

Les entrées sont tamponnées sur 8 frames, ce qui laisse enchaîner sans timing
au pixel. **Le tampon gèle pendant le hitstop** au lieu de vieillir : sans
cela, l'arrêt sur image du coup qu'on vient de placer mangeait le cancel qu'on
venait de saisir. C'était un vrai bug, trouvé par un test qui échouait.

La mise à l'échelle des dégâts (`COMBO_SCALING`) descend de 100 % à 25 % au
fil des touches, pour qu'un long enchaînement reste payant sans emporter un
round entier.

## Les projectiles

Un coup qui porte un `projectile` en émet **un et un seul**, quel que soit le
nombre de fois où sa frame d'apparition est relue. C'est `projectileSpawned`,
remis à zéro par `startMove`, qui le garantit, et il ne s'agit pas d'une
précaution théorique : le hitstop fige `stateFrame`, donc un tir qui touche
tient le compteur sur la frame d'apparition pendant toute la durée du gel, et
chaque frame de gel relançait un projectile, qui regelait le compteur. Le
spécial devenait un enchaînement dont personne ne sortait.

Un projectile frappe avec **ses** chiffres, `move.projectile.hit`, jamais ceux
du geste qui le lance. Les lire au mauvais endroit donnait à chaque tir les
dégâts et le recul du jab de départ, ce qui expliquait qu'aucun projectile du
jeu ne mette jamais personne au sol.

## La garde

La garde a sa propre touche, `Button.Guard`, et non la marche arrière. La
tenir met le combattant dans l'état `guard` : il est cloué sur place, il ne
saute pas, et la touche l'emporte sur toute direction tenue en même temps.
Reculer n'est plus qu'un déplacement.

Le blocage est relu **à chaque frame** de blockstun, pas seulement à
l'impact : autrement un joueur qui relâche au milieu d'une série restait
protégé jusqu'au bout. On ne garde pas en l'air, et certains coups sont
`unblockable`.

Il n'y a qu'une garde, debout. Le moteur n'a pas d'état accroupi et aucun
coup n'est marqué haut ou bas, donc une garde unique couvre tout ce qui est
blocable ; tenir `Bas` avec la garde ne change rien. Le jour où des coups bas
arrivent, c'est là qu'il faudra trancher.

## La jauge et les ultimes

La jauge monte en donnant, en encaissant et en gardant, jusqu'à
`METER_MAX = 1000`. Un ultime coûte la barre entière. Toute la dépense est
décidée dans la simulation, donc le serveur la recalcule : un client qui
prétendrait avoir la jauge pleine ne déclenche rien.

## Le déroulement

Intro, puis rounds de 60 secondes, deux rounds gagnants. Un KO gèle l'image,
un round vide remet les combattants en place, le match se termine sur le
troisième round ou sur le second si le même joueur l'emporte deux fois. Le
chrono qui tombe à zéro donne le round à qui a le plus de vie, et un match nul
si les deux sont à égalité.

## Les cinq combattants

| Personnage | Ce qui le distingue |
| --- | --- |
| **Luffy** | Portée élastique, cancels souples, Gear 3 qui renverse un round. |
| **Rob Lucci** | Rapide, dégâts secs, Rokuogan à courte portée. |
| **Crocodile** | Portée et zonage, coups lents mais lourds. |
| **Enel** | Projectiles et contrôle à distance, corps à corps faible. |
| **Akainu** | Le plus lent et le plus résistant, les punitions les plus dures. |

Les cinq sont des données. Akainu a été ajouté après coup, et cela a
effectivement coûté ce que cette page promettait : un fichier de données, une
entrée dans la configuration du pipeline, aucune ligne de moteur.

## Ce que les planches permettent, et ce qu'elles ne permettent pas

Les cinq combattants ont maintenant **six animations d'attaque distinctes
chacun**, plus leurs effets. Ce n'était pas le cas au premier jet : trois
personnages réutilisaient deux rangées pour six coups, parce que les rangées
suivantes n'avaient pas été cartographiées. Les planches en contenaient
soixante-quinze pour Akainu seul.

Ce que les planches ne donnent toujours pas :

- **Pas de rangée de récupération pour tous les coups.** Certaines rangées
  s'arrêtent sur le contact ; l'animation étale alors ses dernières images sur
  la récupération plutôt que d'en inventer.
- **Des rangées inutilisables.** Certaines sont dessinées au-dessus de la
  ligne de sol de leur propre rangée, d'autres finissent sur du flou de
  mouvement pleine hauteur, d'autres encore mélangent les deux sens dans une
  même rangée. Elles sont écartées, et la raison est écrite dans
  `characters.config.ts` à l'endroit du choix.
- **Pas d'effet détachable pour tout.** Un effet n'est publié que si la
  rangée le dessine seul ; celles où le personnage est dedans (les plumes de
  Lucci, par exemple) ne peuvent pas servir d'effet.

Ce qui reste est écrit dans `spriteNotes`, visible sur l'écran de sélection.
