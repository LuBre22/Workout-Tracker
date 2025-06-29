# Prüfungsleistung – Workout-Tracker mit fastAPI

## Projektthema

Der Work-Out Tracker soll ein nutzerfreundliches Tool sein, um Workout-Sessions vollständig zu dokumentieren.
Wichtige Anforderungen an das Tracking der Sessions sind dabei:
- sämtliche Übungen, die der Nutzer ausführt, müssen zur Auswahl stehen.
- zu jeder Übung müssen Sets und Reps (= repetitions, also Wiederholungen) notiert werden können.
- eine Session muss aus mehreren Übungen bestehen können.
- jede Session soll archiviert werden.
Desweiteren sollen persönliche Rekorde (= pr) festgestellt werden können.
Bei Nutzern soll zwischen "user" und "admin" unterschieden werden.

## Architektur

Der Code wurde in zwei große Blöcke aufgeteilt, Frontend und Backend:

### Frontend

Das Frontend wurde mit html und javascript geschrieben, wobei es zu jeder html Datei eine zugehörige script Datei gibt anstatt den javascript Code in die html Datei zu integrieren. Diese Trennung dient der Übersicht und Wartbarkeit des Codes. Die Landing-Page ist der Login-Bildschirm, der nach erfolgreicher Anmeldung zum Dashboard weiterleitet. Alle funktionalen Seiten sind dann über das Dashboard miteinander verbunden.

### Backend

Das Backend wurde in Python programmiert und nutzt fastAPI. Es gibt eine Unterteilung der Dateien in "Entities", "UserManagement" und "Utility".
Der Ordner "Entities" beinhaltet sämtliche Klassen in Models.py, die dem Tracking der Sessions dienen, wie z.B. die "ExerciseEntry" Klasse, die eine Übung darstellt oder die "Session" Klasse, die dann (unter anderem) Instanzen der "Exercise" Klasse beinhaltet. CRUD-Implementierung dieser Klassen findet seperate, z.B. in Exercise.py statt. Die derzeitig laufende Session wird dort in Session.json gespeichert und bei Abschluss der Session dann in Sessions.json archiviert.
"UserManagement" regelt Login, Registrierung und das Speichern der registrierten Nutzern der "Users" Klasse in einer csv-Datei. Das Passwort wird dort nur gehasht gespeichert. Dazu wird bcrypt genutzt.
Der "Utility" Ordner enthält nützliche Methoden zum Umgang mit csv oder Cookies.
Die Logik des gesamten Backends wird dann in Main.py im "Backend" Ordner zusammengeführt, wobei die einzelnen Klassen
dort als Router aufgerufen werden. Das Backend wurde also objekt-orientiert aufgebaut.

## Bedienungsanleitung

### Registrierung

Falls der Nutzer noch nicht registriert ist, so kann er dies auf der Login-Seite tun. Es wird zwischen "Admin" und "User" Nutzern unterschieden. Ein User kann nur von einem Admin auf der Admin-Seite ("Manage Users") zu einem Admin erhoben werden. Neu registrierte Nutzer werden standardmäßig nur als "User" gespeichert.
Vorbereitete User (name, password):
    user1,  12345
    admin1, 1234567

### Dashboard

Das Dashboard ist das Herzstück des Workout-Trackers. Eine neue Workout-Session kann über "Start Session" begonnen werden. Alle Übungen, die zur Auswahl stehen sind unter "Exercises" zu finden. Dort können von jedem Nutzer auch neue Übungen angelegt werden. "View Sessions" zeigt alle archivierten Sessions des angemeldeten Users an und die persönlichen Rekorde desselben Nutzers können unter "Personal Records" angezeigt und per Klick aktualisiert werden.
Falls der Nutzer als Admin angemeldet ist, so hat er Zugriff auf "Manage Users". Einem nicht-Admin wird die Option gar nicht erst angezeigt. In diesem Admin-Menü kann der Admin alle registrierten Nutzer einsehen, neue Nutzer erstellen, registrierte Nutzer löschen, ihre Passwörter ändern oder sogar ihre Rollen anpassen. Außerdem werden zwei Aggregat- Kennzahlen zu den registrierten Nutzern und archivierten Sessions angezeigt.

### Neue Übung anlegen

Ein Nutzer kann vom Dashboard auf "Exercises" zugreifen und dort alle angelegten Übungen einsehen. Mit einem Klick auf die Übung werden die vollen Details angezeigt und können durch Klick auf "Update" auch bearbeitet werden. Falls die gewünschte Übung nicht zu finden ist, so kann der Nutzer über "Create New Exercise" eine neue Übung anlegen. Der "Back" Knopf ermöglicht die Rückkehr zum Dashboard.

### Neue Session beginnen

Um eine neue Workout-Session zu beginnen kann der Nutzer vom Dashboard auf "Start Session" zugreifen. Dort wird die aktuell laufende Session des angemeldeten Nutzers angezeigt, falls sie existiert. Falls nicht, so wird "No session loaded" angezeigt. Eine Session wird durch Klick auf "Create New Session" begonnen. Daraufhin muss die Session benannt werden, z.B. "Upper Body". Nach der Benennung wird die Session geladen und angezeigt. Über "Add Exercise" kann eine Übung (aus "Exercises") hinzugefügt werden. Nach Auswahl der Übung kann dann ein Set für die Übung hinzugefügt werden das ein Gewicht und eine Anzahl an Wiederholungen beinhaltet. Ein Set kann jederzeit vor dem Speichern der Session bearbeitet ("Edit" Knopf) oder gelöscht werden ("Delete" Knopf). Wenn die Session abgeschlossen (und archiviert) werden soll, so kann der Nutzer dies mit "Save Session" tun. Eine laufende Session ist gespeichert solange der Nutzer angemeldet ist und wird verworfen, wenn er sich ausloggt.


## Ergriffene Sicherheitsmaßnahmen

Zur Sicherheit des Projekts wurden folgende Maßnahmen ergriffen:
- Passwörter werden nur gehasht gespeichert.
- Session Cookies werden nur auf dem Server gespeichert und überprüft.
- Cookies haben begrenzte Lebenszeit (maxAge = 3600) und werden nach Logout invalidiert.
- Unangemeldete Nutzer haben nur Zugriff auf die Login-Seite.
- Ein nicht-Admin hat keinen Zugriff auf "Manage Users" (selbst über direkten Link nicht).
- User-Inputs werden durch Regular Expressions überprüft.