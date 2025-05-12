<script lang="ts">
    import {fade} from "svelte/transition";
    let {children} = $props();
    let showSetting = $state(false);

    function handleSettingButtonClick(){
        // alert("setting button clicked");
        showSetting = !showSetting;
    }

    function handleSettingMenuClick(e: MouseEvent){
        e.stopPropagation();
        if(e.target === e.currentTarget){
            showSetting = false;
        }
    }

    function handleSettingMenuKeyDown(e: KeyboardEvent){
        if(e.key === "Escape"){
            showSetting = false;
        }
    }
</script>

<nav>
    <a href="/">Todo</a>
    <a href="/code">🍎Note</a>
    <a href="/webGPU">🍐GL test</a>
    <a href="/fritzing">🍊diagram</a>
    <a href="/memo">🍋memo</a>
    <a href="/calendar">🍋‍🟩calendar</a>
    <a href="/icon_space">🍌pureref</a>
    <a href="/timer">🍉timer</a>
</nav>

<button id="setting_button" onclick={handleSettingButtonClick}>⚙️</button>

<!-- <slot></slot> -->
{@render children()}

{#if showSetting}
    <div class="setting_background"
        onclick={handleSettingMenuClick}
        onkeydown={handleSettingMenuKeyDown}
        in:fade={{duration: 200}} out:fade={{duration: 200}}>
        <div
            id="setting_menu"
            role="presentation">
            <h1>Setting</h1>
        </div>
    </div>
{/if}


<style>
    #setting_button{
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1000;
        background-color: #000;
        color: #fff;
        border: none;
        padding: 5px;
        border-radius: 5px;
    }
    #setting_button:hover{
        background-color: #333;
    }
    #setting_button:active{
        background-color: #666;
    }

    .setting_background{
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 999;
        backdrop-filter: blur(10px);
        transition: opacity 0.2s ease;
        transition-delay: 0.1s;
    }

    #setting_menu{
        position: absolute;
        background-color: ivory;
        border: transparent;
        border-radius: 10px;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
        padding: 10px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: start;
        width: 60vw;
        height: 80vh;
        top: calc(50% - min(40vh, 400px));
        left: calc(50% - min(30vw, 300px));
        max-width: 600px;
        max-height: 800px;
    }
</style>