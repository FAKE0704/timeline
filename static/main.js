// 获取canvas元素
const canvas = document.getElementById('timeline-canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 初始化WebGL上下文
function initWebGLContext() {
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    throw new Error('WebGL初始化失败');
  }
  return gl;
}

// 数据存储
let rawFileContent = '';

// 文件选择事件处理
document.getElementById('file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) {
    console.log('未选择文件');
    return;
  }

  const reader = new FileReader();
    reader.onload = (e) => {
        rawFileContent = e.target.result;
        const previewContent = document.getElementById('preview-content');
        if (previewContent) {
        // 添加换行处理
        console.log('原始文件内容:', rawFileContent);
        const previewText = rawFileContent.slice(0, 500)
          .replace(/\n/g, '<br>')
          .replace(/ /g, '&nbsp;');
        console.log('处理后的预览内容:', previewText);
        previewContent.innerHTML = previewText + (rawFileContent.length > 500 ? '<br>...' : '');
        console.log('更新后的previewContent:', previewContent.innerHTML);
        }
        console.log('文件已加载，内容长度:', rawFileContent.length);
  };
  reader.readAsText(file);
});

// 生成按钮事件处理
document.getElementById('generate-btn').addEventListener('click', () => {
  console.log('生成按钮点击事件触发');
  console.log('当前rawFileContent:', rawFileContent);
  if (!rawFileContent) {
    alert('请先选择时间轴数据文件');
    return;
  }
  timelineData = parseMarkdown(rawFileContent);
  initTimeline();
});

// 解析Markdown内容
function parseMarkdown(content) {
  const events = [];
  console.log('开始解析Markdown内容');
  for (const line of content.split('\n')) {
    const match = line.match(/^(\d{4}[-\/]\d{2}[-\/]\d{2})(?:\s+(\d{1,2}:\d{2})?)?:\s+(.+)$/);
    if (match) {
      const date = match[1].replace('/', '-');
      const time = match[2];
      const title = match[3];
      
      // 处理未指定时间的情况，默认设为中午12点
      const timePart = time || '12:00';
      const timestamp = new Date(`${date}T${timePart}`).getTime();
      if (isNaN(timestamp)) {
        console.warn('无效的时间格式:', date, time);
        continue;
      }
        
      console.log(`解析到事件: 日期=${date}, 时间=${time}, 标题=${title}, 时间戳=${timestamp}`);
        
      events.push({
        timestamp: timestamp,
        title: title,
        type: 'event',
        color: [0.2, 0.4, 1.0] // 默认蓝色
      });
    }
  }
  console.log('解析完成，共找到事件:', events.length);
  console.log('最后三个事件:', events.slice(-3));
  return events;
}

// 初始化事件数据
let timelineData = [];

// 坐标系转换
function timeToPixel(timestamp) {
  // 处理空数据情况
  if (timelineData.length === 0) {
    console.warn('时间轴数据为空，使用默认范围');
    return canvas.width / 2;
  }
  
  // 验证时间戳有效性
  if (isNaN(timestamp)) {
    console.warn('无效的时间戳:', timestamp);
    return 0;
  }
  
  // 扩展时间轴范围以包含所有事件
  const events = timelineData.map(e => e.timestamp);
  const start = Math.min(...events);
  const end = Math.max(...events);
  const range = end - start || 1; // 防止除零
  
  console.log(`时间轴范围: ${new Date(start).toLocaleString()} - ${new Date(end).toLocaleString()}`);
  
  // 将时间戳映射到画布宽度，留10%边距
  return ((timestamp - start) / range) * canvas.width * 0.8 + canvas.width * 0.1;
}

// 创建缓冲区
let gl; // 将gl声明为全局变量

const createBuffer = (data) => {
  if (!gl) {
    console.error('WebGL上下文未初始化');
    return null;
  }
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  return buffer;
};

// 着色器程序
const vsSource = `
  attribute vec2 aPosition;
  attribute vec3 aColor;
  varying vec3 vColor;
  uniform vec2 uCanvasSize;
  
  void main() {
    // 使用uniform传递动态尺寸
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



// 初始化时间轴
function initTimeline() {
  console.log('开始初始化时间轴');
  
  // 清理旧缓冲区
  cleanupBuffers();
  
  // 重新生成缓冲区数据
  // 生成Y坐标（在时间轴基线附近随机分布）
  const positions = timelineData.map(event => [
    timeToPixel(event.timestamp), // X坐标
    Math.random() * 50 - 25 // Y坐标（-25到25之间随机值）
  ]).flat();

  const colors = timelineData.map(event => event.color).flat();

  console.log('顶点数据:', positions.slice(0, 6)); // 显示前3个顶点的坐标
  console.log('颜色数据:', colors.slice(0, 9)); // 显示前3个颜色值

  // 创建新的缓冲区
  const newPositionBuffer = createBuffer(positions);
  const newColorBuffer = createBuffer(colors);

  console.log('顶点缓冲区:', newPositionBuffer);
  console.log('颜色缓冲区:', newColorBuffer);

  // 绑定顶点数据
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, newPositionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // 绑定颜色数据
  gl.enableVertexAttribArray(colorLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, newColorBuffer);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  console.log('顶点属性位置:', {
    position: positionLocation,
    color: colorLocation
  });

  // 仅在必要时启动渲染循环
  if (timelineData.length > 0 && !isRendering) {
    console.log('启动渲染循环');
    render();
  }
}

// 渲染控制相关变量
let isRendering = false;
let animationFrameId = null;

// 停止渲染循环
function stopRendering() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  isRendering = false;
}

// 渲染循环
function render() {
  // 设置视口和清除颜色
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.95, 0.95, 0.95, 1.0); // 浅灰色背景
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 统一坐标系统的基线绘制
  if (timelineData && timelineData.length > 0) {
    const baselineY = canvas.height * 0.95; // 底部5%位置
    const baselineVertices = [
      timeToPixel(timelineData[0].timestamp), baselineY,
      timeToPixel(timelineData[timelineData.length - 1].timestamp), baselineY
    ];
    const baselineBuffer = createBuffer(baselineVertices);
    gl.drawArrays(gl.LINE_STRIP, 0, 2);
  }
  // 添加调试绘制
  if (timelineData.length > 0) {
    if (!isRendering) {
      console.log('开始渲染循环');
      isRendering = true;
    }
    console.log('正在绘制', timelineData.length, '个事件');
    gl.drawArrays(gl.POINTS, 0, timelineData.length);
  } else {
    console.warn('没有可渲染的事件数据');
    stopRendering();
    return;
  }
  
  animationFrameId = requestAnimationFrame(render);
}

// 初始化着色器程序函数
function initShaderProgram(gl, vsSource, fsSource) {
  try {
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
  } catch (error) {
    console.error(error);
    return null;
  }
}

function loadShader(gl, type, source) {
  try {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error('编译着色器时出错: ' + gl.getShaderInfoLog(shader));
    }
    return shader;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// 视图控制参数
let viewScale = 1.0;
let viewOffset = [0, 0];
const minScale = 0.2;
const maxScale = 3.0;
let isDragging = false;
let lastMousePos = [0, 0];
let needsMatrixUpdate = true;
const viewSpeed = 0.1;

// 主初始化函数
function initApplication() {
  try {
    // 初始化WebGL
    gl = initWebGLContext();
    if (!gl) return;

    // 设置视口
    gl.viewport(0, 0, canvas.width, canvas.height);

    // 初始化着色器程序
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    if (!shaderProgram) {
      throw new Error('着色器程序初始化失败');
    }
    gl.useProgram(shaderProgram);

    // 获取attribute和uniform位置
    window.positionLocation = gl.getAttribLocation(shaderProgram, 'aPosition');
    window.colorLocation = gl.getAttribLocation(shaderProgram, 'aColor');
    window.uCanvasSizeLocation = gl.getUniformLocation(shaderProgram, 'uCanvasSize');
    
    // 初始传递画布尺寸
    gl.uniform2f(uCanvasSizeLocation, canvas.width, canvas.height);
    if (positionLocation === -1 || colorLocation === -1) {
      throw new Error('无法获取attribute位置');
    }


    document.getElementById('generate-btn').addEventListener('click', () => {
      console.log('生成按钮点击事件触发');
      console.log('当前rawFileContent:', rawFileContent);
      if (!rawFileContent) {
        alert('请先选择时间轴数据文件');
        return;
      }
      timelineData = parseMarkdown(rawFileContent);
      initTimeline();
    });

    // 开始渲染
    render();
    
  } catch (error) {
    console.error('应用程序初始化失败:', error);
    document.body.innerHTML = `<h1 style="color:red">初始化错误: ${error.message}</h1>`;
  }
}

// 处理窗口尺寸变化
function handleResize() {
  // 同步CSS尺寸和绘图缓冲区尺寸
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(uCanvasSizeLocation, canvas.width, canvas.height);
  console.log('画布尺寸已更新:', canvas.width, 'x', canvas.height);
  
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  if (shaderProgram) {
    gl.useProgram(shaderProgram);
  }
}

// 事件处理
function initEventListeners() {
  // 回到中心
  document.getElementById('center-btn').addEventListener('click', () => {
    viewScale = 1.0;
    viewOffset = [0, 0];
    render();
  });

  // 鼠标滚轮缩放
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(maxScale, Math.max(minScale, viewScale * zoomFactor));
    
    // 计算缩放中心点
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width * 2 - 1;
    const mouseY = (e.clientY - rect.top) / rect.height * 2 - 1;
    
    // 更新偏移量以保持缩放中心
    viewOffset[0] += (mouseX * (1/zoomFactor - 1)) * canvas.width/2;
    viewOffset[1] += (mouseY * (1/zoomFactor - 1)) * canvas.height/2;
    viewScale = newScale;
    
    render();
  }, {passive: true});

  // 鼠标拖拽平移
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMousePos = [e.clientX, e.clientY];
  });

  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const dx = (e.clientX - lastMousePos[0]) / viewScale;
      const dy = (e.clientY - lastMousePos[1]) / viewScale;
      viewOffset[0] -= dx;
      viewOffset[1] += dy;
      lastMousePos = [e.clientX, e.clientY];
      render();
    }
  });

  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  // 初始化应用程序
  initApplication();
  window.addEventListener('resize', handleResize);
}

// 启动应用程序
initEventListeners();

// 清理旧缓冲区
let currentBuffers = [];
function cleanupBuffers() {
  currentBuffers.forEach(buffer => gl.deleteBuffer(buffer));
  currentBuffers = [];
}
