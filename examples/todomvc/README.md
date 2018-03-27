### TodoMVC Example

To see it in action:
1. clone the repo
2. `npm install`
3. `npm start`
4. open `localhost:3000`

You will see classic todomvc app that uses Backbone collection for data handling, Backbone Router for URIs and React + Redux for UI.

All data synchronisation between backbone collection and redux tree is happenning because of `backbone-redux`: see `index.js` as a starting point.
