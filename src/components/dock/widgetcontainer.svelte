//widgetcontainer.svelte
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
  }: {
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
  .widget_container {
    position: absolute;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    will-change: transform; /* GPU 가속 힌트 */
    transition: box-shadow 0.2s ease;
  }

  .widget_container.selected {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .widget_container.dragging {
    z-index: 1000;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
    transition: none; /* 드래그 중에는 트랜지션 제거 */
  }

  .widget_container.minimized {
    height: 40px !important;
  }

  .titlebar {
    display: flex;
    align-items: center;
    height: 40px;
    background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
    border-bottom: 1px solid #e2e8f0;
    padding: 0 12px;
    cursor: move;
    user-select: none;
  }

  .titlebar:hover {
    background: linear-gradient(to bottom, #f1f5f9, #e2e8f0);
  }

  .widget_title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    pointer-events: none; /* 텍스트 선택 방지 */
  }

  .blank {
    flex: 1;
  }

  .widget_button {
    width: 24px;
    height: 24px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    margin-left: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    transition: all 0.15s ease;
  }

  .widget_button:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #374151;
  }

  .widget_button.close:hover {
    background: #ef4444;
    color: white;
  }

  .container_body {
    height: calc(100% - 41px); /* titlebar 높이와 border 제외 */
    overflow: auto;
    background: white;
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