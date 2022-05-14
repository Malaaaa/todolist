import { useEffect } from 'react';
import { range, filter, map, fromEvent, Subject, Observable, Subscriber, Observer } from 'rxjs';
import { useObservable } from 'rxjs-hooks';

const Component = () => {
    debugger

    const observable = new Observable((subscriber: Observer<number>) => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.next(3);
        setTimeout(() => {
            subscriber.next(4);
            subscriber.complete();
        }, 1000);
    });
    console.log('just before subscribe');
    const subscription = observable.subscribe({
        next(x) { console.log('got value ' + x); },
        error(err) { console.error('something wrong occurred: ' + err); },
        complete() { console.log('done'); }
    });
    subscription.unsubscribe();
    console.log('just after subscribe');

    useEffect(() => {
        let subscription = fromEvent(document.body, "click").subscribe((e) => {
            console.log("click", e);
        });
        return () => subscription.unsubscribe();
    }, []);
    return <div></div>;
};
export default Component