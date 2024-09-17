## Builds sql statements to create tables


## Insomnia calls to test app.* methods:
  - ### GET http://localhost:3000/user  {Gets all users in the database}
 
  - ### GET http://localhost:3000/account/  {Gets all accounts in the database}
   - ### POST http://localhost:3000/user {Adds a user in the database}
      - Body:
      ```json
      {
        "id": "acff03a3-3e1f-4afe-9427-71ef9ef23e70",
        "fName": "Shane",
        "lName": "Blackfoot"
      }
      ```
  - ### POST http://localhost:3000/account/ {Adds an account in the database}
      - Body:
      ```json
      {
      	"id" : "da1e8b99-9e6d-4769-8e7e-d299ca9ca1ab",
      	"balance" : "823000",
      	"type": "Basic"
      }
      ```
    - ### GET http://localhost:3000/user{ID}  {Gets a user by ID from the database} Pass an user ID as a URL parameter
    - ### GET http://localhost:3000/account/{ID}  {Gets an account by ID from the database} Pass an account ID as a URL parameter
    - ### DELETE http://localhost:3000/user{ID}  {Deletes a user by ID from the database} Pass an user ID as a URL parameter
    - ### DELETE http://localhost:3000/account/{ID}  {Deletes an account by ID from the database} Pass an account ID as a URL parameter
## WIP:
  - ### PATCH http://localhost:3000/user/{ID}/edit
      
    
