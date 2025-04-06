<!-- // components/CircuitComponent.svelte - 개별 회로 요소 컴포넌트 -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { selectedComponent } from '../../stores/selectionStore';
  
  export let component;
  export let scale = 1;
  export let panX = 0;
  export let panY = 0;
  export let isSelected = false;
  
  const dispatch = createEventDispatcher();
  
  function handleMouseDown(event) {
    event.stopPropagation();
    selectedComponent.set(component);
    dispatch('select', component);
  }
  
  function handleMouseMove(event) {
    if (isSelected && event.buttons === 1) {
      event.stopPropagation();
      dispatch('move', {
        id: component.id,
        dx: event.movementX / scale,
        dy: event.movementY / scale
      });
    }
  }

  // 컴포넌트가 선택되었을 때 시각적 피드백을 위한 스타일
  $: selectionStyle = isSelected ? 'outline: 2px solid #0078d7; outline-offset: 2px;' : '';
  
  // 위치 및 크기 계산
  $: style = `
    left: ${(component.x * scale) + panX}px;
    top: ${(component.y * scale) + panY}px;
    width: ${component.width * scale}px;
    height: ${component.height * scale}px;
    transform: rotate(${component.rotation || 0}deg);
    ${selectionStyle}
  `;
</script>

<div 
  class="circuit-component"
  style={style}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
>
  <!-- SVG 렌더링 -->
  {@html component.svg}
  
  <!-- 핀 표시 (디버깅용, 필요시 활성화) -->
  <!-- {#each component.pins || [] as pin}
    <div class="pin" style={`left: ${pin.offsetX * scale}px; top: ${pin.offsetY * scale}px;`}></div>
  {/each} -->
</div>

<style>
  .circuit-component {
    position: absolute;
    cursor: move;
    z-index: 1;
    user-select: none;
  }
  
  .pin {
    position: absolute;
    width: 6px;
    height: 6px;
    background-color: red;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
</style>