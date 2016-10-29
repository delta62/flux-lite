[![Build Status](https://travis-ci.org/delta62/flux-lite.svg?branch=master)](https://travis-ci.org/delta62/flux-lite)
[![npm version](https://badge.fury.io/js/flux-lite.svg)](https://badge.fury.io/js/flux-lite)

# flux-lite
This is a simplistic implementation of the flux pattern based off of [Facebook's own implementation](https://github.com/facebook/flux). This project aims to provide a simple, lightweight, and unopinionated interface that works well with asynchronous tasks.

This project was written in TypeScript, so no additional definitions are necessary if that's what you're using too. Of course, everything still works great with vanilla JavaScript.

# API

## Dispatcher
The dispatcher handles routing of actions to stores. Constructs that create actions send the actions via the `dispatch` method, while stores subscribe to actions using the `register` and `unregister` methods.

### dispatch(payload)
Dispatch a new action to all stores that have `register`ed. Every store will be invoked with the action. It's up to you to decide how actions are structured, but usually each action has a `type` property to identify what's going on.

``` js
dispatcher.dispatch({
  type: 'cartItemAdded',
  itemName: 'boglin'
});
```

### register(callback)
Register a new callback with the dispatcher. The callback will be invoked every time that an action is dispatched. Returns a dispatch token which can be used to unregister the callback later.

### unregister(token)
Unregister a callback from the dispatcher, unsubscribing from all actions that are dispatched. This function takes as input the token that was returned from `register`.

### waitFor([ tokens, ... ], action)
This function is invoked by stores during the dispatch process. `waitFor` waits for other stores to update before proceeding with the current one. Pass the tokens for each store that should update before this one in addition to the action that is currently being processed.

## FluxStore
This is an abstract class that you should extend to create stores of your own. Typical implementations will need to override `areEqual`, `getInitialState`, and `reduce`.

### getInitialState() [REQUIRED]
Override this function to return the initial state of the store. This is typically an empty array, object, etc.

``` js
class ShoppingCartStore extends FluxReduceStore {
  // ...
  
  getInitialState() {
    return [ ];
  }
  
  // ...
}
```

### reduce(state, action) [REQUIRED]
Override this function to tell `flux-lite` how to update your stores. Reduce takes the current state of the store as well as an action and returns a promise resolving to what the new state of the store should be. Simply resolve to `state` to ignore the action, or perform some calculations and return a new state object.

``` js
class ShoppingCartStore extends FluxReduceStore {
  // ...
  
  reduce(state, action) {
    switch (action.type) {
      case 'cartItemAdded':
        return Promise.resolve(state.slice().push({ name: action.itemName }));
      case 'cartItemRemoved':
        let itemIndex = state.indexOf(action.item);
        let stateCopy = state.slice().splice(itemIndex, 1);
        return Promise.resolve(stateCopy);
      default:
        return Promise.resolve(state);
    }
  }
  
  // ...
}
```

### areEqual(x, y)
This is how the store determines if two states are equivilent. By default `areEqual` does a reference compare (`===`), but it can be overridden for custom equality checking logic.

``` javascript
class ShoppingCartStore extends FluxReduceStore {
  // ...
  
  areEqual(x, y) {
    return x.name === y.name;
  }
  
  // ...
}
```

### state
Get the current state of the store. Consumers of the store can access the full state of the store through this method, although you may want to provide more specialized methods that expose only needed data as well.

### dispatcher
Get a reference to the dispatcher that this store was registered with

### dispatchToken
Get the dispatch token given to this store when it registered with the dispatcher

### addListener(callback)
Registers a callback with the store that will be invoked every time the store changes. No parameters are passed to the callback. If you need to know about the state of the store, query it directly from the callback.
