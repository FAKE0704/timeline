// 着色器源代码
const vsSource = `
  attribute vec2 aPosition;
  attribute vec3 aColor;
  varying vec3 vColor;
  uniform vec2 uCanvasSize;
  
  void main() {
    vec2 normalizedPos = vec2(
        (aPosition.x / uCanvasSize.x) * 2.0 - 1.0,
        1.0 - (aPosition.y / uCanvasSize.y) * 2.0
    );
    gl_Position = vec4(normalizedPos, 0.0, 1.0);
    gl_PointSize = 30.0;
    vColor = aColor;
  }`;

const fsSource = `
  precision mediump float;
  varying vec3 vColor;
  
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) {
        discard;
    }
    gl_FragColor = vec4(vColor, 1.0);
  }`;

// 全局变量声明
let gl;
let currentBuffers = [];
let timelineData = [];
let isRendering = false;
let animationFrameId = null;
let lastRenderTime = 0;
const renderInterval = 1000 / 60; // 60 FPS
let needsRedraw = true;
let positionLocation, colorLocation, uCanvasSizeLocation;
let yOffset = 0; // Y轴偏移量

// 获取canvas元素
const canvas = document.getElementById('timeline-canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 初始化WebGL上下文
function initWebGLContext() {
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    throw new Error('WebGL初始化失败');
  }
  return gl;
}

// 初始化着色器程序
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error('着色器程序链接失败: ' + gl.getProgramInfoLog(shaderProgram));
  }
  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error('编译着色器时出错: ' + gl.getShaderInfoLog(shader));
  }
  return shader;
}

// 初始化应用程序
function initApplication() {
  gl = initWebGLContext();
  if (!gl) return;

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  if (!shaderProgram) return;

  gl.useProgram(shaderProgram);
  positionLocation = gl.getAttribLocation(shaderProgram, 'aPosition');
  colorLocation = gl.getAttribLocation(shaderProgram, 'aColor');
  uCanvasSizeLocation = gl.getUniformLocation(shaderProgram, 'uCanvasSize');
  
  gl.uniform2f(uCanvasSizeLocation, canvas.width, canvas.height);
}

// 解析Markdown内容
function parseMarkdown(content) {
  const events = [];
  for (const line of content.split('\n')) {
    const match = line.match(/^(\d{4}[-\/]\d{2}[-\/]\d{2})(?:\s+(\d{1,2}:\d{2})?)?:\s+(.+)$/);
    if (match) {
      const date = match[1].replace('/', '-');
      const time = match[2] || '12:00';
      const timestamp = new Date(`${date}T${time}`).getTime();
      
      if (!isNaN(timestamp)) {
        events.push({
          timestamp: timestamp,
          title: match[3],
          type: 'event',
          color: [0.2, 0.4, 1.0]
        });
      }
    }
  }
  return events;
}

// 坐标系转换
function timeToPixel(timestamp) {
  if (timelineData.length === 0 || isNaN(timestamp)) {
    return canvas.width / 2;
  }
  
  const events = timelineData.map(e => e.timestamp);
  const start = Math.min(...events);
  const end = Math.max(...events);
  const range = end - start || 1;
  
  return ((timestamp - start) / range) * canvas.width * 0.8 + canvas.width * 0.1;
}

// 创建缓冲区
const createBuffer = (data) => {
  if (!gl) return null;
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  return buffer;
};

// 初始化时间轴
function initTimeline() {
  cleanupBuffers();
  
  const positions = timelineData.map(event => [
    timeToPixel(event.timestamp),
    (Math.random() * 30 - 15) + yOffset  // 应用Y轴偏移
  ]).flat();

  const colors = timelineData.map(event => event.color).flat();

  const newPositionBuffer = createBuffer(positions);
  const newColorBuffer = createBuffer(colors);

  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, newPositionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(colorLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, newColorBuffer);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  needsRedraw = true;
  if (timelineData.length > 0 && !isRendering) {
    isRendering = true;
    render();
  }
}

// 渲染循环
function render(timestamp) {
  if (timestamp - lastRenderTime < renderInterval && !needsRedraw) {
    animationFrameId = requestAnimationFrame(render);
    return;
  }
  lastRenderTime = timestamp;
  needsRedraw = false;

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.95, 0.95, 0.95, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (timelineData.length > 0) {
    // 只在需要重绘时输出中心坐标
    const firstX = timeToPixel(timelineData[0].timestamp);
    const lastX = timeToPixel(timelineData[timelineData.length - 1].timestamp);
    const baselineY = canvas.height * 0.85 + yOffset;
    
    if (needsRedraw) {
      const centerX = (firstX + lastX) / 2;
      console.log('时间轴中心坐标:', {x: centerX, y: baselineY});
    }

    // 绘制基线
    const baselineVertices = [
      firstX, baselineY,
      lastX, baselineY
    ];
    const baselineBuffer = createBuffer(baselineVertices);
    gl.drawArrays(gl.LINE_STRIP, 0, 2);

    // 绘制事件点
    gl.drawArrays(gl.POINTS, 0, timelineData.length);
  } else {
    stopRendering();
    return;
  }
  
  animationFrameId = requestAnimationFrame(render);
}

// 停止渲染循环
function stopRendering() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  isRendering = false;
}

// 清理旧缓冲区
function cleanupBuffers() {
  currentBuffers.forEach(buffer => gl.deleteBuffer(buffer));
  currentBuffers = [];
}

// 事件监听器初始化
function initEventListeners() {
  // 文件选择事件处理
  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        rawFileContent = e.target.result;
        const previewContent = document.getElementById('preview-content');
        if (previewContent) {
          const previewText = rawFileContent.slice(0, 500)
            .replace(/\n/g, '<br>')
            .replace(/ /g, '&nbsp;');
          previewContent.innerHTML = previewText + (rawFileContent.length > 500 ? '<br>...' : '');
        }
      };
      reader.readAsText(file);
    });
  }

  // 生成按钮事件处理
  const generateBtn = document.getElementById('generate-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      if (!rawFileContent) {
        alert('请先选择时间轴数据文件');
        return;
      }
      timelineData = parseMarkdown(rawFileContent);
      initTimeline();
    });
  }

  // 下移按钮事件处理
  const moveDownBtn = document.getElementById('move-down-btn');
  if (!moveDownBtn) {
    console.warn('未找到下移按钮，请确保HTML中存在id为"move-down-btn"的按钮');
  } else {
    moveDownBtn.addEventListener('click', () => {
      yOffset += 100;
      console.log(`时间轴已下移100像素，当前Y偏移: ${yOffset}`);
      if (timelineData.length > 0) {
        initTimeline(); // 重新初始化时间轴以应用偏移
      }
    });
  }
}

// 启动应用程序
initApplication();
initEventListeners();
