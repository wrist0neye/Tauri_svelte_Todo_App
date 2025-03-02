<script lang="ts">
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

      // const encoder = res.device.createCommandEncoder();
      
      // const pass = encoder.beginRenderPass( {
      //   colorAttachments: [{
      //     view: context.getCurrentTexture().createView(),
      //     loadOp: "clear",
      //     clearValue: { r: 0.0, g: 0.0, b: 0.4, a: 1.0 },
      //     storeOp: "store",
      //   }]
      // })

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
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      })

      res.device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

      // Create an array representing the active state of each cell.
      const cellStateArray = new Uint32Array(GRID_SIZE * GRID_SIZE);

      // create a storage buffer to hold the cell state.
      const cellStateStorage = [
        res.device.createBuffer({
          label: "Cell State A",
          size: cellStateArray.byteLength,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        }), 
        res.device.createBuffer({
          label: "Cell State B",
          size: cellStateArray.byteLength,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })
      ];

      for (let i=0;i<cellStateArray.length;i+=3) {
        cellStateArray[i] = 1;
      }
      res.device.queue.writeBuffer(cellStateStorage[0], 0, cellStateArray);

      for (let i=0;i<cellStateArray.length;i++) {
        cellStateArray[i] = i%2;
      }
      res.device.queue.writeBuffer(cellStateStorage[1], 0, cellStateArray);

      const cellShaderModule = res.device.createShaderModule({
        label: 'Cell shader',
        code: `
          struct VertexInput {
            @location(0) pos: vec2f,
            @builtin(instance_index) instance: u32,
          };

          struct VertexOutput{
            @builtin(position) pos: vec4f,
            @location(0) cell : vec2f,
          };

          struct FragInput {
            @location(0) cell: vec2f,
          }

          // At the top of the \`code\` string in the createShaderModule() call
          @group(0) @binding(0) var<uniform> grid: vec2f;
          @group(0) @binding(1) var<storage> cellState: array<u32>;
          
          @vertex
          fn vertexMain(input: VertexInput) -> VertexOutput {  
            let i = f32(input.instance);
            // let cell = vec2f(i,i);
            let cell = vec2f(i % grid.x, floor(i / grid.x));
            let state = f32(cellState[input.instance]);

            // let cellSize = 2.0 / grid;
            // let cellOffset = (cell * cellSize) -1.0 + cellSize / 2.0;
            // let gridPos = input.pos * cellSize + cellOffset;
            let cellOffset = cell/grid*2;
            let gridPos = (input.pos*state+1)/grid - 1 + cellOffset;
            //return vec4f(gridPos, 0, 1);

            var output: VertexOutput;
            output.pos = vec4f(gridPos, 0, 1);
            output.cell = cell;
            return output;
          }


          @fragment
          fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
            //return vec4f(1, 0, 0, 1);
            let c = input.cell / grid;
            return vec4f(c, 1-c.x, 1);
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

      const bindGroups = [
        res.device.createBindGroup({
          label: "Cell renderer bind group",
          layout: cellPipeline.getBindGroupLayout(0),
          entries: [{
            binding: 0,
            resource: { buffer: uniformBuffer }
          },
          {
            binding: 1,
            resource: { buffer: cellStateStorage[0] }
          }],
        }),
        res.device.createBindGroup({
          label: "Cell renderer bind group",
          layout: cellPipeline.getBindGroupLayout(0),
          entries: [{
            binding: 0,
            resource: { buffer: uniformBuffer }
          },
          {
            binding: 1,
            resource: { buffer: cellStateStorage[1] }
          }],
        })
      ]
      
      // pass.setPipeline(cellPipeline);
      // pass.setVertexBuffer(0, vertexBuffer);

      // pass.setBindGroup(0, bindGroup);
      // pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE);

      // // // before pass.end()
      // pass.end();
      
      // res.device.queue.submit([encoder.finish()]);

      const UPDATE_INTERVAL = 200; // 200 ms
      let step = 0;

      function updateGrid() {
        step++;

        // Start a render pass 
        const encoder = res.device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            loadOp: "clear",
            clearValue: { r: 0, g: 0, b: 0.4, a: 1.0 },
            storeOp: "store",
          }]
        });

        // Draw the grid.
        pass.setPipeline(cellPipeline);
        pass.setBindGroup(0, bindGroups[step % 2]); // Updated!
        pass.setVertexBuffer(0, vertexBuffer);
        pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE);

        // End the render pass and submit the command buffer
        pass.end();
        res.device.queue.submit([encoder.finish()]);
      }
      setInterval(updateGrid, UPDATE_INTERVAL);
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