[![Build Status](https://travis-ci.org/delta62/flux-lite.svg?branch=master)](https://travis-ci.org/delta62/flux-lite)
[![npm version](https://badge.fury.io/js/flux-lite.svg)](https://badge.fury.io/js/flux-lite)

# flux-lite
This is a simplistic implementation of the flux pattern based off of [Facebook's own implementation](https://github.com/facebook/flux). This project aims to provide a simple, lightweight, and unopinionated interface.

This project was written in TypeScript, so no additional definitions are necessary if that's what you're using too. Of course, everything still works great with vanilla JavaScript.

# API

## Dispatcher
The dispatcher handles routing of actions to stores. Constructs that create actions send the actions via the `dispatch` method, while stores subscribe to actions using the `register` and `unregister methods.

### dispatch(action)
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

### waitFor([ tokens, ... ])
This function is invoked by stores during the dispatch process. `waitFor` waits for other stores to update before proceeding with the current one. Pass the tokens for each store that should update before this one.

### isDispatching()
Determine whether or not an action is currently being dispatched.

## FluxReduceStore
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
Override this function to tell `flux-lite` how to update your stores. Reduce takes the current state of the store as well as an action and returns what the new state of the store should be. Simply return `state` to ignore the action, or perform some calculations and return a new state object.

``` js
class ShoppingCartStore extends FluxReduceStore {
  // ...
  
  reduce(state, action) {
    switch (action.type) {
      case 'cartItemAdded':
        return state.slice().push({ name: action.itemName });
      case 'cartItemRemoved':
        let itemIndex = state.indexOf(action.item);
        return state.slice().splice(itemIndex, 1);
    }
  }
  
  // ...
}
```

### getState()
Get the current state of the store. Consumers of the store can access the full state of the store through this method, although you may want to provide more specialized methods that expose only needed data as well.

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

## FluxStore
This is the low-level flux store implementation. You typically will not need to use this class directly. If you need to do something fancy, this store can be extended for custom store logic.
