<!-- https://www.codelantis.com/blog/sveltekit-monaco-editor -->
<script lang="ts">
    import { invoke } from "@tauri-apps/api/core";
    // import {Command} from "@tauri-apps/plugin-shell";
    import {onDestroy, onMount} from "svelte";
    import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";

    let editor : Monaco.editor.IStandaloneCodeEditor;
    let monaco : typeof Monaco;
    let editorContainer: HTMLElement;
    let console_: HTMLElement;// = $state();

    let code_run = () => {
        console.log('Run code');
        // const code = editor.getValue(); // 이 코드 실행이 안 된다..
        // console.log = (log) => {
        //     console_.innerHTML += log + '<br>';
        // }
        const code = document.getElementsByClassName('monaco-editor')[0].innerText;
        eval(code);
    }

    onMount(async ()=> {
        // editor = monaco.editor.create(editorContainer, {
        //     value: "console.log('Hello, World!')",
        //     language: "javascript",
        //     theme: "vs-dark",
        //     automaticLayout: true
        // });
        monaco = (await import('./monaco')).default;

        const editor = monaco.editor.create(editorContainer, {
            theme: 'vs-dark'
        });
        const model = monaco.editor.createModel(
            `console.log('Hello, World!')`,
            'javascript'
        );
        editor.setModel(model);
    });

    onDestroy(() => {
        monaco?.editor.getModels().forEach(model => model.dispose());
        editor?.dispose();
    })

    // 실행이 안 됨..
    // export let code;
    // 
    // $: if(editor) editor.setValue(code);

</script>

<div class="editor_container">
    <div class="editor_titlebar">
        <h1 class="editor_title">| Code Editor</h1>
        <button
            class="editor_run_button"
            on:click={code_run}>
            ▶ Run Code
        </button>
    </div>
    
    <div 
        class="temporary_editor"
        bind:this={editorContainer}>
    </div>

    <div class="editor_console_log">
        <span id="console_execute" bind:this={console_}></span>
    </div>
</div>


<style>
    :root {
        color : white;
    }
    .editor_container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border-radius: 0.2rem;
        
        border: 1px solid #888888a0;
        box-shadow: 0 0 5px rgba(0,0,0,0.5);
        padding: 1rem;
    }
    .editor_titlebar {
        width: 100%;
        display:flex;
        justify-content: space-between;
        align-items: center;
    }
    .editor_title {
        font-size: 1.5rem;
        /* margin-left: 1rem; */
        color:white;
    }
    .temporary_editor {
        width: 100%;
        height: 80%;
        min-width:600px;
        min-height:320px;
        margin-top : 1 rem;
    }
    .editor_run_button{
        background-color: #257317;
        padding : 0.5rem 1rem;
        margin-bottom: 0.5rem;
        color:white;
        font-weight: bold;
        border-radius: 0.2rem;
        box-shadow: 0 0 5px rgba(0,0,0,0.5);
    }

    .editor_run_button:hover {
        background-color: #1e5f1e;
    }

    .editor_run_button:active {
        background-color: #1a4b1a;
    }

    .editor_console_log {
        width: 100%;
        height: 20%;
        min-height: 80px;
        background-color: #888888;
    }

    .monaco-editor {
        width: 100%;
        height: 100%;
    }
</style>

