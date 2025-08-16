# Todo Gerarchica — Full TypeScript

App **Vite + React + MUI + React Hook Form** + **Firebase (Auth, Firestore, Functions)**, con **todo gerarchici**, `assignees` multipli e visibilità per proprietario/assegnati. Include base **React Native (Expo/TS)** e **Cloud Functions (TS)**.

## Setup rapido
1. Crea progetto Firebase e abilita **Auth (Google)**, **Firestore**, **Functions**.
2. Copia la config in `web/src/services/firebase.ts` (e in RN se usi mobile).
3. Deploy delle Functions:
   ```bash
   cd functions
   npm i
   npm run build
   firebase deploy --only functions
   ```
4. Regole Firestore:
   ```bash
   firebase deploy --only firestore:rules
   ```
5. Web app:
   ```bash
   cd web
   npm i
   npm run dev
   ```

## Note
- Le query client uniscono owner e assignees con due subscription e merge in memoria.
- Gli assignees possono aggiornare solo `completed` e `progress`.
- La function `onUserCreate` popola `/users` all'iscrizione per l'Autocomplete degli assegnatari.
