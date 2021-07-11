
/**
 * State represents a real-world 'state' in a Finite State machine
 */
export interface State {
    /* name of the state */
    name: string,
    /* onBeforeEnter will be called before a state can be 'entered' - usually this would be a server call that is used to get a valid state change */
    onBeforeEnter: (previousStateName: string) => Promise<State>,
};

/**
 * Transition represents a possible transition between two States
 */
export interface Transition {
    /* from: the 'name' of the State that this Transistion can be called from */
    from: string,
    /* to: the 'name of the State that this Transition can transition to */
    to: string,
    /* condition: used to check local data first before the State change can be initiated */
    condition: (prevState: State) => boolean
};

/**
 * Instance of an Invalid State, when initiated will always 'reject' a call for transistion
 * used internally
 */
export const InvalidState = {
    name: "InvalidState",
    onBeforeEnter: (prevStateName: string): Promise<State> => new Promise((resolve, reject) => {
            reject(InvalidState);
        })
};

/**
 * Factory function to generate State instances
 * @param name string - 'name' of the State instance to create
 * @param onBeforeEnter Function - callback that returns a Promise - used to check data asynchronously, like on a server
 * @returns new State instance
 */
export function stateFactory(name: string, onBeforeEnter: (previousStateName: string) => Promise<any>): State {
    return {
        name,
        onBeforeEnter
    };
}

/**
 * Factory function to generate Transistion instances
 * @param from string - the 'name' of the State that this Transition is allowed to operate 'from'
 * @param to string - the 'name' of the State that this Transistion is allowed to transition 'to'
 * @param condition Function - must return a boolean - used for check local data before the State is allowed to transition
 * @returns new Transition instance
 */
export function transitionFactory(from: string, to: string, condition: () => boolean = () => true): Transition {
    return {
        from,
        to,
        condition
    };
}

/**
 * Main Machine Class - controls the flow of states
 */
export class Machine {
    states: State[];
    transitions: Transition[];
    currentState: State;
    
    /**
     * constructor
     * @param states State[] - array of states for this State machine instance
     * @param transitions Transition[] - array of transitions for this State machine instance
     */
    constructor(states: State[], transitions: Transition[]){
        this.states = states;
        this.transitions = transitions;
        this.currentState = InvalidState;
    }

    /**
     * Returns current State
     */
    get state(): State {
        return this.currentState;
    }

    /**
     * starts the state machine - defaults to the first available State or InvalidState
     * @param forceStateName string - starting State 'name'
     * @returns State the state specified with forStateName or InvalidState
     */
    start (forceStateName: string = ''): State {
        const newState = forceStateName ? this.states.find(state => state.name === forceStateName) || InvalidState : this.states[0] || InvalidState;
        this.currentState = newState;
        return this.currentState;
    }

    /**
     * check all Transisitons for matching to/from State 'name' - runs the 'onBeforeEnter' callback on the matching State
     * @param newStateName the next State 'name' to transition to
     * @returns Promise that resolves with the next State
     */
    transition (newStateName: string): Promise<State> {
        let newState = InvalidState;
        const foundTranstion = this.transitions.find(transition => transition.from === this.currentState?.name && transition.to === newStateName); 
        if(foundTranstion && foundTranstion.condition(this.currentState)) {
            newState = this.states.find(item => item.name === newStateName) || InvalidState;
        }
        return new Promise<State>((resolve, reject) => {
            newState?.onBeforeEnter(this.currentState.name).then(() => {
                this.currentState = newState;
                resolve(newState);
            }).catch(() => {
                // if the Transition OR the matching State rejects - return 'currentState'
                reject(this.currentState);
            });
        });
    }
};