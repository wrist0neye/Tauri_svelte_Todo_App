<script lang="ts">
  import WidgetContainer from "$root/components/dock/widgetcontainer.svelte"
  import Todos from "$root/components/Todos.svelte";

  interface widget {
    id: number;
    xpos : number;
    ypos : number;
    width : number;
    height: number;
    widget : string;
    isSelected : boolean;
  }
  
  let widget_list : widget[] = $state([]);
  let nextId = 1;

  let dragState = $state({
    widget: null,
    offset : {x: 0, y:0},
    isDragging: false,
  })

  function addWidget() {
    let newWidget : widget = {
      id: nextId++,
      xpos : 40,
      ypos : 40,
      width : 720,
      height: 600,
      widget: "./",
      isSelected: false
    }
    widget_list = [...widget_list, newWidget]
  }

  function startDrag(event: MouseEvent, widget: Widget) {
    // 클릭한 위젯을 선택 상태로 만들기
    widget_list = widget_list.map(w => ({
      ...w,
      isSelected: w.id === widget.id
    }));

    dragState.widget = widget;
    dragState.isDragging = true;
    
    // 마우스 위치와 위젯의 현재 위치 차이 계산
    dragState.offset = {
      x: event.clientX - widget.xpos,
      y: event.clientY - widget.ypos
    };

    // 드래그 중 텍스트 선택 방지
    event.preventDefault();
  }

  function handleMouseMove(event: MouseEvent) {
    if (!dragState.widget || !dragState.isDragging) return;

    // 새로운 위치 계산
    const newX = event.clientX - dragState.offset.x;
    const newY = event.clientY - dragState.offset.y;

    // 캔버스 경계 체크 (선택사항)
    const canvas = document.querySelector('.diagram_canvas');
    if (canvas) {
      const canvasRect = canvas.getBoundingClientRect();
      const maxX = canvasRect.width - dragState.widget.width;
      const maxY = canvasRect.height - dragState.widget.height;
      
      dragState.widget.xpos = Math.max(0, Math.min(newX, maxX));
      dragState.widget.ypos = Math.max(0, Math.min(newY, maxY));
    } else {
      dragState.widget.xpos = newX;
      dragState.widget.ypos = newY;
    }

    event.preventDefault();
  }

  function handleMouseUp() {
    if (dragState.isDragging) {
      dragState.widget = null;
      dragState.isDragging = false;
    }
  }

  function deleteWidget(widgetId: number) {
    widget_list = widget_list.filter(w => w.id !== widgetId);
  }

  // 캔버스 클릭 시 모든 위젯 선택 해제
  function handleCanvasClick(event: MouseEvent) {
    // 위젯이 아닌 캔버스를 직접 클릭한 경우
    if (event.target === event.currentTarget) {
      widget_list = widget_list.map(w => ({ ...w, isSelected: false }));
    }
  }
</script>

<svelte:window 
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
/>

<main>
  <div class="tab-container">
    <h3 class="title">| Widget Drag Test</h3>
    <button 
      class ="add_new_button"
      onclick={addWidget}>Add one</button>
  </div>

  <div class="diagram_canvas"
    onclick={handleCanvasClick}>
    {#each widget_list as wig (wig.id)}
      <WidgetContainer
        width={wig.width}
        height={wig.height}
        widget={wig.widget}
        isSelected={wig.isSelected}
        x={wig.xpos}
        y={wig.ypos}
        isDragging={dragState.widget?.id === wig.id}
        onDragStart={(event) => startDrag(event, wig)}
        onDelete={() => deleteWidget(wig.id)}>
        
        {#snippet children()}
          <Todos />
        {/snippet}
      </WidgetContainer>
    {/each}
  </div>
</main>

<style>
  /* https://dev.to/mrwolferinc/css-graph-paper-3e1i */
  :root {
    --bg-color: #fff;
    --line-color-1: #366;
    --line-color-2: #a9a9a9;
  }

  *, *::before, *::after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  main{
    width: 2160px;
    height: 1440px;
  }

  .tab-container{
    width: 100%;
    height: 36px;
    /* border-radius: 8px; */
    
    padding: 2px 4px;
    
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center;

    background-color: #e0e0e0;
    border-bottom: 2px double black;
  }

  .title{
    margin-left : 0.4rem;
    margin-right: 1rem;
  }

  .add_new_button{
    width: 72px;
    height: 24px;
    background-color: rgb(50, 214, 165);
    border-radius: 0.4rem;
    
    /* font-style: bold; */
    font-weight: 700;
    text-align: center;
  }
  .add_new_button:hover{
    background-color: rgb(44, 182, 140);
  }
  .add_new_button:active{
    background-color: rgb(44, 142, 113);
  }

  .diagram_canvas{
    width: 100%;
    height: 100%;
    background-color: var(--bg-color);
    background-image: linear-gradient(var(--line-color-1) 1.5px, transparent 1.5px), linear-gradient(90deg, var(--line-color-1) 1.5px, transparent 1.5px), linear-gradient(var(--line-color-2) 1px, transparent 1px), linear-gradient(90deg, var(--line-color-2) 1px, transparent 1px);
    background-position: -1.5px -1.5px, -1.5px -1.5px, -1px -1px, -1px -1px;
    background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
  }

</style>