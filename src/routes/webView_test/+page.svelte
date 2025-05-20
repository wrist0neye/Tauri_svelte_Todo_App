<script lang="ts">
  import WebView from "$root/components/webView/webView.svelte"
  import  {Window} from "@tauri-apps/api/window"
  import { Webview } from "@tauri-apps/api/webview";

  // State using runes
  let webviewComponent = $state();
  let currentUrl = $state('https://www.google.com/webhp?igu=1');
  let message = $state('');
  let receivedMessages = $state([]);

  // Static data

  // const urls = [
  //   'https://www.google.com',
  //   'https://www.naver.com',
  //   'https://svelte.dev/docs/kit/introduction',
  //   'https://example.com'
  // ];s

  interface URL {
    url : string,
    alias? : string | null;
  }

  const urls : URL[] = [
    {url : 'https://www.google.com/webhp?igu=1', alias : "Google"},
    {url : 'https://www.naver.com', alias : "Naver"},
    {url : 'https://svelte.dev/docs/kit/introduction', alias : "Svelte"},
    {url : 'https://example.com', alias : "Example"},
    {url : 'https://chatgpt.com', alias : "chatGPT"},
    {url : 'https://claude.ai/new', alias : "claude"},
    {url : 'https://gemini.google.com/', alias : "gemini"}
  ]

  // Webview에 메시지 전송
  function sendMessage() {
    if(webviewComponent && message.trim()) {
      webviewComponent.postMessage({
        type: 'greeting',
        message: message,
        timestamp: new Date().toISOString()
      });
      message = '';
    }
  }

  // Webview 메시지 수진
  function handleWebViewMessage(data) {
    console.log("Received from WebView:", data);
    receivedMessages = [
      ...receivedMessages, { 
        data,
        timestamp : new Date().toLocaleString()
      }
    ];
  }

  // URL 변경
  function changeUrl(newUrl) {
    // currentUrl = newUrl;
    let label = `Web-view-${Date.now().toString()}`
    const appWindow = new Window("label")
    const webview = new WebView(appWindow, label, {
        url : newUrl,
        width: 800,
        height: 600,
        decorations: true,
        transparent: false
      }
    )
    webview.once('tauri://created', function() {
      alert(`${window.location.href}`)
    })
    webview.once('tauri://error', function(e){
      // alert('error');
      console.error("Webview openning failed...")
      console.error(e);
    })
  }

  // 웹뷰 새로고칭
  function refreshWebView() {
    webviewComponent?.reload();
  }

  // 메시지 기록 지우기
  function clearMessages() {
    receivedMessages = [];
  }

  // Enter 키로 메시지 전송
  function handleKeydown(event) {
    if(event.key === 'Enter') {
      sendMessage();
    }
  }
</script>

<main>
  <h1>Svelte 5 WebView Demo</h1>
  
  <!-- 컨트롤 패널 -->
  <div class="control-panel">
    <!-- URL 선택 버튼들 -->
    <section class="url-controls">
      <h3>Quick Navigation:</h3>
      <div class="button-group">
        {#each urls as url}
          <button 
            onclick={() => changeUrl(url.url)}
            class:active={currentUrl === url.url}
          >
            {#if url.alias === null || !('alias' in url)}
              {url.replace('https://www.', '').replace('https://', '')}
            {:else}
              {url.alias}
            {/if}
            
          </button>
        {/each}
        <button onclick={refreshWebView} class="refresh-btn">
          🔄 Refresh
        </button>
      </div>
    </section>
    
    <!-- 현재 URL 입력 -->
    <section class="url-input">
      <label for="url">URL:</label>
      <input 
        id="url"
        type="url" 
        bind:value={currentUrl} 
        placeholder="Enter URL..."
      />
    </section>
    
    <!-- 메시지 전송 -->
    <section class="message-controls">
      <label for="message">Send Message:</label>
      <div class="message-input-group">
        <input 
          id="message"
          type="text" 
          bind:value={message} 
          placeholder="Type a message..."
          onkeydown={handleKeydown}
        />
        <button onclick={sendMessage} disabled={!message.trim()}>
          Send
        </button>
      </div>
    </section>
  </div>
  
  <!-- WebView 컴포넌트 -->
  <div class="webview-section">
    <WebView 
      bind:this={webviewComponent}
      src={currentUrl}
      width="100%"
      height="600px"
      title="Embedded WebView"
      onmessage={handleWebViewMessage}
      disablewebsecurity
    />
  </div>
  
  <!-- 메시지 기록 -->
  {#if receivedMessages.length > 0}
    <section class="message-log">
      <div class="log-header">
        <h3>Received Messages</h3>
        <button onclick={clearMessages} class="clear-btn">
          Clear
        </button>
      </div>
      <div class="messages">
        {#each receivedMessages as { data, timestamp }, i (i)}
          <div class="message-item">
            <div class="message-timestamp">{timestamp}</div>
            <div class="message-content">
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}
  
  <!-- 기능 설명 -->
  <footer class="info">
    <h3>Svelte 5 Features Used:</h3>
    <ul>
      <li><code>$state()</code> - Reactive state management</li>
      <li><code>$props()</code> - Component props with destructuring</li>
      <li><code>$derived()</code> - Computed values</li>
      <li><code>$effect()</code> - Side effects</li>
      <li><code>bind:this</code> - Component references</li>
      <li><code>onclick</code> - Event handlers (new syntax)</li>
    </ul>
  </footer>
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
    font-weight: 600;
  }
  
  .control-panel {
    display: grid;
    gap: 20px;
    margin-bottom: 30px;
    padding: 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  section {
    background: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  h3 {
    margin: 0 0 12px 0;
    color: #374151;
    font-weight: 500;
  }
  
  .button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .url-controls button {
    padding: 8px 16px;
    border: 2px solid #e5e7eb;
    background-color: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
  }
  
  .url-controls button:hover {
    border-color: #3b82f6;
    background-color: #eff6ff;
  }
  
  .url-controls button.active {
    background-color: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
  
  .refresh-btn {
    background-color: #10b981 !important;
    color: white !important;
    border-color: #10b981 !important;
  }
  
  .refresh-btn:hover {
    background-color: #059669 !important;
    border-color: #059669 !important;
  }
  
  .url-input {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .url-input label {
    font-weight: 600;
    min-width: 40px;
    color: #374151;
  }
  
  .url-input input {
    flex: 1;
    padding: 10px 14px;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s ease;
  }
  
  .url-input input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .message-controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .message-controls label {
    font-weight: 600;
    color: #374151;
  }
  
  .message-input-group {
    display: flex;
    gap: 12px;
  }
  
  .message-input-group input {
    flex: 1;
    padding: 10px 14px;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s ease;
  }
  
  .message-input-group input:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
  
  .message-input-group button {
    padding: 10px 20px;
    background-color: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .message-input-group button:hover:not(:disabled) {
    background-color: #059669;
    transform: translateY(-1px);
  }
  
  .message-input-group button:disabled {
    background-color: #d1d5db;
    cursor: not-allowed;
    transform: none;
  }
  
  .webview-section {
    margin-bottom: 30px;
  }
  
  .message-log {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    margin-bottom: 30px;
  }
  
  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f3f4f6;
  }
  
  .clear-btn {
    padding: 6px 12px;
    background-color: #ef4444;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s ease;
  }
  
  .clear-btn:hover {
    background-color: #dc2626;
  }
  
  .messages {
    max-height: 300px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .message-item {
    padding: 12px;
    background-color: #f9fafb;
    border-radius: 8px;
    border-left: 4px solid #3b82f6;
  }
  
  .message-timestamp {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 8px;
  }
  
  .message-content pre {
    margin: 0;
    font-size: 14px;
    color: #374151;
    white-space: pre-wrap;
    word-break: break-word;
  }
  
  .info {
    background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #81d4fa;
  }
  
  .info h3 {
    color: #0277bd;
    margin-bottom: 16px;
  }
  
  .info ul {
    margin: 0;
    padding-left: 20px;
  }
  
  .info li {
    margin-bottom: 8px;
    color: #01579b;
  }
  
  .info code {
    background-color: #fff3e0;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Fira Code', Consolas, monospace;
    color: #e65100;
    font-weight: 500;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .control-panel {
      padding: 16px;
    }
    
    .message-input-group {
      flex-direction: column;
    }
    
    .log-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }
    
    .button-group {
      justify-content: center;
    }
  }
</style>