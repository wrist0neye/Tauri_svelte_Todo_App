// components/Canvas.svelte - 회로 설계를 위한 캔버스
<script>
  import { onMount, afterUpdate } from 'svelte';
  import { componentStore } from '../../stores/componentStore';
  import { selectedComponent, draggedComponent } from '../../stores/selectionStore';
  import CircuitComponent from './CircuitComponent.svelte';
  import Wire from './Wire.svelte';
  
  // props
  export let scale = 1;
  export let panX = 0;
  export let panY = 0;
  export let viewMode = 'breadboard';
  
  // 로컬 상태
  let canvas;
  let canvasWidth;
  let canvasHeight;
  let gridSize = 10;
  let components = [];
  let connections = [];
  let isDrawingWire = false;
  let wireStartPoint = null;
  let wireEndPoint = { x: 0, y: 0 };
  
  // 컴포넌트 스토어 구독
  const unsubscribe = componentStore.subscribe(store => {
    components = store.components;
    connections = store.connections;
  });
  
  // 마우스 이벤트 핸들러
  function handleCanvasMouseDown(event) {
    // 드래그된 컴포넌트가 있으면 캔버스에 배치
    if ($draggedComponent) {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left - panX) / scale;
      const y = (event.clientY - rect.top - panY) / scale;
      
      // 그리드에 스냅
      const snappedX = Math.round(x / gridSize) * gridSize;
      const snappedY = Math.round(y / gridSize) * gridSize;
      
      // 컴포넌트 추가
      componentStore.addComponent({
        ...$draggedComponent,
        id: generateId(),
        x: snappedX,
        y: snappedY,
        viewMode: viewMode
      });
      
      // 드래그 상태 초기화
      draggedComponent.set(null);
    } 
    // 선택된 컴포넌트가 있고 "워이어 그리기" 모드면 와이어 시작
    else if ($selectedComponent && event.button === 0) {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left - panX) / scale;
      const y = (event.clientY - rect.top - panY) / scale;
      
      // 선택한 컴포넌트의 핀에 연결하여 와이어 그리기 시작
      const pin = findClosestPin($selectedComponent, x, y);
      if (pin) {
        isDrawingWire = true;
        wireStartPoint = {
          componentId: $selectedComponent.id,
          pinId: pin.id,
          x: $selectedComponent.x + pin.offsetX,
          y: $selectedComponent.y + pin.offsetY
        };
        wireEndPoint = { ...wireStartPoint };
      }
    } else {
      // 컴포넌트 선택 취소
      selectedComponent.set(null);
    }
  }
  
  function handleCanvasMouseMove(event) {
    if (isDrawingWire) {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left - panX) / scale;
      const y = (event.clientY - rect.top - panY) / scale;
      
      // 와이어 엔드포인트 업데이트
      wireEndPoint = {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize
      };
    }
  }
  
  function handleCanvasMouseUp(event) {
    if (isDrawingWire) {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left - panX) / scale;
      const y = (event.clientY - rect.top - panY) / scale;
      
      // 다른 컴포넌트의 핀을 찾음
      for (const component of components) {
        if (component.id !== $selectedComponent.id) {
          const pin = findClosestPin(component, x, y);
          if (pin) {
            // 새 연결 추가
            componentStore.addConnection({
              id: generateId(),
              from: wireStartPoint,
              to: {
                componentId: component.id,
                pinId: pin.id,
                x: component.x + pin.offsetX,
                y: component.y + pin.offsetY
              },
              viewMode: viewMode
            });
            break;
          }
        }
      }
      
      // 와이어 그리기 상태 초기화
      isDrawingWire = false;
      wireStartPoint = null;
    }
  }
  
  // 유틸리티 함수
  function findClosestPin(component, x, y) {
    if (!component || !component.pins) return null;
    
    const threshold = 15; // 핀 감지를 위한 거리 임계값
    let closestPin = null;
    let minDistance = threshold;
    
    for (const pin of component.pins) {
      const pinX = component.x + pin.offsetX;
      const pinY = component.y + pin.offsetY;
      const distance = Math.sqrt((x - pinX) ** 2 + (y - pinY) ** 2);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestPin = pin;
      }
    }
    
    return closestPin;
  }
  
  function generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  // 그리드 그리기
  function drawGrid(ctx) {
    const startX = Math.floor((-panX / scale) / gridSize) * gridSize;
    const startY = Math.floor((-panY / scale) / gridSize) * gridSize;
    const endX = Math.ceil((canvasWidth / scale - panX / scale) / gridSize) * gridSize;
    const endY = Math.ceil((canvasHeight / scale - panY / scale) / gridSize) * gridSize;
    
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5 / scale;
    
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
  }

  // 컨텍스트 초기화 및 그리기
  function initCanvas() {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvasWidth = canvas.width = canvas.offsetWidth;
    canvasHeight = canvas.height = canvas.offsetHeight;
    
    // 변환 초기화
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 캔버스 변환 적용
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);
    
    // 그리드 그리기
    drawGrid(ctx);
    
    // 와이어 그리기 중이면 임시 와이어 표시
    if (isDrawingWire && wireStartPoint && wireEndPoint) {
      ctx.strokeStyle = '#0078d7';
      ctx.lineWidth = 2 / scale;
      ctx.beginPath();
      ctx.moveTo(wireStartPoint.x, wireStartPoint.y);
      
      // 직각 와이어 그리기 (L자 형태)
      const midX = wireStartPoint.x;
      const midY = wireEndPoint.y;
      
      ctx.lineTo(midX, midY);
      ctx.lineTo(wireEndPoint.x, midY);
      ctx.stroke();
    }
  }
  
  // 컴포넌트 렌더링 후 캔버스 초기화
  afterUpdate(() => {
    initCanvas();
  });
  
  onMount(() => {
    initCanvas();
    
    // 윈도우 리사이즈 핸들러
    const handleResize = () => {
      canvasWidth = canvas.width = canvas.offsetWidth;
      canvasHeight = canvas.height = canvas.offsetHeight;
      initCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      unsubscribe();
    };
  });
</script>

<div class="canvas-wrapper">
  <canvas 
    bind:this={canvas} 
    on:mousedown={handleCanvasMouseDown}
    on:mousemove={handleCanvasMouseMove}
    on:mouseup={handleCanvasMouseUp}
  ></canvas>
  
  <!-- 컴포넌트 렌더링 -->
  {#each components.filter(c => c.viewMode === viewMode || c.viewMode === 'all') as component (component.id)}
    <CircuitComponent 
      {component}
      {scale}
      {panX}
      {panY}
      isSelected={$selectedComponent && $selectedComponent.id === component.id}
    />
  {/each}
  
  <!-- 연결선 렌더링 -->
  {#each connections.filter(c => c.viewMode === viewMode || c.viewMode === 'all') as connection (connection.id)}
    <Wire 
      {connection}
      {scale}
      {panX}
      {panY}
    />
  {/each}
</div>

<style>
  .canvas-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
</style>
