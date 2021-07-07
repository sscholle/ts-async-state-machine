const { Machine, stateFactory, transitionFactory } = require('ts-async-state-machine');

// Declare states
const states = [];
states.push(stateFactory('off', (prevState) => new Promise((resolve) => {
    // turning off generally has no prerequisites...
    resolve();
})));
states.push(stateFactory('on', (prevState) => new Promise(resolve => {
    // maybe check if the Microware has power?
    resolve();
})));
states.push(stateFactory('running', (prevState) => new Promise(resolve => {
    // as your complex set of pre-requisites or conditions to allow the state to transition
    resolve();
})));

// Declare your transitions
const transitions = [];
transitions.push(transitionFactory('off', 'on'));
transitions.push(transitionFactory('on', 'running'));
transitions.push(transitionFactory('running', 'off'));

// Create your Machine
const MicrowaveMachine = new Machine(states, transitions);

// Initialise into your required starting state
MicrowaveMachine.start('off');

// Works
setTimeout(() => {
    MicrowaveMachine.transition('on').then(newState => {
        console.log('Entered State', newState.name)
    });
}, 1000);

// Works
setTimeout(() => {
    MicrowaveMachine.transition('running').then(newState => {
        console.log('Entered State', newState.name)
    });
}, 2000);

// Works
setTimeout(() => {
    MicrowaveMachine.transition('off').then(newState => {
        console.log('Entered State', newState.name)
    });
}, 3000);

// Fails
setTimeout(() => {
    // this will trigger a rejection as there is no transistion from 'off' to running
    MicrowaveMachine.transition('running').then(newState => {
        console.log('Entered State', newState.name)
    }).catch(reason => {
        // will log this message
        console.log('Failed Transition', reason)
    });
}, 4000);

