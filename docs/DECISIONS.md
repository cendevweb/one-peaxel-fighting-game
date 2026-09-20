# Décisions

Les questions non bloquantes tranchées en cours de route, avec ce qui les a
motivées. Une décision notée ici a été prise sans attendre de réponse, comme
demandé ; elle reste discutable.

## Simulation en virgule fixe entière

**Décision.** Toutes les positions, vitesses et accélérations de l'état sont
des entiers en 1/64 de pixel.

**Pourquoi.** Le serveur (Node) et le client (navigateur) doivent obtenir le
même résultat au bit près, sinon la correction réseau est elle-même une
désynchronisation. Les flottants ne garantissent pas cela d'un moteur JS à
l'autre. Le coût est un peu de lisibilité dans le moteur ; le bénéfice est un
test qui vérifie qu'aucune coordonnée n'est fractionnaire.

## Le serveur fait autorité, le client prédit

**Décision.** Modèle autoritaire avec prédiction et correction, pas de
rollback pair à pair.

**Pourquoi.** Le rollback véritable demande que chaque pair fasse autorité sur
ses entrées, ce qui ouvre la porte à la triche sur un jeu web public et
demande une infrastructure de mise en relation directe. Le modèle autoritaire
donne la même réactivité sur une bonne connexion pour une complexité bien
moindre. La limite est documentée dans `NETWORKING.md` plutôt que maquillée.

## Extraction automatique des sprites plutôt que rectangles mesurés

**Décision.** Un pipeline qui analyse les planches, contre des coordonnées
écrites à la main.

**Pourquoi.** Les rectangles mesurés à la main du projet précédent donnaient
des animations qui sautaient. L'ancrage sur le centre de masse des pieds
règle le problème à la racine, et changer de planches ne demande plus des
heures de mesure. Le coût est un fichier de configuration par personnage, qui
reste irréductible.

## `enum` plutôt que `const enum`

**Décision.** `Button` est un `enum` TypeScript ordinaire.

**Pourquoi.** `apps/web` compile en modules isolés ; un `const enum` exporté
par un paquet ne peut pas y être inliné, et la compilation échoue. Le gain de
performance d'un const enum est nul à cette échelle.

## Atlas publiés dans le dépôt

**Décision.** Les atlas et les arènes sont versionnés, pas régénérés à la
compilation.

**Pourquoi.** Vercel et Render ne doivent pas avoir à installer `sharp` ni à
disposer des planches brutes pour bâtir le site. Le coût est environ 2,5 Mo
dans le dépôt. Note : cela veut aussi dire que des images tirées d'un rip de
ROM sont dans un dépôt public — voir la section sur les droits.

## Deux arbres de touches pour le clavier

**Décision.** Flèches **et** WASD **et** ZQSD sont liées au même mouvement,
via `event.code`.

**Pourquoi.** Le jeu est écrit en français ; `KeyW` et `KeyA` ne tombent pas
sous les mêmes doigts en AZERTY et en QWERTY. `event.code` désigne une touche
physique, jamais le caractère produit.

## Le HUD lit un pont, pas un état React

**Décision.** Phaser et React partagent un objet mutable ; le HUD s'y abonne à
20 Hz.

**Pourquoi.** Faire passer l'état du match par `setState` déclencherait un
rendu React à chaque frame, au milieu de la boucle de dessin. Le pont coûte un
peu de pureté ; il évite de perdre des frames à chaque coup porté.

## Pas de son

**Décision.** Aucune bande-son, aucun effet sonore.

**Pourquoi.** Les planches n'apportent rien d'audio, et produire des sons
originaux dépassait le cadre. Plutôt que d'ajouter des sons trouvés dont les
droits seraient tout aussi flous que ceux des sprites, le jeu s'en passe et le
dit.

## Sprites d'origine incertaine

**Décision.** Les planches sont utilisées pour le prototype, signalées comme
non libres de droits, et exclues de la licence du dépôt.

**Pourquoi.** Elles viennent d'un rip de ROM de *One Piece: Gigant Battle! 2*
(Bandai Namco / Ganbarion). Aucune autorisation de rediffusion n'est établie.
Le pipeline est conçu pour qu'elles soient remplaçables sans toucher au jeu :
un déploiement public demande soit une autorisation, soit des ressources
originales.

## L'animation d'attaque est calée sur la frame d'impact

**Décision.** Une attaque ne joue plus son animation étalée sur sa durée. Le
move déclare `impactFrame`, l'image de la planche où le coup porte, et le
rendu garantit deux choses : cette image est à l'écran exactement à la
première frame active, et l'image finale tombe exactement à la dernière frame
du move.

**Pourquoi.** L'ancien calcul était `frame = progress × nbFrames`. Sur les
trente moves du jeu, aucun n'avait son image de contact au moment où sa boîte
s'ouvrait : le Pistolet de Luffy touchait pendant que le bras partait encore,
le Rankyaku de Lucci pendant que la jambe descendait. C'est ce décalage qui
donnait l'impression que « la portée et l'impact sont mauvais » alors que les
boîtes, elles, étaient plausibles. Étaler la queue de l'animation sur la
récupération plutôt que la jouer à sa cadence propre évite l'autre moitié du
problème : l'animation arrivait à sa dernière image au milieu du move et la
figeait jusqu'à la fin.

## Les effets appartiennent au move, pas au moteur

**Décision.** Un move porte une liste d'`effects` — clé d'animation, frame
d'apparition, décalage, échelle, `behind`, `follow`, `hold` — et chaque
personnage porte ses propres `hitEffects` (léger, lourd, garde). Tout cela est
purement graphique : rien n'entre dans la simulation ni dans le checksum.

**Pourquoi.** Les planches rangent les effets sur les rangées voisines du
personnage : huit rangées de magma à côté d'Akainu, le sable à côté de
Crocodile, la foudre à côté d'Enel. Rien de tout cela n'était publié, et
chaque coup du jeu, quel que soit le personnage, affichait l'étincelle de
Luffy. Attacher l'effet au move est le seul endroit où l'information existe :
c'est le move qui sait à quelle frame le magma jaillit.

## Certaines rangées sont dessinées à l'envers, ou dans l'autre sens

**Décision.** Une animation peut déclarer `flip` (miroir horizontal) et
`order` (ordre de lecture explicite des frames de la bande).

**Pourquoi.** Le rip n'est pas cohérent : le Pistolet de Luffy est dessiné
vers la gauche alors que sa Gatling va vers la droite, et le Meigō d'Akainu
comme le Rokuōgan de Lucci sont dessinés de droite à gauche — lus dans le sens
de la planche, la boule de magma rétrécit au lieu de grossir. Corriger cela au
rendu pour un personnage entier casserait les autres rangées ; c'est donc une
propriété par animation.

## Le Gear 3 joue le pied géant, pas le gonflage de bras

**Décision.** `luffy-gigant` pointe sur la bande 41 (le pied géant qui
retombe, Luffy debout dessus) et non sur la bande 40 ni sur la bande 43.

**Pourquoi.** Les bandes 40 et 43 sont dessinées bien au-dessus de la ligne de
sol de leur rangée et finissent toutes deux sur du flou de mouvement pleine
hauteur. En jeu, Luffy flottait au-dessus du sol et la dernière image devenait
une barre jaune en travers de l'écran, tenue pendant toute la récupération. La
bande 41 est posée sur sa propre ligne de sol et finit sur une pose qui
supporte d'être tenue.

## La garde a sa propre touche

**Décision.** `Button.Guard` est un bit d'entrée à part (`1 << 8`), tenu sur
`Espace` ou `H` au clavier, `Pavé 7` pour le joueur 2. Reculer ne garde plus :
c'est redevenu un simple déplacement.

**Pourquoi.** La garde sur la marche arrière est l'héritage des bornes à huit
directions et deux boutons. Elle force un choix que personne ne veut faire —
se protéger ou gagner du terrain — et elle rend la garde illisible à l'écran,
puisque le même geste veut dire deux choses selon ce que fait l'adversaire.
Le jeu a assez de touches libres pour s'en passer.

**Ce qui a été tranché en chemin, faute de règle évidente.**

*La touche.* `Espace` plutôt qu'une lettre : la garde se tient, souvent le
temps d'une série entière, et le pouce est le seul doigt qui peut tenir sans
priver les autres d'un coup. `Espace` servait au saut ; le saut garde
`↑`, `W` et `Z`, qui suffisent. `H` est bindé en second, pour qui préfère
garder la main droite sur la rangée des coups.

*Le dev.* `Maj + H` affichait les boîtes de collision et tombait donc sur la
nouvelle touche de garde. C'est passé à `Maj + B`, comme « boîtes ».

*Debout ou accroupi.* Une seule garde, debout. Le moteur n'a pas d'état
accroupi et aucun coup n'est marqué haut ou bas : une garde unique couvre
donc tout ce qui est blocable, et tenir `Bas` avec la garde ne change rien.
Le jour où des coups bas arrivent, il faudra y revenir — c'est à ce
moment-là que la question a une réponse, pas avant.

*Celui qui gardait déjà en reculant.* La garde l'emporte sur toute direction
tenue en même temps, et cloue sur place. Un joueur qui tient `arrière` et la
garde se protège sans reculer d'un pixel. C'est le contraire du réflexe hérité
de la marche arrière, et c'est voulu : la garde est une décision, pas un effet
de bord d'un déplacement. Elle interdit aussi le saut tant qu'elle est tenue,
pour la même raison.

*Le bot.* `ai.ts` renvoyait `arrière` pour garder ; il renvoie maintenant
`Button.Guard` seul. L'adversaire tient donc sa position au lieu de se
pousser vers le mur à chaque série bloquée — un effet secondaire favorable
qui n'a demandé aucun réglage de difficulté.
