
/**
 * State represents a real-world 'state' in a Finite State machine
 */
export interface State {
    /* name of the state */
    name: string,
    fromStates?: string[],
    /* onBeforeEnter will be called before a state can be 'entered' - usually this would be a server call that is used to get a valid state change */
    onBeforeEnter?: (previousStateName: string) => Promise<any>,
    /* onEnter executes once the new state is validated */
    onEnter?: () => void,
    /* onExit executes before the new states onEnter is executed */
    onExit?: () => void,
};

/**
 * 
 */
interface EventsObject {
    onBeforeEnter?: () => Promise<any>,
    onEnter?: () => {},
    onExit?: () => {},
};


export const stateFactory = (name: string, fromStates: string[], events: EventsObject): State => {
    return { name, fromStates, ...events };
};

/**
 * Instance of an Invalid State, when initiated will always 'reject' a call for transistion
 * used internally
 */
export const InvalidState = {
    name: "InvalidState",
    onBeforeEnter: (): Promise<any> => new Promise((_, reject) => {
        reject(InvalidState);
    }),
};


/**
 * Main Machine Class - controls the flow of states
 */
export class Machine {
    name: string;
    states: State[];
    currentState: State;

    /**
     * constructor
     * @param states State[] - array of states for this State machine instance
     */
    constructor(name: string, states: State[] = []) {
        this.name = name;
        this.states = states;
        this.currentState = InvalidState;
    }

    /**
     * Returns current State
     */
    get state(): State {
        return this.currentState;
    }

    /**
     * Adds a new State to the list of available states
     * @param name new State Name
     * @param fromStates array of State names from which this State can transition from 
     * @param events EventsObject that contains optional callbacks
     */
    addState(name: string, fromStates: string[] = [], events: EventsObject = {}): void {
        this.states.push({ name, fromStates, ...events })
    }

    /**
     * starts the state machine - defaults to the first available State or InvalidState
     * @param forceStateName string - starting State 'name'
     * @returns State the state specified with forStateName or InvalidState
     */
    start(forceStateName: string = ''): void {
        const newState = forceStateName ? this.states.find(state => state.name === forceStateName) || InvalidState : this.states[0] || InvalidState;
        this.currentState = newState;
        this.currentState.onEnter?.();
    }

    /**
     * alias for 'transition'
     * @param newState the next State 'name' to transition to
     * @returns Promise
     */
    transitionTo(newState: string): Promise<State> {
        return this.transition(newState);
    }

    /**
     * check all Transisitons for matching to/from State 'name' - runs the 'onBeforeEnter' callback on the matching State
     * if no 'fromStates' are defined, that check will always be ignored
     * @param newStateName the next State 'name' to transition to
     * @returns Promise that resolves with the next State
     */
    transition(newStateName: string): Promise<State> {
        const newState = this.states.find(state => state.name === newStateName && (state.fromStates?.includes(this.state.name) || !state.fromStates?.length))

        if (!newState) {
            return Promise.reject(new Error(`Invalid Transition from ${this.currentState.name} to ${newStateName}`))
        }
        return new Promise<State>((resolve, reject) => {

            // Useful 
            if (newState?.onBeforeEnter) {
                newState?.onBeforeEnter(this.currentState.name)?.then(() => {
                    this.currentState.onExit?.();
                    this.currentState = newState;
                    this.currentState.onEnter?.();
                    resolve(newState);
                }).catch((e) => {
                    // if the Transition OR the matching State rejects - return 'currentState'
                    reject(e);
                });

            } else {
                // just call onEnter/onExit
                try {
                    this.currentState.onExit?.();
                    this.currentState = newState;
                    this.currentState.onEnter?.();
                    resolve(newState);
                } catch (e) {
                    reject(e);
                }
            }
        });
    }
};