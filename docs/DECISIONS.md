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
