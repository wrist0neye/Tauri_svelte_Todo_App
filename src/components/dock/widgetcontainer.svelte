<script lang="ts">
  let {
    width,
    height,
    widget = "./",
    isSelected = false,
    x = 0,
    y = 0,
    isDragging = false,
    onDragStart,
    onDelete,
    children
  } : {
    width: number;
    height: number;
    widget?: string;
    isSelected?: boolean;
    x?: number;
    y?: number;
    isDragging?: boolean;
    onDragStart?: (event: MouseEvent) => void;
    onDelete?: () => void;
    children: any;
  } = $props();

  let isMinimized = $state(false);

  function handleTitleBarMouseDown(event: MouseEvent) {
    // 버튼 클릭은 드래그 시작하지 않음
    if ((event.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }
    
    onDragStart?.(event);
  }

  function handleMinimize() {
    isMinimized = !isMinimized;
  }

  function handleMaximize() {
    // 최대화 로직 (선택사항)
    console.log('Maximize clicked');
  }

  function handleClose() {
    onDelete?.();
  }

  // 컨테이너 클릭 시 이벤트 버블링 방지 (캔버스 클릭과 구분)
  function handleContainerClick(event: MouseEvent) {
    event.stopPropagation();
  }
</script>

<div
  class="widget_container"
  class:selected={isSelected}
  class:dragging={isDragging}
  class:minimized={isMinimized}
  style:width="{width}px"
  style:height="{isMinimized ? 40 : height}px"
  style:transform="translate({x}px, {y}px)"
  onclick={handleContainerClick}>
  
  <div 
    class="titlebar"
    onmousedown={handleTitleBarMouseDown}>
    <h4 class="widget_title">SAMPLE</h4>
    <div class="blank"></div>
    <button 
      class="widget_button"
      onclick={handleMinimize}
      title={isMinimized ? "복원" : "최소화"}>
      {isMinimized ? '□' : 'ㅡ'}
    </button>
    <button 
      class="widget_button"
      onclick={handleMaximize}
      title="최대화">
      ㅁ
    </button>
    <button 
      class="widget_button close"
      onclick={handleClose}
      title="닫기">
      ×
    </button>
  </div>
  
  {#if !isMinimized}
    <div class="container_body">
      {@render children()}
    </div>
  {/if}
</div>
<style>
  .widget_container{
    /* width:720px;
    height:600px; */
    border-radius: 5px;
    border: 2px solid rgb(7, 58, 7);
    
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
  }
  .titlebar {
    width: 100%;
    height: 36px;

    padding : 0 2px;
    background-color: rgb(7, 58, 7);
   
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .widget_title{
    margin-left: 4px;
    color: #fff;
  }
  .widget_button{
    width: 12px;
    height: 12px;
    margin: 0 2px;

    color: #fff;
    font-weight: 600; 
  }
  .blank{
    flex:1;
  }
  .container_body{
    width: 100%;
    flex-grow:1;

    border-radius: 5px;
    background-color: white;
  }

  /* 드래그 중 텍스트 선택 방지 */
  .dragging,
  .dragging * {
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
  }
</style>