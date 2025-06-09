# Prüfungsleistung – Individuelle Backend-Anwendung mit FastAPI  
*Modul „Backendentwicklung“, 2. Semester – Stand 04 · 05 · 2025*

---

## Aufgabenstellung

1. **Thema wählen**  
   Wähle einen Vorschlag aus der Themenliste (→ Kap. *Themen*) oder reiche eine eigene Idee zur Genehmigung ein.

2. **Architektur skizzieren**  
   Lege in `/docs/architecture.md` eine Grundlegende Dokumentation an. Diese kann kurz gefasst werden, sollte jedoch diese Punkte umfassen:
   - Projektthema & Erklärung
   - Architektur
   - Bedienungsanleitung
   - Ergriffene Sicherheitsmaßnahmen
   
   Lege auch eine openapi.yml in diesem Ordner ab.

3. **Backend entwickeln (`/backend`)**  
   * FastAPI‑Projekt **mit**  
     * vollständigem **CRUD** für alle Haupt­entitäten  
     * **Pydantic‑Validierung** – nur Zeichen `[A–Z a–z 0–9]` (`^[A-Za-z0-9]+$`)
     * **Cookie‑Authentifizierung** (`HttpOnly`, SameSite)  
     * **mindestens zwei Rollen**: `user`, `admin` (Admin‑Only‑Routen)  
     * **Passwort‑Hashing** (bcrypt oder argon2)
     * **Persistenz**  
       * Pflicht: JSON‑Datei(en)  
       * Bonus: relationale DB + Prepared Statements  
     * auto‑generierte **OpenAPI** unter `/docs`

4. **Frontend entwickeln (`/frontend`)**  
Das Frontend muss nur funktional sein (freie Wahl in der Umsetzung).

   * **Funktionen:**
      * Login/Logout, CRUD‑Masken
      * **Admin‑Dashboard** (geschützt) mit mind. **einer Aggregat‑Kennzahl** je Haupt­entität

5. **Docker‑Compose bereitstellen**  
   Ein einziger Befehl muss reichen:  

   ```bash
   docker compose up --build
   ```

6. **Dokumentation verfassen (`/docs/documentation.md` oder `.pdf`)**
   * Datenmodell‑Beschreibung (Text oder Diagramm)  
   * Auth‑ & Rollen‑Konzept (Cookie)  
   * Screenshots (v. a. Admin‑Dashboard)  
   * Beschreibung der Regex‑Validierung  
   * Bekannte Einschränkungen
   * Lessons Learned

7. **(Optional) Tests / CI**  
   Pytest, Playwright, GitHub Actions unter `/tests` bzw. `.github/workflows`.

---

## Abgabe

| Punkt                  | Vorgabe |
|------------------------|---------|
| **Format**             | ZIP‑Archiv `matrikelnummer_nachname_vorname_fastapi_project.zip` |
| **Top‑Level‑Struktur** | `/backend` · `/frontend` · `/docs` · `/tests` · `docker-compose.yml` · `README.md` |
| **Startbefehl**        | Prüfer führt **nur** `docker compose up --build` aus – alles muss lauffähig sein. |
| **Frist**              | *TT.MM.JJJJ 23 : 59 Uhr* (Termin folgt) |
| **Versions­verwaltung**| Git empfohlen (nicht bewertet) – ausschlaggebend ist die ZIP. |

---

## Themenvorschläge – inklusive Kurzbeschreibung

* **Book Nook** – persönliches Buchregal (Bücher, Autoren, Genres)  
* **Meal Planner** – Wochenspeiseplan (Rezepte, Zutaten, Tage)  
* **Habit Tracker** – Gewohnheiten und tägliche Einträge  
* **Workout Log** – Trainingsübungen, Sessions, persönliche PRs  
* **Plant Care** – Zimmerpflanzen und Gieß-/Düng-Erinnerungen  
* **Movie Watchlist** – Filme, Bewertungen, „gesehen“-Status  
* **Study Scheduler** – Kurse, Lerneinheiten, Deadlines  
* **Event Buddy** – kleine Event‑App (Events, Teilnehmende, Orte)  
* **Bug Tracker Lite** – Tickets, Labels, Statusübergänge  
* **Volunteer Hours** – Einsätze, Organisationen, Stundenlogs  
* **Recipe Box** – Rezepte mit Schritt-Fotos und Tags  
* **Expense Splitter** – Ausgaben, Personen, Anteile (Basis‑Mathe)  
* **Coffee Journal** – Bohnen, Brüh‑Rezepte, Bewertungen  
* **Pet Health Record** – Haustiere, Impfungen, Tierarzttermine  
* **Language Flashcards** – Karten, Stapel, Lernstatistiken  
* **Reading Challenges** – Leseziele, Fortschritt, Rezensionen  
* **Simple CRM** – Kontakte, Firmen, Interaktionen  
* **Idea Vault** – Ideen, Kategorien, Reifegrad  
* **Inventory Manager Mini** – Gegenstände, Lagerorte, Bestände  
* **Travel Wishlist** – Reiseziele, Notizen, Priorität  
* **Podcast Queue** – Podcasts, Episoden, „gehört“-Status  
* **Art Portfolio** – Werke, Medienarten, Veröffentlichungsdatum  
* **Time‑Off Tracker** – Urlaubsanträge, Genehmigungsstatus  
* **Gift Organizer** – Anlässe, Personen, Geschenk‑Ideen  
* **Recipe Ingredients Shoplist** – verknüpft Rezepte mit Einkaufslisten  
* **Skill Matrix** – Skills, Level, Lernressourcen  
* **Minimal Ticket Shop** – Events, Tickets, Bestellungen (ohne Payment)  
* **Maintenance Log** – Geräte, Wartungen, Kosten  
* **Reading Notes** – Artikel/Bücher und zugehörige Notizen/Zitate  
* **Micro‑Blog** – Posts, Kommentare, Likes (nur Grundfunktionen)  

*Eigene Ideen sind zulässig, solange mind. zwei verknüpfte Entitäten vorhanden sind.*

---

## Bewertungskriterien (100 P Basis + Bonus)

Es sind maximal 100 Punkte erreichbar.

| Kategorie                     | Punkte | Erläuterung |
|-------------------------------|:------:|-------------|
| Backend‑CRUD                  | 18 P   | Voll funktionsfähig, korrekte HTTP‑Status |
| Validierung (Alphanumerik)    |  8 P   | `^[A-Za-z0-9]+$` + 422‑Antwort |
| Cookie‑Authentifizierung      |  8 P   | Login / Session / Logout |
| Autorisierung (User / Admin)  |  8 P   | Rollen‑ & Owner‑Checks |
| Persistenz                    |  8 P JSON&nbsp;/&nbsp;13 P SQL | SQL nur mit Prepared Statements |
| Passwort‑Hashing              |  4 P   | bcrypt / argon2 |
| OpenAPI                       |  4 P   | Endpunkte & Schemas sichtbar |
| Frontend‑Funktionalität       | 10 P   | CRUD + Auth bedienbar |
| Admin‑Dashboard               |  5 P   | Aggregat‑Kennzahlen, geschützt |
| Docker‑Compose Deployment     |  5 P   | One‑Command‑Setup läuft ohne Fehler |
| Code‑Qualität & Struktur      |  7 P   | PEP 8, Modularität, Naming |
| Dokumentation                 | 10 P   | Umfang & Klarheit gem. Vorgabe |
| **Bonus**                     | *+10 P*| ≥ 70 % Tests, CI/CD, Rate‑Limiting, WebSockets … |
