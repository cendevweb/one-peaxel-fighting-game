# État d'avancement

Dernière mise à jour : 19 septembre 2026.

Rien de ce tableau n'est déclaré terminé sur la foi d'une relecture de code :
chaque ligne « Vérifié » a été jouée dans un navigateur.

## Ce qui fonctionne, et comment ça a été vérifié

| Élément | État | Vérification |
| --- | --- | --- |
| Moteur de combat | Fait | 36 tests : mouvements, frames, garde, combos, jauge, projectiles, KO, déterminisme, re-simulation. |
| Ressources | Fait | 5 tests reliant chaque animation et chaque arène citées par le jeu au manifeste publié. |
| Serveur temps réel | Fait | 27 tests : salons, sélection, synchronisation, fin de match, revanche, déconnexion, checksum d'instantané. |
| Client web | Fait | Build de production Next.js, puis parcours complet joué dans deux contextes de navigateur indépendants. |
| Parcours en ligne | Vérifié | Pseudo → création → code → adversaire rejoint → sélection synchronisée → prêt → décompte → combat → K.O. → round 2 → fin de match → revanche demandée des deux côtés → retour à la sélection. Deux navigateurs indépendants, chronos identiques sur les deux écrans, aucune erreur console. |
| Entraînement local | Vérifié | Match complet joué jusqu'au bout : combos comptés, KO, deux rounds gagnés, écran de résultat, revanche qui relance au round 1. |
| Reconnexion | Vérifié | Rechargement de page en plein combat : le serveur constate la coupure, le jeton rend le siège 85 ms plus tard sur un nouveau socket, les deux écrans restent d'accord et le joueur reprend le combat. |

Total : **73 tests verts**, `tsc -b --force` propre sur tout le dépôt.

## Ce qui n'est pas fait

- **Déploiement.** Ni Vercel ni Render ne sont branchés : cela demande des
  comptes et des clés que le projet n'a pas. `render.yaml` et `.env.example`
  sont prêts, le reste attend.
- **Push GitHub.** Le dépôt distant existe, mais l'application GitHub de
  Claude n'y est pas installée : les commits sont locaux.
- **Test à deux machines.** Deux contextes de navigateur ne disent rien de la
  latence réelle. Le comportement à 100 ms et plus n'a pas été mesuré.
- **Son.** Aucun.
- **Tactile.** Aucun ; la V1 vise l'écran d'ordinateur en 16:9.

## Ce qui est incomplet et assumé

Trois personnages sur cinq — Lucci, Crocodile et Enel — n'ont que deux
animations d'attaque exploitables dans les planches d'origine ; Luffy et
Akainu en ont une par coup. Leurs coups se distinguent par leurs propriétés
de jeu, pas par leurs images. C'est visible sur l'écran de sélection.

Les droits des planches ne sont pas établis. Voir `DECISIONS.md` et le README.
