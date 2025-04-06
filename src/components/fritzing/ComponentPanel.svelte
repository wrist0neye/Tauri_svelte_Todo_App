// components/ComponentPanel.svelte - 컴포넌트 선택 패널
<script>
  import { draggedComponent } from '../../stores/selectionStore';
  // import componentLibrary from '../data/componentLibrary';
  
  export let viewMode = 'breadboard';
  
  // 현재 뷰 모드에 맞는 컴포넌트 필터링
  // $: availableComponents = componentLibrary.filter(
  //   c => c.viewMode === viewMode || c.viewMode === 'all'
  // );
  
  // 컴포넌트 카테고리
  const categories = [
    { id: 'basics', name: '기본 요소' },
    { id: 'passive', name: '수동 소자' },
    { id: 'active', name: '능동 소자' },
    { id: 'ic', name: '집적 회로' },
    { id: 'modules', name: '모듈' }
  ];
  
  let selectedCategory = 'basics';
  
  function handleDragStart(component) {
    draggedComponent.set(component);
  }
</script>

<div class="component-panel">
  <h3>부품</h3>
  
  <div class="categories">
    {#each categories as category}
      <button
        class:active={selectedCategory === category.id}
        on:click={() => selectedCategory = category.id}
      >
        {category.name}
      </button>
    {/each}
  </div>
  
  <div class="component-list">
    <!-- {#each availableComponents.filter(c => c.category === selectedCategory) as component (component.id)}
      <div 
        class="component-item"
        draggable="true"
        on:dragstart={() => handleDragStart(component)}
        on:click={() => handleDragStart(component)}
      >
        <div class="component-icon">
          {@html component.iconSvg}
        </div>
        <div class="component-name">{component.name}</div>
      </div>
    {/each} -->
  </div>
</div>

<style>
  .component-panel {
    width: 250px;
    background-color: #f5f5f5;
    border-right: 1px solid #ddd;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  h3 {
    margin: 1rem;
    font-size: 1.2rem;
  }
  
  .categories {
    display: flex;
    flex-wrap: wrap;
    padding: 0 0.5rem;
    gap: 0.3rem;
  }
  
  .categories button {
    background: #e0e0e0;
    border: none;
    padding: 0.4rem 0.7rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
  }
  
  .categories button.active {
    background: #0078d7;
    color: white;
  }
  
  .component-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  
  .component-item {
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: grab;
    transition: transform 0.1s;
  }
  
  .component-item:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .component-icon {
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .component-name {
    font-size: 0.8rem;
    margin-top: 0.5rem;
    text-align: center;
  }
</style>