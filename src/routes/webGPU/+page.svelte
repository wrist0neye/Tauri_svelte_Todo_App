<script lang="ts">
  import { Grid, GroupInstanceIdCreator } from 'ag-grid-community';
  import { onMount } from 'svelte';
  let canvas;
  const GRID_SIZE = 32;

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

      // pass.end();

      // const commandBuffer = encoder.finish();
      // res.device.queue.submit([commandBuffer]);

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

      const uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE]);
      const uniformBuffer = res.device.createBuffer({
        label: "Grid Uniforms",
        size: uniformArray.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

      res.device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

      const cellShaderModule = res.device.createShaderModule({
        label: 'Cell shader',
        code: `
          // At the top of the \`code\` string in the createShaderModule() call
          @group(0) @binding(0) var<uniform> grid: vec2f;
          
          @vertex
          fn vertexMain(@location(0) pos: vec2f,
                        @builtin(instance_index) instance: u32) -> 
            @builtin(position) vec4f {
            
            let i = f32(instance);
            // let cell = vec2f(i,i);
            let cell = vec2f(i % grid.x, floor(i / grid.x));
            let cellOffset = cell/grid*2;
            let gridPos = (pos+1)/grid - 1 + cellOffset;
            return vec4f(gridPos, 0, 1);
          }

          @fragment
          fn fragmentMain() -> @location(0) vec4f {
            return vec4f(1, 0, 0, 1);
          }
        `
      })

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

      const bindGroup = res.device.createBindGroup({
        label: "Cell renderer bind group",
        layout: cellPipeline.getBindGroupLayout(0),
        entries: [{
          binding: 0,
          resource: { buffer: uniformBuffer }
        }],
      })
      
      pass.setPipeline(cellPipeline);
      pass.setVertexBuffer(0, vertexBuffer);

      pass.setBindGroup(0, bindGroup);
      pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE);

      // // before pass.end()
      pass.end();

      const commandBuffer = encoder.finish();
      res.device.queue.submit([commandBuffer]);

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