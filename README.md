# Yele Food Smart Management

Plateforme digitale pour **Yele Food Lounge** : page publique, service serveurs, réservations client et pilotage admin.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Espaces

| URL | Rôle |
|-----|------|
| `/` | Accueil public — promotions, spectacles, menu |
| `/client` | Réservations & Click & Collect |
| `/serveur` | Prise de commande (PIN : `1234` ou `5678`) |
| `/bar` | Écran bar/caisse — commandes en temps réel |
| `/admin` | Administration (PIN : `admin2026`) |

## Fonctionnalités admin

- Ajout d’articles au menu (plats / boissons, prix, stock)
- Upload d’affiches pour les spectacles
- Promotions, mode urgence produit, stocks & alertes
- Validation réservations et commandes en ligne
- Statistiques du jour & carnet VIP

## Données

Stockées dans `data/store.json`. Images uploadées dans `public/uploads/`.
