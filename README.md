## Running the code:
```
npm install express
cd challenge
npm install .
DEBUG=challenge:* npm start
```
then put your zip code and dollar amount into the field given.

### What did you want to do but were unable to because you ran out of time?
I wanted to customize an implementation of the knapsack problem to provide the correct optimal solution. in O(n * price) time using dynamic programming. I also wanted to make a table view in HTML using pug, with pretty pictures and links.

### If you were given another 2 days what would you change?
I would refactor bang-for-buck.js and break it up into smaller pieces. One file would have to do with getting a list of retailers, another to do with getting a list of products, and another one to select the quantity and variety of items.

If this code is to be production ready, there would have to be input validation from both client and server side, and helpful error messages to guide the user into something else useful for them. The error cases were not handled properly, such as no nearby stores, or out of product, or not enough money, etc. Handling errors like that will be really considerate to the end user. 

I will write tests with various mock inputs to handle edge cases. Each promise block will be wrapped in a test.

I would also spend some time getting feedback from others on how I can improve my code, so that I wouldn't need as much help the next time comes around.


### How would you have approached the problem differently if you were to do it again?

I would have spent less time on refactoring, and try to make it work first. The code is neat, but it doesn't perform very well. That balance has to sway towards code function away from code form. I would also start using promises right away, instead of trying to reduce dependencies by not using promises. I couldn't figure out how to query for pre-rolled joints, so I should have asked some questions.
