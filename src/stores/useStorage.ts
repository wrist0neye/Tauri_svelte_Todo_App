import { writable } from "svelte/store";
import type {Writable} from 'svelte/store'

export function useStorage<Value>(key : string, initialValue: Value) : Writable<Value> {
    let serialize = JSON.stringify
    let deserialize = JSON.parse
    
    // get stored value
    // https://velog.io/@developerjhp/TypeScript에서-localstorage-불러올때-Type-null-is-not-assignable-to-type-string
    // typescript에서는 string | null type 할당될 수 없다고 해서 아래와 같이 수정한다.
    let storedValue : Value = deserialize(localStorage.getItem(key || '{}'))

    let store = writable(storedValue ? storedValue : initialValue)
    store.subscribe(value => localStorage.setItem(key, serialize(value)));
    
    return store
}