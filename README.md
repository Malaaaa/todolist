# A todolist APP with Rxjs and React (How RxJS V7 works)

How to quickly get started with a new framework or class library - of course, start with a demo, first will use then to understand the principles and ideas behind. I also read and refer some source code here give you a clear view.

## Conceptual Understanding

Observer subscribe the date from Observable.

Observable support single subscribed and Subject support multiple subscribed.

Scheduler is based on an event loop mechanism and task scheduling, which optimizes the timing of data generation by Observable.

Rxjs is actually a toolset for simplifying data flow operations.

## Observable & Observer

**Observable** is for the consumer, it can be transformed and subscribed. It acccept a `subscribe funtion` which will be given a `Subscriber`(or a Observer). This funtion determind what kind of `next`,`error`,`completion` data will push to consumer and it stored at `_subscribe`. (It will be stored as _subscribe method). we can see `Subscriber` **extends** from `Subscription` and **implements** of `Observer`.

```ts
 class Observable<T> implements Subscribable<T>
```

```ts
  constructor(subscribe?: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }
   protected _subscribe(subscriber: Subscriber<any>): TeardownLogic {
    return this.source?.subscribe(subscriber);
  }
  ...
  export type TeardownLogic = Subscription | Unsubscribable | (() => void) | void;
  class Subscriber<T> extends Subscription implements Observer<T>
```

**Observer** is the consumer, are simply a set of callbacks to handle the value from Observable.

```ts
export interface Observer<T> {
  next: (value: T) => void;     //Observer got a next value.
  error: (err: any) => void;    //Observer got an error
  complete: () => void;         //Observer got a complete notification
}
```

Since we create the **Observable** with a `Subscriber` but there is no actions because this Observable has no observer. It's like the concert won't start if no one buys a ticket.

We can use `subscribe function` invokes an execution of an Observable and registers Observer handlers(3 callbacks) for notifications it will emit. The first argument is `Observer` object or `Next` Callback. All arguments are optional and will be added default handling behavior when it become a real `CustomerObserver`, but without next the subscribetion is useless. When it become the `CustomerObserver` which has all 3 callbacks, it is the time to make it to be a `Subscriber` (which is constructed by `SafeSubscriber`). Then it use `add` method (extends from `Subscription`) to use `_subscribe method` feed data to this `Subscriber`. This `Subscriber` is the return value and have a `unsubscribe` method extends from `Subscription` also. To cancel this an ongoing Observable execution.In officail site this `Subscriber` called **subscription**.

In short, in this case, Observable execution is using inite subscribe funtion excute the observer's callbacks.(observer as argument call the inite fanction)

```ts
const subscriber= observable.subscribe({
    next(x) { console.log('got value ' + x); },
    error(err) { console.error('something wrong occurred: ' + err); },
    complete() { console.log('done'); }
});
subscriber.unsubscribe()
```

We can use a **Subject** which implements both the **Observable** (extends from Observable) and the **Observer** (Internal method next(value: T),  error: (err: any), complete: () those can handle multiple Observers) interfaces. Duck type. It accept multiple Observers and handle them at the same time. It looks like a Observable Observer get feed values from the **Observer Interface**(for example subject.next(1) will feed 1 to subject) and feed values to its Subscribers(Observer).

```ts
class Subject<T> extends Observable<T> implements SubscriptionLike
private currentObservers: Observer<T>[] | null = null;
```

```ts
const source = new Subject();
source.subscribe(x => ...)
source.next('first')
source.next('second')
```

**The benefits of the Observer pattern are obvious.**
Both parties in this pattern can concentrate on one thing and can be combined in any way, meaning that the complex problem is broken down into three smaller problems.
-How to generate events, which is the responsibility of the publisher and in RXJS is the job of the **Observable** object.
-How to respond to events, which is the responsibility of the **Observer** and is determined in RXJS by the subscribe argument.
-What kind of publisher is associated with what kind of observer, i.e. when to call subscribe.

## Operators

Operators are what make RxJS useful. Operators are pure functions that return a new Observable. [click here to see all operators](https://rxjs-dev.firebaseapp.com/guide/operators)

## Cold Observable & Hot Observable

**Cold Observable**: Generates a separate data stream each time, which cannot be shared by multiple Observer, for example the `Observable` object generates a separate date when it is subcribed. Due to `Observable` every `Subsciber` has its own stoping flag.

**Hot Observable**: The data stream generated by an Observable can be subscribed to and shared by multiple Observer. The implementation is multicast.

You can use `Subject` to implement multicast and subscribe to a Subject object when a Hot `Observable` is needed downstream.

Multicast Operators: `multicast` `publish` `share` `publishLast` `publishRelpay` `publishBehavior`.

Three subclasses of Subject: `AsyncSubject` `ReplaySubject` `BehaviorSubject`

Scheduler: control the pacing of pushing data messages in Rxjs data streams to enhance the performance of data stream processing.

 4 performance-enhancing task schedulers: `asapScheduler` `queueScheduler` `asyncScheduler`(setTimeout based)  `animationFrameScheduler`(animationFrame based, This callback function will be executed before the next repaint of the browser)

These four dispatchers can be used as the second parameter of the `Observable` to change the Observable, such as `of`, `from`, `range`, `interval`, etc.

Scheduler-specific Operators: `observeOn` `subscribeOn`.

## Subscription Data Flow

### DOM Event Flow

```tsx
const Component = () => {
    useEffect(() => {
        let subscription = fromEvent(document.body, "click").subscribe((e) => {
            console.log("click", e);
        });
        return () => subscription.unsubscribe();
    }, []);
    return <div>click</div>;
};
export default Component
```

```tsx
// fromEvent return a Observable Object
export function fromEvent<T>(target: HasEventTargetAddRemove<T> | ArrayLike<HasEventTargetAddRemove<T>>, eventName: string): Observable<T>;
```

### Server Notifacion Flow

We use `useObservable` (provided by rxjs-hooks) subscription data stream. It packaged `subscribe` and `unsubscribe` and return a state.

```tsx
const Component = () => {
  const numbers$ = useMemo(() => interval(1000), []);
  const count = useObservable(() => numbers$);
  return <div>{count}</div>;
};
export default Component
```

It requrie a `InputFactory` which is a `Observable` object.

```tsx
export declare type InputFactory<State> = (state$: Observable<State>) => Observable<State>;
export declare function useObservable<State>(inputFactory: InputFactory<State>): State | null;
```

### AJAX Data Flow

## Data Isolation

In development, we usually separate the view and application logic of business components to ensure streamlined and pure components, while facilitating the reuse of logic layers.

