// 获取canvas元素
const canvas = document.getElementById('timeline-canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 获取WebGL上下文
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) {
    alert('您的浏览器不支持WebGL');
}

// 设置视口
gl.viewport(0, 0, canvas.width, canvas.height);

// 生成测试数据
function generateTestData(count = 1000) {
  const start = new Date(2025, 3, 1).getTime();
  const end = new Date(2025, 3, 10).getTime();
  const events = [];
  
  for (let i = 0; i < count; i++) {
    events.push({
      timestamp: start + Math.random() * (end - start),
      type: ['meeting', 'milestone', 'alert'][Math.floor(Math.random() * 3)]
    });
  }
  return events.sort((a, b) => a.timestamp - b.timestamp);
}

// 初始化测试数据
const timelineData = generateTestData();

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

// 生成顶点数据
const positions = timelineData.map(event => [
  timeToPixel(event.timestamp), // X坐标
  0 // Y坐标（时间轴基线）
]).flat();

// 创建顶点缓冲区
const positionBuffer = createBuffer(positions);

// 着色器程序
const vsSource = `
  attribute vec2 aPosition;
  
  void main() {
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0); // 固定中心点
    gl_PointSize = 20.0;
    gl_PointParameteri(gl.POINT_SPRITE_COORD_ORIGIN, gl.LOWER_LEFT);
  }`;

const fsSource = `
  precision mediump float;
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // 红色
  }`;

// 初始化着色器
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
gl.useProgram(shaderProgram);

// 获取uniform位置并设置值
const aspectXLocation = gl.getUniformLocation(shaderProgram, 'uAspectX');
const aspectYLocation = gl.getUniformLocation(shaderProgram, 'uAspectY');
gl.uniform1f(aspectXLocation, canvas.width/2);
gl.uniform1f(aspectYLocation, canvas.height/2);

// 绑定顶点数据
const positionLocation = gl.getAttribLocation(shaderProgram, 'aPosition');
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// 渲染循环
function render() {
  requestAnimationFrame(render);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, timelineData.length);
}

render();

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
