const { Machine } = require("../lib");

// Traffic Lights that pre-empt the states (and then update the server to 'follow')
// this means that the Client is Stateful (and the server merely 'saves' the state change request)

// Dummy Server API
const server = {
    request: (state) => {
        return new Promise((res, rej) => {
            setTimeout(() => {
                res();
            }, 1000);
        })
    }
};

// The Traffic Lights use the StateMachine to intelligently determine what is allowed and how to behave in state changes
class PreEmptiveTrafficLights {
    stateMachine;
    timerRef;
    constructor(){
        this.stateMachine = new Machine('TrafficLights');
        this.stateMachine.addState('red', ['orange'], {
            onBeforeEnter: () => server.request('red'),
            onEnter: () => this.countDownToStateChange('green')
        });
        this.stateMachine.addState('green', ['red'], {
            onBeforeEnter: () => server.request('green'),
            onEnter: () => this.countDownToStateChange('orange')
        });
        this.stateMachine.addState('orange', ['green'], {
            onBeforeEnter: () => server.request('orange'),
            onEnter: () => this.countDownToStateChange('red')
        });
        this.stateMachine.start('red');
    }

    countDownToStateChange(nextState, delay = 5000){
        this.timerRef = setTimeout(() => this.stateMachine.transitionTo(nextState), delay) ;
    }

    requestStop() {
        return this.stateMachine.transitionTo('orange');
    }
}

/**
 * Test Code Description
 * 1. Setup a Traffic Lights class
 * 2. Try requesting the lights to change twice
 * 3. the first attempt will fail as it requires 'green' state to be active first
 * 4. the second attempt will pass as the states have changed through the timers
 */
const trafficLights = new PreEmptiveTrafficLights();

setTimeout(() => {
    console.log('current state', trafficLights.stateMachine.state.name)
    trafficLights.requestStop().then((result) => {
        console.log('cars are stopping', result)
    }).catch((error) => {
        // Expected Caught Error
        console.log('has no effect', error)
    });
}, 6000);

setTimeout(() => {
    console.log('current state', trafficLights.stateMachine.state.name)
    trafficLights.requestStop().then((result) => {
        console.log('cars are stopping', result);
        // if our timing is right - this should get triggered!
        process.exit(); // EXIT NODE

    }).catch((error) => {
        console.log('has no effect', error)
    });
}, 11000);
