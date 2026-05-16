# 🎨 Référence des icônes SVG - Module Jury

Ce document liste toutes les icônes SVG utilisées dans le module jury avec leur code et leur utilisation.

---

## 📋 Table des matières

1. [Icônes de navigation](#icônes-de-navigation)
2. [Icônes d'état](#icônes-détat)
3. [Icônes d'action](#icônes-daction)
4. [Icônes de contenu](#icônes-de-contenu)
5. [Comment utiliser](#comment-utiliser)

---

## Icônes de navigation

### 🕐 Horloge (Clock)
**Utilisation** : Évaluations en attente, soutenances urgentes, temps

```jsx
<svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
```

**Où** : Actions rapides, timeline, pages d'évaluations

---

### 📅 Calendrier (Calendar)
**Utilisation** : Dates, planning, soutenances

```jsx
<svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
</svg>
```

**Où** : Actions rapides, timeline, états vides

---

### 📄 Document (Document Text)
**Utilisation** : Rapports, fichiers

```jsx
<svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
</svg>
```

**Où** : Actions rapides, pages de rapports, timeline

---

### 📊 Graphique (Chart Bar)
**Utilisation** : Statistiques, analyses

```jsx
<svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
</svg>
```

**Où** : Actions rapides, pages placeholder

---

### 🏢 Bâtiment (Office Building)
**Utilisation** : Salles, lieux

```jsx
<svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
</svg>
```

**Où** : Timeline (salles de soutenance)

---

## Icônes d'état

### ✅ Check Circle
**Utilisation** : Évaluations soumises, succès, validation

```jsx
<svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
```

**Où** : Pages d'évaluations soumises, états vides, historique

---

### ✏️ Crayon (Pencil)
**Utilisation** : Brouillons, édition

```jsx
<svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
</svg>
```

**Où** : Pages de brouillons, états vides

---

### 🔒 Cadenas (Lock Closed)
**Utilisation** : Rapports non disponibles, accès restreint

```jsx
<svg className="h-20 w-20 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
</svg>
```

**Où** : Pages placeholder (rapports en attente)

---

## Icônes d'action

### 💬 Message (Chat)
**Utilisation** : Chatbot, aide, communication

```jsx
<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
</svg>
```

**Où** : Section chatbot, bouton d'aide

---

### 🔔 Cloche (Bell)
**Utilisation** : Notifications, alertes

```jsx
<svg className="h-20 w-20 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
</svg>
```

**Où** : Pages placeholder (notifications)

---

### ⚙️ Engrenage (Cog)
**Utilisation** : Paramètres, configuration

```jsx
<svg className="h-20 w-20 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>
```

**Où** : Pages placeholder (paramètres)

---

### 👤 Utilisateur (User)
**Utilisation** : Profil, compte

```jsx
<svg className="h-20 w-20 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
</svg>
```

**Où** : Pages placeholder (profil)

---

## Icônes de contenu

### 📚 Livres (Book Open)
**Utilisation** : Documentation, guides, bibliothèque

```jsx
<svg className="h-20 w-20 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
</svg>
```

**Où** : Pages placeholder (guide, tous les rapports)

---

### ❓ Question (Question Mark Circle)
**Utilisation** : FAQ, aide, questions

```jsx
<svg className="h-20 w-20 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
```

**Où** : Pages placeholder (FAQ)

---

## Comment utiliser

### 1. Tailles standard

```jsx
// Petite (dans le texte)
className="h-4 w-4"

// Moyenne (boutons, badges)
className="h-6 w-6"

// Grande (états vides)
className="h-16 w-16"

// Très grande (placeholder)
className="h-20 w-20"
```

---

### 2. Couleurs

```jsx
// Selon le contexte
text-rose-600      // Urgent, en attente
text-amber-600     // Brouillon, attention
text-emerald-600   // Succès, disponible
text-blue-600      // Information
text-purple-600    // Statistiques
text-slate-400     // Secondaire
text-slate-300     // Désactivé
```

---

### 3. Stroke Width

```jsx
// Standard
strokeWidth={2}

// Plus fin (détails)
strokeWidth={1.5}

// Plus épais (emphase)
strokeWidth={2.5}
```

---

### 4. Exemple complet

```jsx
<div className="flex items-center gap-2">
  <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  <span className="font-semibold">Évaluations en attente</span>
</div>
```

---

## 📦 Source des icônes

Toutes les icônes proviennent de **Heroicons** (https://heroicons.com/)
- Version : Outline (stroke)
- Licence : MIT
- Créateur : Tailwind Labs

---

## 🎨 Personnalisation

### Changer la couleur

```jsx
// Remplacer text-rose-600 par la couleur souhaitée
className="h-6 w-6 text-blue-600"
```

### Changer la taille

```jsx
// Ajuster h-X et w-X
className="h-8 w-8 text-rose-600"
```

### Ajouter une animation

```jsx
// Rotation
className="h-6 w-6 text-rose-600 animate-spin"

// Pulse
className="h-6 w-6 text-rose-600 animate-pulse"
```

---

## ✅ Checklist d'utilisation

Avant d'ajouter une nouvelle icône :

- [ ] Vérifier si une icône similaire existe déjà
- [ ] Utiliser la bonne taille selon le contexte
- [ ] Choisir la couleur appropriée
- [ ] Ajouter `fill="none"` et `viewBox="0 0 24 24"`
- [ ] Utiliser `stroke="currentColor"` pour la couleur
- [ ] Définir `strokeLinecap="round"` et `strokeLinejoin="round"`
- [ ] Tester sur différentes tailles d'écran

---

## 🚀 Bonnes pratiques

1. **Cohérence** : Utiliser toujours les mêmes icônes pour les mêmes actions
2. **Taille** : Respecter les tailles standard (4, 6, 16, 20)
3. **Couleur** : Utiliser les couleurs sémantiques (rouge=urgent, vert=succès)
4. **Accessibilité** : Ajouter `aria-label` si l'icône est seule
5. **Performance** : Réutiliser les composants d'icônes

---

## 📝 Exemple de composant réutilisable

```jsx
// components/icons/ClockIcon.jsx
export default function ClockIcon({ className = "h-6 w-6", color = "text-slate-600" }) {
  return (
    <svg className={`${className} ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

// Utilisation
<ClockIcon className="h-8 w-8" color="text-rose-600" />
```

---

**Référence complète ! 🎨**
