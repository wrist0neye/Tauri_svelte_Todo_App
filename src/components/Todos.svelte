<!-- <h1>Todos</h1> -->
<script lang="ts">
  import {tick} from 'svelte'

  import type {FiltersType, ITodo} from '$root/types/todo'
  import {useStorage} from '$root/stores/useStorage'

  import AddTodo from './AddTodo.svelte'
  import Todo from './Todo.svelte'
  import TodosLeft from './TodosLeft.svelte'
  import FilterTodos from './FilterTodos.svelte'
  import ClearTodos from "./ClearTodos.svelte"

  // state
  // let todos : ITodo[] = [
  //   { id: '1e4a59703af84', text: 'Todo 1', completed: true },
  //   { id: '9e09bcd7b9349', text: 'Todo 2', completed: false },
  //   { id: '9e4273a51a37c', text: 'Todo 3', completed: false },
  //   { id: '53ae48bf605cc', text: 'Todo 4', completed: false }
  // ]

  // let todos: ITodo[] = JSON.parse(localStorage.getItem('todos')) ?? []
  let todos = useStorage<ITodo[]>('todos', []);

  // $: {
  //   localStorage.setItem('todos', JSON.stringify(todos));
  // }

  let selectedFilter: FiltersType = 'all'
  let filtering = false

  // debug
  $: console.log(todos)

  // computed
  $: todosAmount = $todos.length
  $: incompleteTodos = $todos.filter(todo=> !todo.completed).length
  $: filteredTodos = filterTodos($todos, selectedFilter)
  $: completedTodos = $todos.filter(todo=> todo.completed).length
  $: duration = filtering ? 0 : 250

  $: console.log(duration)
  
  //methods
  function generateRandomId(): string {
    return Math.random().toString(16).slice(2) // 0.xxxx => xxxx
  }

  function addTodo(todo: string): void {
    let newTodo: ITodo = {
      id: generateRandomId(),
      text: todo, 
      completed: false,
    }
    $todos = [...$todos, newTodo]
  }

  function toggleCompleted(event: MouseEvent) : void {
    let {checked} = event.target as HTMLInputElement
    
    $todos = $todos.map(todo => ({
      ...todo,
      completed: checked
    }))
  }

  function completeTodo(id:string): void {
    $todos = $todos.map(todo=> {
      if(todo.id ===id) {
        todo.completed = !todo.completed
      }
      return todo
    })
  }

  function removeTodo(id:string): void {
    $todos = $todos.filter(todo => todo.id !== id)
  }

  function editTodo(id: string, newTodo: string) : void {
    let currentTodo = $todos.findIndex(todo => todo.id === id)
    todos[currentTodo].text = newTodo
  }

  async function setFilter(newFilter: FiltersType) : Promise<void> {
    filtering = true
    await tick()
    selectedFilter = newFilter
    await tick()
    filtering = false
  }

  function filterTodos(todos: ITodo[], filter: FiltersType) : ITodo[] {
    switch(filter) {
      case 'all' :
        return todos
      case 'active' :
        return todos.filter(todo => !todo.completed)
      case 'completed' :
        return todos.filter(todo => todo.completed)
    }
  }

  function clearCompleted() : void {
    $todos = $todos.filter(todo => todo.completed !== true)
    // filterTodos에서 원본 배열값을 덮어 씌운 값.
  }
</script>

<main>
  <h1 class="title">todos</h1>

  <section class="todos">
    <AddTodo {addTodo} {toggleCompleted} {todosAmount}/>
    {#if todosAmount}
    <ul class="todo-list">
      {#each filteredTodos as todo (todo.id)}
        <Todo {todo} {completeTodo} {removeTodo} {editTodo} {duration}/>
        
        {/each}
      </ul>

      <div class="actions">
        <!-- <span class="todo-count">0 left</span> -->
        <TodosLeft {incompleteTodos}/>
        <FilterTodos {selectedFilter} {setFilter}/>
        <!-- <div class="filters">
          <button class="filter">All</button>
          <button class="filter">Active</button>
          <button class="filter">Completed</button>
        </div> -->
        <!-- <button class="clear-completed">Clear completed</button> -->
        <ClearTodos {clearCompleted} {completedTodos}></ClearTodos>
        
      </div>
    {/if}
  </section>
</main>

<style>
  /* Todos */
  main{
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
  }

  .title {
    font-size: var(--font-80);
    font-weight: inherit;
    text-align: center;
    color: var(--color-title);
  }

  .todos {
    --width: 500px;
    --todos-bg: hsl(0 0% 98%);
    --todos-text: hsl(220 20% 14%);

    width: var(--width);
    color: var(--todos-text);
    background-color: var(--todos-bg);
    border-radius: var(--radius-base);
    border: 1px solid var(--color-gray-90);
    box-shadow: 0 0 4px var(--shadow-1);
  }

  .todo-list {
    list-style: none;
  }

  .actions {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-8) var(--spacing-16);
    font-size: 0.9rem;
    border-top: 1px solid var(--color-gray-90);
  }

  .actions:before {
    content: '';
    height: 40px;
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    box-shadow: 0 1px 1px hsla(0, 0%, 0%, 0.2), 0 8px 0 -3px hsl(0, 0%, 96%),
      0 9px 1px -3px hsla(0, 0%, 0%, 0.2), 0 16px 0 -6px hsl(0, 0%, 96%),
      0 17px 2px -6px hsla(0, 0%, 0%, 0.2);
    z-index: -1;
  }
</style>
