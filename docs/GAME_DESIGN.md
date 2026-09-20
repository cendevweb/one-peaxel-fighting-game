# Intentions de jeu

## Ce qu'on vise

Un jeu de combat lisible. La lisibilité passe avant la richesse : un joueur
doit comprendre en regardant ce qui vient de le toucher, pourquoi il ne peut
pas bouger, et ce qu'il aurait fallu faire.

Cela se traduit par des choix précis :

- **Des coups lents à démarrer et courts à récupérer.** Un `startup` de 4 à
  26 frames se voit ; un coup instantané ne se lit pas.
- **Un hitstop généreux.** L'arrêt sur image au moment de l'impact est ce qui
  fait qu'un coup lourd se sent lourd. Il est réparti dans les données, pas
  dans le rendu, donc il est identique sur les deux machines.
- **Des barres de vie à double couche.** Une traînée rouge suit la barre avec
  du retard : un combo se lit comme un seul long coup, pas comme une barre qui
  se téléporte.
- **Un compteur de combo qui dit les dégâts**, pas seulement le nombre de
  touches, parce que c'est l'information qui compte.

## Cinq personnages, pas quinze

Cinq personnages qui fonctionnent valent mieux que quinze qui sont des
variations de couleur. Chacun doit répondre à une question différente :

| Personnage | La question qu'il pose |
| --- | --- |
| **Luffy** | Peux-tu gérer quelqu'un qui te touche de loin et enchaîne ? |
| **Rob Lucci** | Peux-tu gérer quelqu'un de plus rapide que toi ? |
| **Crocodile** | Peux-tu entrer sur quelqu'un qui tient l'espace ? |
| **Enel** | Peux-tu approcher sous les projectiles ? |
| **Akainu** | Peux-tu te permettre de te tromper une seule fois ? |

Les cinq ont chacun six animations d'attaque distinctes, tirées de leur propre
planche, avec les effets que la planche dessine à côté d'eux : le magma
d'Akainu, le sable de Crocodile, la foudre d'Enel. Ce qui reste contraint par
la source est écrit dans `spriteNotes` et affiché sur l'écran de sélection
plutôt que caché.

## Le rythme d'un match

Deux rounds gagnants, 60 secondes par round. C'est court : on veut qu'un match
tienne dans une pause, et qu'une revanche soit à un clic.

La jauge monte assez vite pour qu'un ultime tombe une à deux fois par round.
Un ultime doit être un moment, pas une routine.

## La direction artistique

Pixel art sur une présentation moderne. Les sprites sont à l'échelle 2,2 avec
un filtrage au plus proche voisin : un personnage pixel art interpolé
ressemble à une tache.

L'interface est un jeu de combat, pas un tableau de bord. Panneaux à coins
coupés, typographie large et espacée pour les titres, une ligne de balayage
discrète sur l'arène, des accents orange et cyan. Aucun composant générique.

16:9 sur écran d'ordinateur en priorité. Le tactile n'est pas prévu pour la
V1, et l'interface ne prétend pas le contraire.

## Seul contre le roster

Le mode arcade demande un combattant, puis oppose tous les autres, un par un.
La longueur du parcours n'est pas un chiffre écrit quelque part : c'est le
roster moins le personnage choisi, donc un sixième personnage rallonge
l'échelle sans qu'une ligne change.

Quatre niveaux, de la Recrue à l'Amiral. Ce qui change d'un niveau à l'autre
est la fréquence à laquelle l'ordinateur s'engage — attaquer, enchaîner,
garder, dépenser sa jauge — et non sa connaissance du combat : il voit ce que
voit un joueur. La Recrue n'enchaîne jamais, ce qui est l'essentiel de ce qui
la rend abordable ; l'Amiral garde la plupart des coups qu'il voit venir.

Chaque combat se joue sur une arène tirée de la graine du parcours, et un
combat retenté après une défaite reçoit une graine neuve : l'ordinateur ne
rejoue pas le combat qui vient de vous battre.

## Ce que le jeu ne fait pas

- Pas de comptes, pas de classement, pas de progression.
- Pas de sons : les planches n'en apportent pas, et rien d'original n'a été
  produit. Le hitstop et les effets visuels portent seuls le retour d'impact.
- L'ordinateur ne lit pas vos habitudes. Il voit la distance, l'état de
  l'adversaire et sa propre jauge, et répond à la situation présente : il ne
  reconnaît pas un schéma, ne punit pas sur réaction et ne prévoit rien au-delà
  du coup suivant. C'est un partenaire d'entraînement compétent, pas un
  adversaire fort.
