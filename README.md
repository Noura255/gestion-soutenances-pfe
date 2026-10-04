# SG Soutenance

Base commune d'une application de gestion des soutenances **PFE / Master**.

## Stack

- Backend : Spring Boot 3, Java 17, Maven, Spring Security, JWT, JPA / Hibernate, MySQL
- Frontend : React, Vite, Tailwind CSS
- DevOps : GitLab CI/CD, GitLab Runner
## 👥 Projet d'équipe et ma contribution

Projet réalisé en équipe dans le cadre de la formation d'ingénieur (FSTG Marrakech). Dépôt GitLab d'origine : https://gitlab.com/Mouad2D2/system_gestion_soutenance

**Ma partie : le module Administration (backend Spring Boot)**
- Tableau de bord de l'administration pédagogique
- Planification des soutenances, avec détection des conflits
- Affectation des jurys
- Gestion des salles
- Export des données
- Service d'assistant (chatbot) pour l'administration
- Conception du module (document de design)

**Équipe :** Mouad Jaalouti, Anas (IRISI), Mohammed Allali, Mohammed Handache, Anas Halloumi, Noura Lamzara
## Architecture

```text
backend/src/main/java/com/pfe/defense/
├── auth
├── config
├── security
├── user
├── common
├── project
├── report
├── defense
├── room
├── jury
├── evaluation
├── audit
├── student
├── supervisor
├── administration
└── admin
```

Les tables sont **créées automatiquement par Spring Boot via JPA / Hibernate** avec `spring.jpa.hibernate.ddl-auto=update`. Aucun script SQL manuel n'est requis.

## Démarrage local

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

En développement local, le frontend pointe par défaut vers `http://localhost:8080/api` pour rester fiable même si l'interface est ouverte hors du proxy Vite. Le proxy `/api` de Vite reste également disponible.

### IntelliJ IDEA

Le projet contient trois configurations partagées :

- `Backend - Spring Boot`
- `Frontend - Vite`
- `Full App`

Dans IntelliJ, recharge le projet Maven si nécessaire, sélectionne `Full App` dans la liste déroulante en haut à droite, puis clique sur le bouton ▶.  
Le backend utilise Java 17 : configure le **Project SDK** d'IntelliJ sur un JDK 17 avant le premier lancement.

## Comptes de test

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| ADMIN | `admin@sgsoutenance.com` | `admin123` |
| STUDENT | `student1@sgsoutenance.com` | `password123` |
| SUPERVISOR | `supervisor1@sgsoutenance.com` | `password123` |
| JURY | `jury1@sgsoutenance.com` | `password123` |
| ADMINISTRATION | `administration1@sgsoutenance.com` | `password123` |

Tous les mots de passe sont encodés avec BCrypt à l'insertion. L'administrateur principal `admin@sgsoutenance.com` est protégé contre les modifications depuis le module ADMIN.

## Seeder de données

Le `DataSeeder` ajoute des utilisateurs, départements, filières, années universitaires, projets, rapports, salles, jurys, soutenances, évaluations, logs et notifications de test liés entre eux. Les données semées sont marquées avec `seedData=true` quand l'entité le permet ; les vraies données existantes ne sont jamais supprimées.

```properties
app.seed.enabled=true
app.seed.reset-fake-data=false
```

- `app.seed.enabled=false` : désactive complètement le seeder.
- `app.seed.enabled=true` : ajoute uniquement les données de test manquantes.
- `app.seed.reset-fake-data=true` : supprime uniquement les objets marqués `seedData=true`, puis les recrée proprement.

Les tables restent créées automatiquement par Hibernate via `spring.jpa.hibernate.ddl-auto=update` ; aucun script SQL manuel n'est nécessaire.

## Endpoints livrés

### Authentification

- `POST /api/auth/login`
- `GET /api/auth/me`

### Administration

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/admin/users?search=&role=&department=&enabled=`
- `POST /api/admin/users`
- `PUT /api/admin/users/{id}`
- `DELETE /api/admin/users/{id}`
- `PUT /api/admin/users/{id}/disable`
- `PUT /api/admin/users/{id}/enable`
- `PUT /api/admin/users/{id}/reset-password`
- `POST /api/admin/users/import`
- `GET /api/admin/users/export/csv`
- `GET /api/admin/users/export/excel`
- `GET /api/admin/users/export/pdf`
- `GET /api/admin/logs`
- `GET /api/admin/login-history`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`
- `POST /api/admin/notifications`
- `GET /api/admin/notifications`
- `GET /api/admin/backup`
- `GET /api/admin/departments`
- `POST /api/admin/departments`
- `PUT /api/admin/departments/{id}`
- `DELETE /api/admin/departments/{id}`
- `GET /api/admin/fields`
- `POST /api/admin/fields`
- `PUT /api/admin/fields/{id}`
- `DELETE /api/admin/fields/{id}`
- `GET /api/admin/academic-years`
- `POST /api/admin/academic-years`
- `PUT /api/admin/academic-years/{id}`
- `DELETE /api/admin/academic-years/{id}`
- `GET /api/admin/chatbot/suggestions`
- `POST /api/admin/chatbot/ask`
- `GET /api/admin/security-alerts`
- `GET /api/admin/roles`

## Modules volontairement laissés minimaux

Les modules `student`, `supervisor`, `jury` et `administration` possèdent uniquement leur socle d'architecture et leurs dashboards vides. Les workflows détaillés sont réservés aux branches dédiées.

## Stratégie Git

- Branches permanentes : `main`, `develop`
- Branches fonctionnelles : `feature/student`, `feature/supervisor`, `feature/jury`, `feature/administration`, `feature/admin-devops`
- Aucun push direct sur `main`
- Merge request obligatoire avant intégration
- Pipeline GitLab obligatoire et vert avant merge

Voir aussi [`docs/git-strategy.md`](docs/git-strategy.md).
