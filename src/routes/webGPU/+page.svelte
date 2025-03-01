<script lang="ts">
  import { onMount } from 'svelte';
  let canvas;

  // function console_widget() {
  //   const adapter = await navigator.gpu.requestAdapter();
  //   const device = await adapter.requestDevice();
  //   const context = canvas.getContext("webgpu");
  //   const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
  //   // let canvas = document.querySelector("canvas");
  //   context.configure({
  //     device: device,
  //     format: canvasFormat,
  //   });
  //   const encoder = device.createCommandEncoder();
  //   const pass = encoder.beginRenderPass({
  //   colorAttachments: [{
  //       view: context.getCurrentTexture().createView(),
  //       loadOp: "clear",
  //       clearValue: { r: 0, g: 0, b: 0.4, a: 1 }, // New line
  //       storeOp: "store",
  //     }],
  //   });
  // }

  onMount(() => {
    const GPU_check = async() => {
      const adapter = await navigator.gpu.requestAdapter();
      const device = await adapter.requestDevice();
      return {
        adapter: adapter,
        device: device
      }
    }

    GPU_check().then((res) => {
      // let cav = document.querySelector("canvas");
      const context = canvas.getContext("webgpu");
      const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
      context.configure({
        device: res.device,
        format: canvasFormat,
      });

      const encoder = res.device.createCommandEncoder();
      
      const pass = encoder.beginRenderPass( {
        colorAttachments: [{
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          clearValue: { r: 0.0, g: 0.0, b: 0.4, a: 1.0 },
          storeOp: "store",
        }]
      })

      pass.end();

      const commandBuffer = encoder.finish();
      res.device.queue.submit([commandBuffer]);

      const vertices = new Float32Array([
        -0.8, -0.8,
        0.8, -0.8,
        0.8, 0.8,
        
        -0.8, -0.8,
        0.8, 0.8,
        -0.8, 0.8,
      ])

      const vertexBuffer = res.device.createBuffer({
        label: "Cell vertices",
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });

      res.device.queue.writeBuffer(vertexBuffer, 0, vertices);

      const vertexBufferLayout = {
        arrayStride: 8,
        attributes: [{
          format: "float32x2",
          offset: 0,
          shaderLocation: 0, // Position, see vertex shader
        }],
      };

      // After encoder.beginRenderPass()

      const cellShaderModule = res.device.createShaderModule({
        label: 'Cell shader',
        code: `
          @vertex
          fn vertexMain(@location(0) pos: vec2f) ->
            @builtin(position) vec4f {
            return vec4f(pos, 0, 1);
          }

          @fragment
          fn fragmentMain() -> @location(0) vec4f {
            return vec4f(1, 0, 0, 1);
          }
        `
      });


      const cellPipeline = res.device.createRenderPipeline({
        label: "Cell pipeline",
        layout: "auto",
        vertex: {
          module: cellShaderModule,
          entryPoint: "vertexMain",
          buffers: [vertexBufferLayout]
        },
        fragment: {
          module: cellShaderModule,
          entryPoint: "fragmentMain",
          targets: [{
            format: canvasFormat
          }]
        }
      });


      // pass.setPipeline(cellPipeline);
      // pass.setVertexBuffer(0, vertexBuffer);
      // pass.draw(vertices.length / 2); // 6 vertices

      // // before pass.end()
      // pass.end();

    })
  })
</script>

<canvas bind:this = {canvas}></canvas>


<style>
  canvas {
    width :512px;
    height:512px;
    background-color: transparent;
  }
</style>