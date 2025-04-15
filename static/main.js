// 获取canvas元素
const canvas = document.getElementById('timeline-canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 获取WebGL上下文
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) {
    alert('您的浏览器不支持WebGL');
    return null;
}

// 设置视口
gl.viewport(0, 0, canvas.width, canvas.height);

// 文件选择事件处理
document.getElementById('file-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const content = e.target.result;
    const events = parseMarkdown(content);
    timelineData = events;
    initTimeline();
  };
  reader.readAsText(file);
});

// 解析Markdown内容
function parseMarkdown(content) {
  const events = [];
  console.log('开始解析Markdown内容');
  for (const line of content.split('\n')) {
    const match = line.match(/^(\d{4}[-\/]\d{2}[-\/]\d{2})(?:\s+(\d{2}:\d{2}))?:\s+(.+)$/);
    if (match) {
      const date = match[1].replace('/', '-');
      const time = match[2];
      const title = match[3];
      
      const timestamp = time ? 
        new Date(`${date}T${time}`).getTime() :
        new Date(date).getTime();
        
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
  const start = new Date(2025, 3, 1).getTime();
  const end = new Date(2025, 3, 10).getTime();
  return (timestamp - start) / (end - start) * canvas.width;
}

// 创建缓冲区
const createBuffer = (data) => {
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
  
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    gl_PointSize = 20.0;
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

// 初始化着色器
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
if (!shaderProgram) {
  console.error('Failed to initialize shader program');
  return null;
}
gl.useProgram(shaderProgram);

// 获取attribute位置
const positionLocation = gl.getAttribLocation(shaderProgram, 'aPosition');
const colorLocation = gl.getAttribLocation(shaderProgram, 'aColor');

if (positionLocation === -1 || colorLocation === -1) {
  console.error('Failed to get attribute locations');
  return null;
}

// 初始化时间轴
function initTimeline() {
  console.log('开始初始化时间轴');
  
  // 重新生成缓冲区数据
  const positions = timelineData.map(event => [
    timeToPixel(event.timestamp), // X坐标
    0 // Y坐标（时间轴基线）
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

  // 开始渲染
  console.log('开始渲染时间轴');
  render();
}

// 渲染循环
function render() {
  requestAnimationFrame(render);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, timelineData.length);
}

// 初始化着色器程序函数
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('初始化着色器程序失败: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }
  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('编译着色器时出错: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// 初始渲染
render();
