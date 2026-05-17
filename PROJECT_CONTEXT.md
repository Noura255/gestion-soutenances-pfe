# Contexte projet — SG Soutenance

## 1. Objectif

Application de gestion des soutenances **PFE / Master** avec authentification JWT et espaces séparés par rôle :

- `ADMIN`
- `STUDENT`
- `SUPERVISOR`
- `JURY`
- `ADMINISTRATION`

Le projet couvre la gestion des utilisateurs, projets, rapports, jurys, soutenances, évaluations, notifications et tableaux de bord métier.

---

## 2. Stack technique

### Backend

- Spring Boot 3
- Java 17
- Spring Security + JWT
- Spring Data JPA / Hibernate
- MySQL
- Maven

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router

### DevOps

- Docker
- Docker Compose
- GitLab CI/CD

---

## 3. Structure du dépôt

```text
backend/src/main/java/com/pfe/defense/
├── admin
├── administration
├── audit
├── auth
├── common
├── config
├── defense
├── evaluation
├── jury
├── project
├── report
├── room
├── security
├── student
├── supervisor
└── user

frontend/src/
├── components
├── context
├── pages
│   ├── admin
│   ├── administration
│   ├── auth
│   ├── jury
│   ├── student
│   └── supervisor
├── routes
└── services
```

---

## 4. Authentification et navigation

- Authentification via JWT Bearer token.
- Le frontend stocke le token dans `localStorage` sous la clé `sg_token`.
- `frontend/src/services/api.js` ajoute automatiquement l’en-tête :

```http
Authorization: Bearer <token>
```

- Redirection par rôle :

```text
STUDENT         -> /student/dashboard
SUPERVISOR      -> /supervisor/dashboard
JURY            -> /jury/dashboard
ADMINISTRATION  -> /administration/dashboard
ADMIN           -> /admin/dashboard
```

---

## 5. Modèle métier réel du code

### Important : ne pas supposer un autre modèle que celui-ci

#### Soutenance

`Defense`

- liée à `Project`
- contient :
  - `defenseDate`
  - `startTime`
  - `endTime`
  - `room`
  - `juryAssignment`

#### Jury

Le jury n’est **pas** stocké comme `juryMembers` dans `Defense`.

La relation réelle passe par `JuryAssignment` :

- `president`
- `examiner1`
- `examiner2`
- `guest`

#### Rapport

`Report`

- n’utilise pas `visibilityStatus`
- utilise :
  - `visibleToJury: boolean`
  - `status: ReportStatus`

Un rapport est visible pour le jury seulement si :

```java
report.isVisibleToJury() == true
&& report.getStatus() == ReportStatus.VISIBLE_TO_JURY
```

#### Évaluation

`Evaluation`

- liée à `Project`
- liée à `juryMember`
- **pas directement liée à `Defense`**

Les API peuvent parler en termes de soutenance, mais la persistance réelle reste centrée sur `Project`.

---

## 6. État actuel des modules

### Module ADMIN

Déjà richement développé :

- dashboard
- gestion utilisateurs
- import/export
- historique de connexion
- paramètres
- notifications
- structure académique
- chatbot admin
- logs
- alertes sécurité

### Module JURY

Développé actuellement avec :

- dashboard jury
- liste des soutenances affectées
- détails d’une soutenance
- consultation des rapports visibles
- formulaire d’évaluation
- brouillon / soumission définitive
- protection contre les modifications après soumission
- chatbot jury
- navigation dédiée dans le layout

#### Endpoints JURY

```http
GET  /api/jury/dashboard
GET  /api/jury/defenses
GET  /api/jury/defenses/{id}
GET  /api/jury/reports/{defenseId}
POST /api/jury/evaluations
PUT  /api/jury/evaluations/{id}/draft
PUT  /api/jury/evaluations/{id}/submit
GET  /api/jury/chatbot/suggestions
POST /api/jury/chatbot/ask
```

#### Règles de sécurité JURY

1. Le membre jury courant est extrait depuis `SecurityContextHolder`.
2. Chaque accès à une soutenance vérifie que l’utilisateur appartient bien à son `JuryAssignment`.
3. Un rapport masqué retourne le message :

```text
Rapport non encore disponible
```

4. Une évaluation soumise ne peut plus être modifiée :

```text
Évaluation déjà soumise, modification interdite
```

### Modules encore minimaux

- `student`
- `supervisor`
- `administration`

---

## 7. Frontend JURY

### Pages

```text
/jury/dashboard
/jury/defenses
/jury/defenses/:id
/jury/defenses/:id/report
/jury/defenses/:id/evaluation
/jury/chatbot
```

### Composants principaux

```text
DefenseCard
EvaluationStatusBadge
ReportStatusBadge
EvaluationReadonlyView
```

### Navigation JURY

Le layout affiche pour le rôle `JURY` :

- Dashboard
- Soutenances
- Chatbot jury

### Chatbot JURY

Même logique visuelle que le chatbot admin, avec des questions adaptées au jury :

- Quels rapports sont disponibles ?
- Quelle est ma prochaine soutenance ?
- Combien d’évaluations restent à compléter ?
- Quelles évaluations sont déjà soumises ?
- Pourquoi je ne vois pas un rapport ?
- Comment saisir une note ?

Le dashboard jury expose aussi des suggestions cliquables qui retournent directement une réponse.

---

## 8. Données de test

Le `DataSeeder` peuple automatiquement :

- utilisateurs
- départements
- filières
- années académiques
- projets
- rapports
- salles
- jurys
- soutenances
- évaluations
- logs
- notifications

### Comptes de test

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| ADMIN | `admin@sgsoutenance.com` | `admin123` |
| STUDENT | `student1@sgsoutenance.com` | `password123` |
| SUPERVISOR | `supervisor1@sgsoutenance.com` | `password123` |
| JURY | `jury1@sgsoutenance.com` | `password123` |
| ADMINISTRATION | `administration1@sgsoutenance.com` | `password123` |

---

## 9. Commandes utiles

### Backend

```bash
cd backend
./mvnw spring-boot:run
./mvnw test
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
```

### Docker

```bash
docker compose up --build
```

---

## 10. Conventions importantes

- Les erreurs API passent par `GlobalExceptionHandler`.
- Les DTOs sont privilégiés pour exposer les réponses API.
- Les badges d’état frontend utilisent des enums métiers cohérents :
  - rapports : `AVAILABLE`, `UNAVAILABLE`
  - évaluations : `NOT_STARTED`, `DRAFT`, `SUBMITTED`
- Le frontend appelle l’API via `frontend/src/services/api.js`.
- Les pages protégées passent par `ProtectedRoute`.
- Les routes racines par rôle passent par `RoleBasedDashboard`.

---

## 11. Fichiers sensibles / protégés

À modifier uniquement avec validation explicite si une règle de collaboration le demande :

### Backend

- `SecurityConfig`
- `JwtService`
- `User`
- `Role`
- `pom.xml`
- `docker-compose.yml`
- `.gitlab-ci.yml`

### Frontend

- `App.jsx`
- `main.jsx`
- `package.json`

---

## 12. Points d’attention pour les futurs développements

1. Ne pas recréer les entités déjà présentes.
2. Respecter le modèle réel existant plutôt qu’un modèle supposé.
3. Pour le jury :
   - passer par `JuryAssignment`
   - ne pas contourner la vérification d’affectation
   - ne jamais exposer un rapport non visible
   - ne jamais rouvrir une évaluation soumise
4. Si de nouveaux modules sont ajoutés, garder la cohérence :
   - DTOs dédiés
   - services métier
   - contrôleurs minces
   - sécurité validée côté service
   - composants React réutilisables

