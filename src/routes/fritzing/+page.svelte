// App.svelte - 메인 애플리케이션 컴포넌트
<script>
  import { onMount } from 'svelte';
  import Toolbar from '../../components/fritzing/Toolbar.svelte';
  import Canvas from '../../components/fritzing/Canvas.svelte';
  import ComponentPanel from '../../components/fritzing/ComponentPanel.svelte';
  // import PropertiesPanel from '../../components/fritzing/PropertiesPanel.svelte';
  import { componentStore } from '../../stores/componentStore';
  import { selectedComponent } from '../../stores/selectionStore';
  
  // 캔버스 상태
  let scale = 1;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  
  // 뷰 모드 (breadboard, schematic, pcb)
  let viewMode = 'breadboard';
  
  function handleZoom(event) {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    scale = Math.max(0.5, Math.min(3, scale * zoomFactor));
  }
  
  function handlePanStart(event) {
    if (event.button === 1 || (event.button === 0 && event.ctrlKey)) { // 중간 버튼 또는 Ctrl+좌클릭
      isDragging = true;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    }
  }
  
  function handlePanMove(event) {
    if (isDragging) {
      const dx = event.clientX - lastMouseX;
      const dy = event.clientY - lastMouseY;
      panX += dx;
      panY += dy;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    }
  }
  
  function handlePanEnd() {
    isDragging = false;
  }
  
  function changeViewMode(mode) {
    viewMode = mode;
  }
  
  onMount(() => {
    // 초기 컴포넌트 로드 등의 작업
    componentStore.loadDefaultComponents();
  });
</script>

<svelte:window on:mouseup={handlePanEnd} on:mousemove={handlePanMove} />

<div class="app-container">
  <header>
    <div class="logo">CircuitCraft</div>
    <div class="view-modes">
      <button class:active={viewMode === 'breadboard'} on:click={() => changeViewMode('breadboard')}>
        Breadboard
      </button>
      <button class:active={viewMode === 'schematic'} on:click={() => changeViewMode('schematic')}>
        Schematic
      </button>
      <button class:active={viewMode === 'pcb'} on:click={() => changeViewMode('pcb')}>
        PCB
      </button>
    </div>
    <div class="actions">
      <button>New</button>
      <button>Save</button>
      <button>Export</button>
    </div>
  </header>
  
  <main>
    <ComponentPanel {viewMode} />
    
    <div class="canvas-container" on:wheel={handleZoom} on:mousedown={handlePanStart}>
      <Canvas {scale} {panX} {panY} {viewMode} />
      <Toolbar />
    </div>
    
    <!-- <PropertiesPanel /> -->
  </main>
  
  <footer>
    <div class="coordinates">X: 0, Y: 0</div>
    <div class="zoom-controls">
      <button on:click={() => scale = Math.min(3, scale * 1.1)}>+</button>
      <span>{Math.round(scale * 100)}%</span>
      <button on:click={() => scale = Math.max(0.5, scale * 0.9)}>-</button>
    </div>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }
  
  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f0f0f0;
  }
  
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #333;
    color: white;
    padding: 0.5rem 1rem;
  }
  
  .logo {
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  .view-modes {
    display: flex;
    gap: 0.5rem;
  }
  
  .view-modes button {
    background: #555;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .view-modes button.active {
    background: #0078d7;
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .actions button {
    background: #555;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }
  
  main {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  .canvas-container {
    flex: 1;
    position: relative;
    overflow: hidden;
    background-color: #fff;
  }
  
  footer {
    display: flex;
    justify-content: space-between;
    background-color: #333;
    color: white;
    padding: 0.5rem 1rem;
  }
  
  .zoom-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .zoom-controls button {
    background: #555;
    color: white;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
</style>