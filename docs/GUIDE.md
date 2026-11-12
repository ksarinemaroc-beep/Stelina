# Guide Stelina

Tout se fait depuis l'admin Shopify, sans toucher au code.

## 1. Installer le thème (sans le publier)

1. Admin Shopify > **Boutique en ligne > Thèmes > Ajouter un thème > Connecter depuis GitHub**.
2. Choisis le dépôt `Stelina` et la branche `claude/stelina-shopify-theme-iltl3f`.
3. Le thème apparaît dans ta bibliothèque, **non publié**. Clique sur **Personnaliser** pour le voir.

## 2. Importer le catalogue

1. **Produits > Importer** > choisis `catalogue/products.csv` > Importer.
2. Les 8 bijoux et les 4 parures d'origine arrivent **actifs**. Les 8 bagues et les 3 nouvelles parures (Écrin Rose, Duo Atelier, Duo Éclat) arrivent en **brouillon** : passe-les en « Actif » quand elles sont confirmées.
3. Le stock est vide : ouvre chaque produit > **Stock** > renseigne la quantité.

### Créer les collections (une seule fois)

**Produits > Collections > Créer une collection**, type « Automatisée », condition *Type de produit est égal à…* :

| Nom | Condition | Adresse (handle) |
|---|---|---|
| Colliers | Type = Collier | `colliers` |
| Bracelets | Type = Bracelet | `bracelets` |
| Bagues | Type = Bague | `bagues` |
| Parures | Type = Parure | `parures` |

Pour **Bagues**, tant qu'aucune bague n'est active : dans la collection, rubrique **Modèle de thème**, choisis `bientot`. Remets `Collection par défaut` quand les bagues sont en vente.

La section « Les bijoux Stelina » de l'accueil affiche la collection **Page d'accueil** (créée par Shopify) : ajoutes-y les bijoux à mettre en avant.

## 3. Ajouter tes photos

- **Photos du thème** (campagne, galerie « seuls et portés », carrousel de bagues) : va dans **Contenu > Fichiers > Importer** et envoie tout le dossier `photos/` **sans renommer les fichiers**. Le thème les retrouve par leur nom. Sinon, choisis chaque photo à la main dans **Personnaliser**.
- **Photos produit** : dans chaque produit, ajoute d'abord la photo du **bijou seul**, puis la photo **portée**. Le bouton « Vue portée » des cartes affiche la deuxième.
- Renseigne le **texte alternatif** de chaque photo (clic sur la photo > « Ajouter un texte alternatif »).

## 4. Changer un prix

**Produits** > ouvre le produit > champ **Prix** > Enregistrer.

## 5. Régler la livraison

1. **Paramètres > Expédition et livraison** > zone **France** uniquement.
2. Ajoute un tarif standard (par exemple 4,90 €).
3. Ajoute un tarif **gratuit** avec la condition « prix de la commande ≥ 40 € ».
4. Dans **Personnaliser > Paramètres du thème > Stelina > Livraison offerte**, mets le **même montant** : la barre du panier n'accorde pas la livraison, elle l'annonce seulement.

## 6. Pages légales

1. Complète les modèles du dossier `docs/pages-legales/`.
2. Colle-les dans **Paramètres > Politiques** (mentions légales, conditions de vente, remboursement, confidentialité). Les liens s'affichent automatiquement dans le pied de page.

## 7. Relier un bijou et sa parure

Par les **tags** du produit :
- sur un bijou : `parure-papillon` affiche un lien vers le produit dont l'adresse est `parure-papillon` ;
- sur une parure : `piece-papillia` affiche un lien vers le produit `papillia`.

Le CSV contient déjà ces tags. Une parure est un produit à part : son stock ne se déduit pas de celui des bijoux qui la composent.

## 8. Réglages utiles (Personnaliser > Paramètres du thème > Stelina)

- seuil et messages de livraison offerte ;
- badge « Pièce limitée » : seuil de stock et texte ;
- couleurs or, polices, bouton « Vue portée ».

Menus : **Contenu > Menus**. Le menu principal s'appelle `main-menu`, celui du pied de page `footer`.

## 9. Publier

Quand tout est vérifié sur téléphone et ordinateur : **Boutique en ligne > Thèmes** > sur le thème Stelina, **Publier**.
