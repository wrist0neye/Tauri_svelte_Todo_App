<script>
  import {onMount} from "svelte";

  // export let src = '';
  // export let width = '100%';
  // export let height = '400px';
  // export let title = 'webview';
  // export let loading = true;

  let {
    src = '',
    width = '100%',
    height = '400px',
    title = 'WebView',
    onmessage
  } = $props();

  // State using runes
  let iframeElement = $state();
  let isLoading = $state(true);
  let hasError = $state(false);

  // Derived state
  let showSpinner = $derived(isLoading && !hasError);

  /*// URL 변경 시 다시 로딩 상태로 설정
  $: if (src) {
    isLoading = true;
    hasError = false;
  }*/

  // Effect to reset loading state when src changes
  $effect(()=> {
    if (src) {
      isLoading = true;
      hasError = false;
    }
  });

  // iframe 로드 완료.
  function handleLoad() {
    isLoading = false;
  }

  // iframe 로드 에러 처리
  function handleError() {
    isLoading = true;
    hasError = true;
  }

  // iframe에 메시지 전송 (exposed funciton)
  function postMessage(message, targetOrigin = '*') {
    if (iframeElement?.contentWindow) {
      iframeElement.contentWindow.postMessage(message, targetOrigin);
    }
  }

  // iframe에서 메시지 수신
  function handleMessage(event) {
    console.log('Message received:', event.data);
    onmessage?.(event.data);
  }

  // 새로고침 함수
  function reload() {
    if (iframeElement) {
      iframeElement.src = iframeElement.src;
    }
  }

  onMount(() => {
    // 메시지 리스너 등록
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  });

  export {postMessage, reload};

</script>

<div class="webview-container" style="width: {width}; height: {height};">
  <!-- loading Spinner -->
  {#if showSpinner} 
    <div class="loading-overlay">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  {/if}
  
  <!-- loading 이 끝나거나 loading 중 에러 발생 시 -->
  {#if hasError}
    <div class="error-overlay">
      <h3>Failed to load content</h3>
      <p>Unable to display the requested page</p>
      <button onclick={reload}>Retry</button>
    </div>
  {:else}
    <iframe
      bind:this={iframeElement}
      {src}
      {title}
      width="100%"
      height="100%"
      frameborder="0"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      onload={handleLoad}
      onerror={handleError}
    ></iframe>
  {/if}
</div>


<style>

</style>