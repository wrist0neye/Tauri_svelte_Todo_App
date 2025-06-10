// +page.svelte
<script lang="ts">
  import WidgetContainer from "$root/components/dock/widgetcontainer.svelte"
  import Todos from "$root/components/Todos.svelte";

  interface Widget {
    id: number;
    xpos: number;
    ypos: number;
    width: number;
    height: number;
    widget: string;
    isSelected: boolean;
  }
  
  let widget_list: Widget[] = $state([]);
  let nextId = 1;
  
  // 드래그 상태 관리
  let dragState = $state({
    widget: null as Widget | null,
    offset: { x: 0, y: 0 },
    isDragging: false
  });

  function addWidget() {
    let newWidget: Widget = {
      id: nextId++,
      xpos: 40 + (widget_list.length * 30), // 겹치지 않게 약간씩 오프셋
      ypos: 40 + (widget_list.length * 30),
      width: 720,
      height: 600,
      widget: "./",
      isSelected: false
    }
    widget_list = [...widget_list, newWidget];
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

<!-- 전역 마우스 이벤트 리스너 -->
<svelte:window 
  onmousemove={handleMouseMove}
  onmouseup={handleMouseUp}
/>

<main>
  <div class="tab-container">
    <h3 class="title">| Widget Drag Test</h3>
    <button 
      class="add_new_button"
      onclick={addWidget}>
      Add Widget ({widget_list.length})
    </button>
  </div>

  <div 
    class="diagram_canvas"
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
  main {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .tab-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .title {
    margin: 0;
    color: #374151;
  }

  .add_new_button {
    padding: 8px 16px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
  }

  .add_new_button:hover {
    background: #2563eb;
  }

  .diagram_canvas {
    flex: 1;
    position: relative;
    background: #fafafa;
    background-image: 
      linear-gradient(to right, #e5e7eb 1px, transparent 1px),
      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
    background-size: 20px 20px;
    overflow: hidden;
    cursor: default;
  }
</style>