<!-- // components/Wire.svelte - 회로 요소 간 연결선 -->
<script>
  export let connection;
  export let scale = 1;
  export let panX = 0;
  export let panY = 0;
  
  // 시작점과 끝점
  $: from = connection.from;
  $: to = connection.to;
  
  // L자형 와이어를 위한 중간점
  $: midX = from.x;
  $: midY = to.y;
  
  // SVG 경로 계산
  $: path = `M ${from.x * scale + panX} ${from.y * scale + panY} 
             L ${midX * scale + panX} ${midY * scale + panY} 
             L ${to.x * scale + panX} ${to.y * scale + panY}`;
</script>

<svg class="wire" width="100%" height="100%" style="position: absolute; pointer-events: none; z-index: 0;">
  <path 
    d={path} 
    stroke="#0078d7"
    stroke-width={2 * scale}
    fill="none"
  />
</svg>