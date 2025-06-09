// Example session data structure for API requests/responses:
/*
{
  "id": "string",           // Unique session identifier
  "username": "string",     // Username of the session owner
  "name": "string",         // Name/title of the session
  "exercises": [
    {
      "name": "string",     // Name of the exercise
      "sets": [
        {
          "setNumber": 1,   // Set number (integer)
          "reps": 10,       // Number of repetitions
          "weight": 50.0    // Weight used for this set
        }
        // ... more sets
      ]
    }
    // ... more exercises
  ]
}
*/