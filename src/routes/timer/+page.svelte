<script lang="ts">
    import { emitTo } from "@tauri-apps/api/event";
    import { audioDir } from "@tauri-apps/api/path";
    import { onMount } from "svelte";
    import {slide} from "svelte/transition"

    onMount(() => {
        console.log("timer page mounted");
    });

    interface Timer {
        hour : number;
        minute : number;
        second : number;
    }

    let set_timer : Timer = $state({
        hour : 0,
        minute : 0,
        second : 0,
    });

    let cur_timer : Timer = $state({
        hour : 0,
        minute : 0,
        second : 0,
    });

    let is_running : boolean = $state(false);
    let is_reset : boolean = $state(true);
    let timer_interval : number | null = $state(null);
    let total_seconds : number = $state(0);
    let remaining_seconds : number = $state(0);
    let timer_text = $derived(`${cur_timer.hour.toString().padStart(2, '0')}:${cur_timer.minute.toString().padStart(2, '0')}:${cur_timer.second.toString().padStart(2, '0')}`)
    let duration :number = 200;

    const circle_radius : number = 90;

    function calculateTotalSeconds(timer: Timer): number {
        return timer.hour * 3600 + timer.minute * 60 + timer.second;
    }

    function startTimer() {
        console.log("startTimer");
        if (cur_timer.hour === 0 && cur_timer.minute === 0 && cur_timer.second === 0) {
            cur_timer = { ...set_timer };
        }
        total_seconds = calculateTotalSeconds(set_timer);
        if (!is_running) {
            is_running = true;
            is_reset = false;
            remaining_seconds = calculateTotalSeconds(cur_timer);
            timer_interval = setInterval(() => {
                if (cur_timer.second > 0) {
                    cur_timer.second--;
                } else if (cur_timer.minute > 0) {
                    cur_timer.minute--;
                    cur_timer.second = 59;
                } else if (cur_timer.hour > 0) {
                    cur_timer.hour--;
                    cur_timer.minute = 59;
                    cur_timer.second = 59;
                } else {
                    stopTimer();
                    is_reset = true;
                    cur_timer = { ...set_timer };
                    // alarm sound play
                    // const audio = new Audio("alarm.mp3");
                    // audio.play();
                    alert("Time's up!");
                    // alarm sound stop
                    // audio.pause();
                }
                remaining_seconds = calculateTotalSeconds(cur_timer);
            }, 1000);
        }
    }

    function stopTimer() {
        console.log("stopTimer");
        if (timer_interval) {
            clearInterval(timer_interval);
            timer_interval = null;
        }
        is_running = false;
        is_reset = false;
    }

    function resetTimer() {
        console.log("resetTimer");
        stopTimer();
        cur_timer = { ...set_timer };
        remaining_seconds = calculateTotalSeconds(cur_timer);
        is_reset = true;
    }

    function increment(type: "hour" | "minute" | "second", step = 1) {
        if(is_running) {
            return;
        }
        let newTimer = { ...set_timer };
        if (type === "hour") {
            newTimer.hour = Math.min(99, newTimer.hour + step);
        } else if (type === "minute") {
            newTimer.minute = Math.min(59, newTimer.minute + step);
        } else {
            newTimer.second = Math.min(59, newTimer.second + step);
        }
        set_timer = {...newTimer};
        if(is_reset){
            cur_timer = {...set_timer};
        }
    }

    function decrement(type: "hour" | "minute" | "second") {
        if(is_running) return;
        let newTimer = { ...set_timer };
        if (type === "hour") {
            newTimer.hour = Math.max(0, newTimer.hour - 1);
        } else if (type === "minute") {
            newTimer.minute = Math.max(0, newTimer.minute - 1);
        } else {
            newTimer.second = Math.max(0, newTimer.second - 1);
        }
        set_timer = {...newTimer};
        if(is_reset){
            cur_timer = {...set_timer};
        }
    }

    function hourchange(e){
        let value = e.target.value;
        if (value < 0) {
            set_timer.hour = 0;
        } else if (value > 60) {
            set_timer.hour = 99;
        } if(e.key == "Enter"){
            set_timer.hour = value;
        }
    }
    function minutechange(e) {
        let value = e.target.value;
        if (value < 0) {
            set_timer.minute = 0;
        } else if (value >= 60) {
            set_timer.minute = 59;
        } else {
            set_timer.minute = value;
        }
    }
    function secondchange(e) {
        let value = e.target.value;
        if (value < 0) {
            set_timer.second = 0;
        } else if (value > 60) {
            set_timer.second = 59;
        } if(e.key == "Enter"){
            set_timer.second = value;
        }
    }
</script>
<div class="timer_container">
    <h1 style="color:white">Timer</h1>
    <div class="timer_display">
        <div class="timer_table">
            {#if is_running}
            <div class="timer_circle" in:slide={{duration : duration}} out:slide={{duration : duration}}>
                <svg class="progress-ring" width="200" height="200">
                    <circle
                        class="progress-ring__circle"
                        stroke="#123456"
                        stroke-width="20"
                        fill="transparent"
                        r = {circle_radius}
                        cx="100"
                        cy="100"
                        style="stroke-dashoffset: {((remaining_seconds / total_seconds) * circle_radius * 2 * Math.PI)}"
                    />
                </svg>
                <div class="timer_text">{timer_text}</div>
                <!-- <span bind{cur_timer.hour.toString().padStart(2, '0')}></span> -->
            </div>
            {:else}
            <div class="timer_inputs" in:slide = {{duration : duration}} out:slide={{duration : duration}}>
                <button class="grid-item" onclick={() => increment("hour")}>🔼</button>
                <button class="grid-item" onclick={() => increment("minute")}>🔼</button>
                <button class="grid-item" onclick={() => increment("second")}>🔼</button>
                <div class="grid-item decimal">
                    <input type="number" class="grid-item decimal" bind:value={set_timer.hour} min="0" max="99"/>
                    <!-- focus out되거나 enter 누르면 입력이 반영. esc 누르면 취소 -->
                </div>
                <div class="grid-item decimal">
                    <input type="number" class="grid-item decimal" bind:value={set_timer.minute} min="0" max="60"
                        onchange={(e)=>{minutechange(e)}}/>
                    <!-- focus out되거나 enter 누르면 입력이 반영. esc 누르면 취소 -->
                </div>
                <div class="grid-item decimal">
                    <input type="number" class="grid-item decimal" bind:value={set_timer.second} min="0" max="60"/>
                    <!-- focus out되거나 enter 누르면 입력이 반영. esc 누르면 취소 -->
                </div>
                <button class="grid-item" onclick={() => decrement("hour")}>🔽</button>
                <button class="grid-item" onclick={() => decrement("minute")}>🔽</button>
                <button class="grid-item" onclick={() => decrement("second")}>🔽</button>
            </div>
            {/if}
        </div>
    </div>
    <div class="timer_controls">
        <button class="timer_button" onclick={stopTimer}>Stop</button>
        <button class="timer_button" onclick={startTimer}>Start</button>
        <button class="timer_button" onclick={resetTimer}>Reset</button>
    </div>
</div>

<style>
    .timer_container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        padding: 10px 20px;
        margin: 0px;

        border-radius: 0.5rem;
        background-color: #110011;
    }
    
    .timer_button {
        background-color: #123456;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
    }
    
    .timer_display {
        width: 100%;
        max-width: 600px;
        margin: 20px 0;
    }

    .timer_table {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: auto auto;
        gap: 20px;
        height: auto;
    }

    .timer_circle {
        position: relative;
        width: 200px;
        height: 200px;
        margin: 0 auto;
    }

    .progress-ring {
        transform: rotate(-90deg);
    }

    .progress-ring__circle {
        transition: stroke-dashoffset 0.35s;
        stroke-dasharray: calc(90 * 2 * pi);
        /* stroke-dashoffset이 좀 거슬리네.. */
    }

    .timer_text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 2rem;
        font-weight: bold;
        color: #123456;
    }

    .timer_inputs {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: 10px;
    }

    .grid-item {
        background-color: #F3AF1E;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        border-radius: 5px;
    }

    .decimal {
        background-color: #123456;
        color: white;
        font-size: 2rem;
        font-weight: bold;
        text-align: center;
        width: 100%;
        height: 100%;
        border: none;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>