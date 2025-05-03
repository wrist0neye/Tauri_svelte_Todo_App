<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";

  // let name = $state("");
  // let greetMsg = $state("");

  // async function greet(event: Event) {
  //   event.preventDefault();
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   greetMsg = await invoke("greet", { name });
  // }
  import '$root/styles/global.css'
  import Todos from '$root/components/Todos.svelte'
</script>

<!-- <h1>Hello, World! 👍</h1> -->
<Todos></Todos>

<style>
  global:body{
    width:100%;
    height:100%;
  }
</style>