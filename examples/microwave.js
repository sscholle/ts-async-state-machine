const { Machine } = require('../lib');

// [very] Simple use Case for a Microwave State machine implementation

// Dummy Server API
const server = {
    request: (state) => {
        return new Promise((res, rej) => {
            setTimeout(() => {
                // lets pretend that the server takes 1sec to respond with a 200 OK status
                res();
            }, 1000);
        })
    }
};

// Create your Machine
const MicrowaveMachine = new Machine('Microwave');

// Add States
MicrowaveMachine.addState('off', ['running'], {
    onBeforeEnter: (prevState) => new Promise((resolve, rejection) => {
        server.request('off').then(() => {
            resolve();// resolves the state transition - changes 'MicrowaveMachine's state to 'off'
        }).catch(err => {
            rejection(err);// ensures the transition is rejected internally
        });
    })
});
MicrowaveMachine.addState('on', ['off'], {
    onBeforeEnter: (prevState) => new Promise(resolve => {
        server.request('on').then(() => {
            resolve();
        }).catch(err => {
            rejection(err);
        });
    })
});
MicrowaveMachine.addState('running', ['on'], {
    onBeforeEnter: (prevState) => new Promise(resolve => {
        server.request('running').then(() => {
            resolve();
        }).catch(err => {
            rejection(err);
        });
    })
});

// Initialise into your required starting state
MicrowaveMachine.start('off');

// Start Triggering State changes
setTimeout(() => {
    MicrowaveMachine.transition('on').then(newState => {
        // Works
        console.log('Entered State', newState.name)
    }); // omitted 'catch' for brevity
}, 1000);

setTimeout(() => {
    MicrowaveMachine.transition('running').then(newState => {
        // Works
        console.log('Entered State', newState.name)
    }); // omitted 'catch' for brevity
}, 3000);

setTimeout(() => {
    MicrowaveMachine.transition('off').then(newState => {
        // Works
        console.log('Entered State', newState.name)
    });
}, 5000);

// this will trigger a rejection as there is no transistion from 'off' to running
setTimeout(() => {
    MicrowaveMachine.transition('running').then(newState => {
        console.log('Entered State', newState.name)
    }).catch(reason => {
        // Fails
        // will log this message
        console.log('Failed Transition', reason)
    });
}, 7000);

