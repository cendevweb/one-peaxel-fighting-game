# Le réseau

## Ce que c'est, et ce que ce n'est pas

Le serveur fait autorité. Le client prédit et se corrige.

**Ce n'est pas du rollback netcode** au sens où l'entend un joueur de jeu de
combat, où chaque machine fait autorité sur ses propres entrées et où les deux
pairs se réconcilient directement. Ici, le serveur possède le match ; la
re-simulation du client est une correction, pas une négociation. Cela achète
la même réactivité sur une bonne connexion ; cela n'achète pas le même
comportement à 150 ms de latence, et ce n'est pas présenté comme tel.

## Le trajet d'une frame

```
Client                          Serveur
──────                          ───────
lit le clavier -> masque
simule la frame N localement
envoie {frame: N, masques des 6 dernières}
                          ->    range le masque à N + inputDelay
                                simule quand la frame arrive
                          <-    toutes les 3 frames : instantané
                                (état encodé + entrées confirmées)
restaure l'état du serveur
rejoue N_serveur -> N_local
   avec les vraies entrées
```

Six masques sont renvoyés à chaque envoi, pas un seul. Un paquet perdu est
ainsi rattrapé par le suivant sans demander de retransmission.

## Le délai d'entrée

`inputDelay` vaut 3 frames (50 ms) par défaut. Une entrée envoyée pour la
frame N est appliquée par le serveur à N+3, ce qui lui laisse le temps
d'arriver. Le client reste calé quelques frames devant le serveur et corrige
sa cadence d'**une frame au plus par mise à jour** : le joueur perçoit un jeu
très légèrement rapide ou lent, jamais un à-coup.

Une entrée qui arrive en retard n'est pas jetée : elle est replacée sur la
première frame encore ouverte.

## La correction

À chaque instantané, le client compare le checksum de ce qu'il avait prédit à
la frame F avec celui de l'état du serveur à la même frame. Identiques : rien
à faire, la prédiction tenait. Différents : il repart de l'état du serveur et
rejoue toutes les frames jusqu'à la sienne, cette fois avec les entrées
confirmées.

Les événements produits par cette re-simulation sont **jetés**. Leurs
étincelles et leurs sons ont déjà été joués sur les frames mal prédites ; les
rejouer serait pire que de ne pas corriger.

Tout cela ne fonctionne que parce que `combat-core` est déterministe et
entier. Si rejouer les mêmes frames avec les mêmes entrées ne donnait pas
exactement le même résultat, la correction serait elle-même une désync. Un
test du serveur rejoue les entrées confirmées d'un instantané dans une
simulation neuve et vérifie que le checksum tombe juste.

## Le protocole

Tout ce qui entre est validé par un schéma zod avant d'atteindre le moteur —
pseudo, code de salon, identifiant de personnage, masques. Les masques sont en
plus nettoyés par `sanitizeInput`, qui efface tout bit qu'un client n'a pas à
positionner.

Chaque socket est limité à 120 messages par seconde. Au-delà, les messages
sont ignorés.

Les codes de salon sont tirés dans un alphabet sans `0`, `O`, `1` ni `I`, pour
qu'un code dicté au téléphone soit saisissable.

## Les salons

`lobby` → `select` → `countdown` → `fight` → `result`, puis `select` sur une
revanche. Le client n'a aucune notion locale de « on est probablement en
train de se battre » : l'écran affiché découle de la phase que le serveur
annonce.

## Reprendre son siège

Une déconnexion ouvre un délai de grâce de douze secondes. Le joueur qui
revient reprend son siège ; sinon, forfait. Un salon vide disparaît au bout
d'une minute.

Reprendre le siège demande un détour, parce qu'un joueur est identifié par son
socket et qu'un navigateur qui se reconnecte en obtient un nouveau : le serveur
voit un inconnu, pas un revenant. Un **jeton de reprise** est donc remis au
moment où le joueur entre dans un salon. L'onglet le garde dans
`sessionStorage` — pas `localStorage`, parce que deux onglets sur une machine
sont deux joueurs et que partager le jeton laisserait le second voler le siège
du premier — et le représente à chaque connexion. Le salon rattache alors le
siège au nouveau socket, avec son slot, son personnage et ses rounds, et
renvoie au joueur les paramètres du match ; l'instantané suivant remet sa
simulation en phase.

Quitter volontairement efface le jeton, sinon la connexion suivante ramènerait
le joueur dans une partie dont il vient de sortir.

Le battement de cœur est réglé à quatre secondes d'intervalle et huit secondes
d'attente, au lieu des dix et vingt de la bibliothèque. Avec les valeurs par
défaut, une connexion coupée net n'était constatée qu'au bout d'une trentaine
de secondes, soit plus que le délai de grâce : l'adversaire attendait devant
une arène figée un décompte qui n'avait pas commencé.

## Les réglages

| Variable | Défaut | Ce qu'elle fait |
| --- | --- | --- |
| `PORT` | 8080 | Port d'écoute. Render le fournit. |
| `ALLOWED_ORIGINS` | — | Origines autorisées, séparées par des virgules. Les domaines de prévisualisation Vercel sont acceptés par joker. |
| `INPUT_DELAY` | 3 | Frames de délai d'entrée. |
| `SNAPSHOT_INTERVAL` | 3 | Frames entre deux instantanés. |
| `RECONNECT_GRACE_MS` | 12000 | Délai de grâce après une déconnexion. |
| `NEXT_PUBLIC_GAME_SERVER_URL` | `http://localhost:8080` | Côté client, **figée à la compilation**. |

## Les limites connues

- Au-delà de ~120 ms, la correction devient visible : l'adversaire se replace
  d'un coup après un échange. C'est le comportement attendu d'un modèle
  autoritaire, pas un défaut à corriger par un réglage.
- Il n'y a pas de détection de triche au-delà de la validation des entrées. Le
  serveur recalcule tout, donc un client modifié ne peut pas s'octroyer de
  dégâts, mais rien n'empêche un robot de jouer.
- Deux onglets sur la même machine ne prouvent rien de la latence. Le parcours
  a été vérifié avec deux contextes de navigateur indépendants ; un vrai test
  à deux machines reste à faire.
- La reprise rattrape une coupure, pas une absence : au-delà des douze
  secondes le siège est perdu et le match est donné à l'adversaire. C'est
  délibéré — un salon qui attendrait indéfiniment bloquerait le joueur resté.
