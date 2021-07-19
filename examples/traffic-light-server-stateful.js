const { Machine } = require("../lib");

// TrafficLights that are server controlled

// Stateful Dummy Server API
class ServerControl {
    state='red';
    getNextState(){
        switch(this.state){
            case 'red':
                return 'green';
            case 'green':
                return 'orange';
            case 'orange':
                return 'red';
        }
    };
    requestStop(){
        return new Promise((res, rej) => {
            setTimeout(() => {
                if(this.state === 'green') {
                    this.state = this.getNextState();
                    res(this.state);
                } else {
                    rej('can only transition from "green"');
                }
            }, 100);
        })
    }
    request(){
        return new Promise((res, rej) => {
            setTimeout(() => {
                this.state = this.getNextState();
                res(this.state);
            }, 100);
        })
    }
    getInitalState(){
        return new Promise((res, rej) => {
            setTimeout(() => {
                res(this.state);
            }, 100);
        })
    }
}

const serverControlService = new ServerControl();

// Example Client Implementation
class ServerTrafficLights {
    stateMachine;
    timerRef;
    constructor(){
        this.stateMachine = new Machine('TrafficLights');
        // we can leave out 'fromState' names blank as the server handles the transitions
        // we really only need to handle the new state's callback (onEnter)
        this.stateMachine.addState('red', [], {
            onEnter: () => this.countDownGetNextState()
        });
        this.stateMachine.addState('green', [], {
            onEnter: () => this.countDownGetNextState()
        });
        this.stateMachine.addState('orange', [], {
            onEnter: () => this.countDownGetNextState()
        });
    }

    initalise() {
        serverControlService.getInitalState()
        .then(state => {
            console.log('init to', state)
            this.stateMachine.start(state);
        })
        .catch(err => console.log('initial state failed', err));
    }

    getNextState() {
        console.log('requesting new state from:', this.stateMachine.state.name);
        serverControlService.request()
        .then(newState => {
            console.log('server responded with new state:', newState);
            this.stateMachine.transitionTo(newState)
            .catch(err => console.log('transition failed', err))
        })
        .catch(err => console.log('server request failed', err))
    }

    countDownGetNextState(delay = 1000){
        this.timerRef = setTimeout(() => this.getNextState(), delay) ;
    }

    requestStop() {
        clearTimeout(this.timerRef);
        return serverControlService.requestStop()
        .then((newState) => {
            this.stateMachine.transitionTo(newState).catch(err => console.log('transition to failed', err))
            return newState;
        })
    }
}

const serverTrafficLights = new ServerTrafficLights();
serverTrafficLights.initalise();

setTimeout(() => {
    serverTrafficLights.requestStop()
    .then((result) => {
        console.log('cars are stopping', result)
    })
    .catch((error) => {
        console.log('has no effect', error)
    });
}, 5100);

setTimeout(() => {
    serverTrafficLights.requestStop()
    .then((result) => {
        console.log('cars are stopping', result)
    })
    .catch((error) => {
        console.log('has no effect', error)
        process.exit();// if our timing is right - this should get triggered
    });
}, 10000);

