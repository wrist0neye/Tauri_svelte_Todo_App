<script lang="ts"> 
    // interface Docs {
    //     id: string;
    //     name : string;
    //     content : string;
    // }
    import type {Docs} from "$root/types/todo"

    ;
    // let tabs = ["Untitled-1"];

    let doc_collection : Docs[] = $state([
        {
            "id" : "initial",
            "name" : "Untitled-1",
            "content" : "",
            "prev_stack" : null
        }
    ])

    let selected_id : string = $state("initial");
    let selected_docs : Docs = $derived.by( () => {
        let doc = doc_collection.find(doc => doc.id === selected_id) || doc_collection[0];
        return doc;
    });

    let cnt = 1;

    function delete_target(doc : Docs) {
        let target_index = doc_collection.indexOf(doc);
        if(doc_collection.length <= 1) {}
        else if(target_index === doc_collection.length-1) {
            select_tab(doc_collection[target_index-1]);
        } else {
            select_tab(doc_collection[target_index+1]);
        }
        doc_collection = doc_collection.filter(docs => docs.id !== doc.id)
        console.log(`delete executed : ${doc.id}, last : ${doc_collection}`)
        
        if(doc_collection.length === 0) {
            add_page();
            // selected_docs = doc_collection[0];
            selected_id = 0;
        }
    }

    function add_page() {
        // 현재 시간을 id로 설정할ㄱ ㅓ
        cnt += 1;
        let new_doc : Docs = {
            id : `${Date.now()}`,
            name : `Untitle-${cnt}`,
            content : "",
            prev_stack : null
        } 
        doc_collection = [...doc_collection, new_doc]
        selected_id = new_doc.id;
    }

    function select_tab(doc: Docs) {
        selected_id = doc.id;
    }

    function save_file () {
        /** 파일 저장 기능 구현*/
    }

    function get_cursor_position () {
        /** cursor position 확인*/
    }

    function undo() {
        
    }
    
    function redo() {
        
    }

    function search() {

    }

    function replace_string() {

    }

    // llama API call or gemini call

    ////// TEST 잰히 ㅕ하
    
</script>

<div class="app_container">
    <div class="app_header">
        {#each doc_collection as tab}
            <div id = {tab.id} class="tab_title {selected_docs.id === tab.id ? 'selected' : ''} text_drag_block" 
                on:click={()=>select_tab(tab)}>
                {tab.name}
                <div class="delete_btn" on:click={(e)=>delete_target(tab)}>x</div>
            </div>
        {/each}
        <div class="add_btn" on:click={e=>add_page()}>+</div>  
    </div>
    <div class="app_body">
        <!-- textarea 별로 아이디 설정할 것 -->
        <!-- 여기 text area bind 하는 방법 확인해야 함. -->
        <textarea name="note" id="note-1" class = "mainbody" bind:value={selected_docs.content} contenteditable></textarea> 
    </div>
    <div class="app_footer text_drag_block">
        <p>{selected_docs.content.length}</p>
        <p style="color:white;">id : {selected_docs.id}</p>
    </div>
</div>

<style>
    /* min-width, max-width 없이 작성할 것 */
    /* @media 추가하여 플랫폼별 보이는 화면 다르게 할 것 */
    .app_container{
        position: relative;
        display:flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;

        /* width: 100%; */
        /* height: calc(100% - 40px);  */
        width: 480px;
        height: 600px;
        border: 1px dahsed gray;
        padding : 0;
    }
    
    .app_header {
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
        
        width: 100%;
        height: 1.2rem;
    }

    .tab_title{
        display: flex;;

        width: fit-content;
        max-width: 80px;
        min-width: 10px;
        height: 1.1rem;

        overflow-x : hidden;
        text-wrap: nowrap;
        flex-wrap: nowrap;

        color : white;
        background-color: #88888888;
        cursor : pointer;

        transition : all 0.2s;
    }

    .tab_title:hover {
        background-color: #444444;
    }
    
    .tab_title:active{
        background-color: transparent;
    }

    .delete_btn {
        width:0.8rem;
        height:0.8rem;
        font-size : 0.8rem;

        background-color: cyan;
    }

    .delete_btn:hover{
        cursor:pointer;

    }
    .delete_btn:active {

    }

    .add_btn{
        width: 1.1rem;
        height: 1.1rem;
        font-size: 1.0rem;

        background-color: orange;
    }

    .add_btn:hover{
        cursor: pointer;
    }
    
    .add_btn:active{

    }

    .selected {
        min-width: 80px;
        background-color: blue;
    }

    .app_body {
        position: relative;
        flex : 1;

        width: 100%;
        
    }

    .mainbody {
        width:100%;
        height:100%;
        padding: 2px;

        color: #ccc;
        background-color: #202020;
        /* font-family: ; */
    }
    
    .app_footer{
        width: 100%;
        height: 1rem;
        
        background-color: #898989;
    }

    .text_drag_block{
        -ms-user-select: none; 
        -moz-user-select: -moz-none;
        -khtml-user-select: none;
        -webkit-user-select: none;
        user-select: none;
    }
</style>