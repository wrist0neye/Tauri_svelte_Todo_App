<script lang="ts">
    let code = '';
    let output ='';

    const updateCode = ({
        currentTarget,
    }: Event) => {
        const {
            innerText,
        } = currentTarget as HTMLDivElement;
        code = innerText;
    };

    $: codeLines = code
        .replace(
            /(\<\/[a-z]+\>\<[a-z]+\<|\<[a-z]+\>|\<\/[a-z]+\>)/g, // 무슨 정규식이냐
            '\n'
        ).split('\n');
    $: cleanCode = codeLines.join('\n');

    const run = () => {
        try {
            output = eval(cleanCode);
        } catch(e) {
            output = e;
        }
        
    };

    const handleHotkeys = (
        e: KeyboardEvent
    ) => {
        switch(e.key) {
            case 'Tab' : {
                e.preventDefault();
                e.stopPropagation();
                if (window.getSelection) {
                    const selection = window.getSelection();
                    if (
                        selection&&
                        selection.getRangeAt &&
                        selection.rangeCount
                    ) {
                        const range = selection.getRangeAt(
                            0
                        );
                        range.deleteContents();
                        range.insertNode(
                            document.createTextNode(
                                '   '
                            )
                        );
                        range.collapse();
                    }
                }
                break;
            }

            case 'Enter' : {
                if(!e.ctrlKey) break;
                run();
            }

            default : {
                //no-op
            }
        }
    }
</script>

<header class="app-bar">
    <button
        on:click={run} 
        class="button-run">Run Code</button>
</header>
<div class="container">
    <div 
        class="editor"
        contenteditable
        on:input={updateCode}
        on:keydown={handleHotkeys}
    >
        Type your Javascript here...
    </div>
    <div class="console">
        {output}
    </div>
</div>

<style>
    .app-bar{
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .button-run{
        height: 40px;
        border: none;
        opacity: 0.8;
        color: white;
        appearance: none;
        border-radius: 20px;
        background: #008800;
    }

    .button-run:hover {
        opacity: 1;
    }

    .container {
        width:100vw;
        height:400px;
        background-color: #fff;
    }
    .editor{
        width: 100%;
        height:100%;
    }
    .console {
        widht:100%;
        height:100%;
        background-color: gray;
    }
</style>