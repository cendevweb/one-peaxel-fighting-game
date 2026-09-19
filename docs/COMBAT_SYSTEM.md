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

## Les boîtes

Trois familles, toutes en AABB, toutes écrites **face à droite** et miroitées
au moment du test :

- **hurtbox** — où le combattant peut être touché. Debout, en l'air, au sol.
- **hitbox** — où un coup touche, pendant ses frames actives seulement.
- **pushbox** — ce qui empêche deux corps de se superposer.

`Maj + H` les affiche pendant un combat, en ligne comme à l'entraînement.

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

## La garde

Tenir la direction opposée à l'adversaire garde. Le blocage est relu **à
chaque frame** de blockstun, pas seulement à l'impact : autrement un joueur
qui relâche au milieu d'une série restait protégé jusqu'au bout. On ne garde
pas en l'air, et certains coups sont `unblockable`.

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

## Ce que les planches ne permettent pas

Seul Luffy a un jeu complet dans les planches d'origine. Les trois autres
n'ont que deux animations d'attaque exploitables chacune, et leurs coups
réutilisent donc les mêmes images avec des propriétés différentes. C'est écrit
dans `spriteNotes`, visible sur l'écran de sélection, et ce n'est pas présenté
comme autre chose.
