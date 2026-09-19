# Suite

## Avant une mise en ligne publique

1. **Régler la question des droits.** Soit une autorisation pour les planches,
   soit des ressources originales. Le pipeline est fait pour que le second
   chemin ne coûte que `characters.config.ts` et une commande.
2. **Déployer.** Render pour le serveur (`render.yaml` est prêt, il manque le
   compte et `ALLOWED_ORIGINS`), Vercel pour le site (il manque le compte et
   `NEXT_PUBLIC_GAME_SERVER_URL`, figée à la compilation).
3. **Mesurer la latence réelle** entre deux machines, pas deux onglets, et
   régler `INPUT_DELAY` en conséquence.

## Ensuite, par ordre d'intérêt

- **Du son.** C'est ce qui manque le plus au ressenti d'impact. Demande des
  ressources originales ou libres.
- **Un cinquième personnage**, pour vérifier que l'ajout ne coûte bien qu'un
  fichier de données et des animations.
- **Des coups aériens propres** pour les trois personnages qui n'en ont pas.
- **Un vrai mode entraînement** : affichage des frames d'avantage, répétition
  de la dernière séquence, adversaire qui garde.
- **Reconnexion en cours de match** côté client. Le serveur tient déjà le
  siège douze secondes ; le client ne sait pas encore le reprendre.
- **Tactile et format portrait**, si le jeu doit sortir du bureau.

## Ce qui n'est pas prévu

Classement, comptes, progression, achats. Tout cela demande un stockage et des
secrets, sur un dépôt public, pour un jeu qui n'en a pas besoin.
