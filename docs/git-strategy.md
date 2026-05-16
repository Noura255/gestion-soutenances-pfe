# Stratégie Git

```text
main
└── develop
    ├── feature/student
    ├── feature/supervisor
    ├── feature/jury
    ├── feature/administration
    └── feature/admin-devops
```

## Règles

1. `main` contient uniquement des versions stables.
2. `develop` agrège les fonctionnalités prêtes à être testées ensemble.
3. Chaque module avance dans sa branche `feature/*` dédiée.
4. Aucun push direct sur `main`.
5. Toute intégration passe par une merge request relue.
6. Le pipeline GitLab doit être réussi avant merge.
7. Les modules futurs (`student`, `supervisor`, `jury`, `administration`) ne doivent pas être modifiés hors de leur périmètre sans besoin partagé clair.
